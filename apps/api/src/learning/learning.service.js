import { completeProviderRequest } from "../ai/ai.service.js";
import { normalizeProviderResponse } from "../ai/normalizer.js";
import { buildTutorMessages } from "../ai/prompts/system.js";
import { AppError } from "../errors.js";
import { prisma } from "../prisma.js";
import { recordLearningActivity } from "../progress/progress.service.js";
import { normalizeTopic } from "../utils/topic.js";

async function getPersonalizedSystemModifier(userId) {
  const pref = await prisma.userPreference.findUnique({ where: { userId } });
  const avatar = await prisma.userAvatar.findFirst({
    where: { userId, isActive: true },
  });

  let modifier = "";
  if (avatar && avatar.avatarData && avatar.avatarData.presetId) {
    modifier += `Your persona is ${avatar.avatarData.presetId.toUpperCase()}, an engaging AI learning guide. `;
  }
  if (pref) {
    if (pref.language && pref.language !== "english") {
      modifier += `Respond in ${pref.language.toUpperCase()} (blend of English & ${pref.language}). `;
    }
    if (pref.teachingStyle) {
      modifier += `Use a ${pref.teachingStyle.toUpperCase()} teaching style. `;
    }
    if (pref.explanationLevel) {
      modifier += `Target explanation depth to ${pref.explanationLevel.toUpperCase()} level. `;
    }
  }
  return modifier;
}

export async function createSession(userId, topic) {
  const normTopic = normalizeTopic(topic);
  const title = `Learning: ${topic}`;

  const session = await prisma.learningSession.create({
    data: {
      userId,
      topic: normTopic,
      title,
      messages: {
        create: {
          role: "user",
          content: topic,
        },
      },
    },
    include: {
      messages: true,
    },
  });

  const preferenceModifier = await getPersonalizedSystemModifier(userId);
  const tutorMessages = buildTutorMessages(topic);

  if (preferenceModifier && tutorMessages.system) {
    tutorMessages.system += `\n\n[Personalization Preferences]: ${preferenceModifier}`;
  }

  const raw = await completeProviderRequest({
    messages: tutorMessages,
  });
  const response = normalizeProviderResponse(topic, raw);

  await prisma.learningMessage.create({
    data: {
      sessionId: session.id,
      role: "assistant",
      content: typeof raw === "string" ? raw : JSON.stringify(raw),
      metadata: response,
    },
  });

  await recordLearningActivity(
    userId,
    normTopic,
    response.relatedConcepts,
    response.nextLearning,
  );

  return getSession(userId, session.id);
}

export async function getSession(userId, sessionId) {
  const session = await prisma.learningSession.findUnique({
    where: { id: sessionId },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!session)
    throw new AppError(404, "SESSION_NOT_FOUND", "Session not found");
  if (session.userId !== userId)
    throw new AppError(403, "FORBIDDEN", "Unauthorized access to session");

  const isSaved = await prisma.savedLearning.findUnique({
    where: { userId_sessionId: { userId, sessionId } },
  });

  return { ...session, isSaved: !!isSaved };
}

export async function listSessions(userId, limit = 20) {
  const sessions = await prisma.learningSession.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: {
      _count: { select: { messages: true } },
    },
  });

  return sessions.map((s) => ({
    id: s.id,
    topic: s.topic,
    title: s.title,
    status: s.status,
    messageCount: s._count.messages,
    lastUpdatedAt: s.updatedAt,
    createdAt: s.createdAt,
  }));
}

export async function sendMessage(
  userId,
  sessionId,
  content,
  mode = "default",
) {
  const session = await prisma.learningSession.findUnique({
    where: { id: sessionId },
    include: { messages: { orderBy: { createdAt: "asc" }, take: 10 } },
  });

  if (!session)
    throw new AppError(404, "SESSION_NOT_FOUND", "Session not found");
  if (session.userId !== userId)
    throw new AppError(403, "FORBIDDEN", "Unauthorized access to session");

  await prisma.learningMessage.create({
    data: {
      sessionId,
      role: "user",
      content,
      mode,
    },
  });

  const preferenceModifier = await getPersonalizedSystemModifier(userId);

  let modeInstruction = "";
  if (mode === "simple")
    modeInstruction =
      "Explain in very simple terms, like teaching a 10-year-old beginner.";
  else if (mode === "detailed")
    modeInstruction =
      "Provide a comprehensive, highly detailed academic explanation with deep background.";
  else if (mode === "example")
    modeInstruction =
      "Focus heavily on real-world examples, practical code/scenarios, and step-by-step applications.";
  else if (mode === "visual")
    modeInstruction =
      "Include a step-by-step visual flowchart sequence and textual node diagram.";
  else if (mode === "exam")
    modeInstruction =
      "Highlight exam-relevant key definitions, core formulas, common pitfalls, and test tips.";
  else if (mode === "hinglish")
    modeInstruction =
      "Explain in conversational Hinglish (blend of Hindi and English).";

  const conversationHistory = session.messages
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n");

  const prompt = `Topic: ${session.topic}\nRequest: ${content}\nMode: ${mode}\nMode Instruction: ${modeInstruction}\n\nPrevious conversation:\n${conversationHistory}`;

  const tutorMessages = buildTutorMessages(session.topic);
  if (tutorMessages.system) {
    tutorMessages.system += `\n\n[Session Follow-up Mode]: ${modeInstruction}\n[Mode]: ${mode}\n[Personalization]: ${preferenceModifier}`;
  }
  tutorMessages.user = prompt;

  const raw = await completeProviderRequest({ messages: tutorMessages });
  const response = normalizeProviderResponse(session.topic, raw);

  const assistantMessage = await prisma.learningMessage.create({
    data: {
      sessionId,
      role: "assistant",
      content: typeof raw === "string" ? raw : JSON.stringify(raw),
      metadata: response,
      mode,
    },
  });

  await prisma.learningSession.update({
    where: { id: sessionId },
    data: { updatedAt: new Date() },
  });

  await recordLearningActivity(
    userId,
    session.topic,
    response.relatedConcepts,
    response.nextLearning,
  );

  return getSession(userId, sessionId);
}

export async function saveSession(userId, sessionId) {
  const session = await prisma.learningSession.findUnique({
    where: { id: sessionId },
  });
  if (!session)
    throw new AppError(404, "SESSION_NOT_FOUND", "Session not found");
  if (session.userId !== userId)
    throw new AppError(403, "FORBIDDEN", "Unauthorized");

  await prisma.savedLearning.upsert({
    where: { userId_sessionId: { userId, sessionId } },
    create: { userId, sessionId },
    update: {},
  });

  return { success: true, saved: true };
}

export async function unsaveSession(userId, sessionId) {
  try {
    await prisma.savedLearning.delete({
      where: { userId_sessionId: { userId, sessionId } },
    });
  } catch {
    // Ignore if not present
  }
  return { success: true, saved: false };
}

export async function listSavedSessions(userId, limit = 20) {
  const savedList = await prisma.savedLearning.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      session: {
        include: {
          _count: { select: { messages: true } },
        },
      },
    },
  });

  return savedList.map((item) => ({
    id: item.session.id,
    topic: item.session.topic,
    title: item.session.title,
    messageCount: item.session._count.messages,
    savedAt: item.createdAt,
  }));
}
