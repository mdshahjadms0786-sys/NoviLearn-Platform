import { AppError } from "../errors.js";
import { prisma } from "../prisma.js";

export const getPreferences = async (userId) => {
  let prefs = await prisma.userPreference.findUnique({
    where: { userId },
  });

  if (!prefs) {
    prefs = await prisma.userPreference.create({
      data: {
        userId,
        language: "english",
        explanationLevel: "balanced",
        teachingStyle: "friendly",
        learningGoals: null,
      },
    });
  }

  return prefs;
};

export const updatePreferences = async (userId, updates) => {
  const allowedUpdates = {};

  if (updates.language) {
    if (!["english", "hindi", "hinglish"].includes(updates.language)) {
      throw new AppError("Invalid language", 400);
    }
    allowedUpdates.language = updates.language;
  }

  if (updates.explanationLevel) {
    if (
      !["simple", "balanced", "detailed", "advanced"].includes(
        updates.explanationLevel,
      )
    ) {
      throw new AppError("Invalid explanation level", 400);
    }
    allowedUpdates.explanationLevel = updates.explanationLevel;
  }

  if (updates.teachingStyle) {
    if (
      !["friendly", "formal", "casual", "strict"].includes(
        updates.teachingStyle,
      )
    ) {
      throw new AppError("Invalid teaching style", 400);
    }
    allowedUpdates.teachingStyle = updates.teachingStyle;
  }

  if (updates.learningGoals !== undefined) {
    allowedUpdates.learningGoals = updates.learningGoals;
  }

  return prisma.userPreference.upsert({
    where: { userId },
    update: allowedUpdates,
    create: {
      userId,
      language: allowedUpdates.language || "english",
      explanationLevel: allowedUpdates.explanationLevel || "balanced",
      teachingStyle: allowedUpdates.teachingStyle || "friendly",
      learningGoals: allowedUpdates.learningGoals || null,
    },
  });
};

export const getAvailableAvatars = () => {
  return [
    {
      id: "nova",
      name: "Nova",
      description: "Friendly AI companion",
      style: "modern",
      previewEmoji: "🤖",
    },
    {
      id: "sage",
      name: "Sage",
      description: "Wise and patient teacher",
      style: "classic",
      previewEmoji: "🧑‍🏫",
    },
    {
      id: "spark",
      name: "Spark",
      description: "Energetic and fun tutor",
      style: "playful",
      previewEmoji: "⚡",
    },
    {
      id: "zen",
      name: "Zen",
      description: "Calm and focused mentor",
      style: "minimal",
      previewEmoji: "🧘",
    },
    {
      id: "pixel",
      name: "Pixel",
      description: "Tech-savvy guide",
      style: "tech",
      previewEmoji: "💻",
    },
  ];
};

export const setActiveAvatar = async (
  userId,
  avatarId,
  avatarType = "preset",
) => {
  if (avatarType === "preset") {
    const available = getAvailableAvatars();
    const preset = available.find((a) => a.id === avatarId);
    if (!preset) {
      throw new AppError("Invalid preset avatar ID", 400);
    }
  }

  await prisma.userAvatar.updateMany({
    where: { userId, isActive: true },
    data: { isActive: false },
  });

  const existingAvatar = await prisma.userAvatar.findFirst({
    where: {
      userId,
      avatarType,
      avatarData: { equals: { presetId: avatarId } },
    },
  });

  if (existingAvatar) {
    return prisma.userAvatar.update({
      where: { id: existingAvatar.id },
      data: { isActive: true },
    });
  }

  return prisma.userAvatar.create({
    data: {
      userId,
      avatarType,
      isActive: true,
      avatarData: { presetId: avatarId },
    },
  });
};

export const getActiveAvatar = async (userId) => {
  const avatar = await prisma.userAvatar.findFirst({
    where: { userId, isActive: true },
  });

  if (!avatar) {
    return {
      userId,
      avatarType: "preset",
      isActive: true,
      avatarData: { presetId: "nova" },
    };
  }

  return avatar;
};

export const buildSystemPromptModifier = async (userId) => {
  const prefs = await getPreferences(userId);
  const avatar = await getActiveAvatar(userId);

  const isDefaultPrefs =
    prefs.language === "english" &&
    prefs.explanationLevel === "balanced" &&
    prefs.teachingStyle === "friendly" &&
    !prefs.learningGoals;
  const isDefaultAvatar =
    avatar.avatarType === "preset" && avatar.avatarData.presetId === "nova";

  if (isDefaultPrefs && isDefaultAvatar) {
    return null;
  }

  let modifier = `The student prefers ${prefs.explanationLevel} explanations in ${prefs.language}. `;
  modifier += `Use a ${prefs.teachingStyle} teaching style. `;

  if (
    prefs.learningGoals &&
    Array.isArray(prefs.learningGoals) &&
    prefs.learningGoals.length > 0
  ) {
    modifier += `The student's learning goals are: ${prefs.learningGoals.join(", ")}. `;
  }

  if (avatar.avatarType === "preset") {
    const preset = getAvailableAvatars().find(
      (a) => a.id === avatar.avatarData.presetId,
    );
    if (preset) {
      modifier += `You are ${preset.name}, a ${preset.description}.`;
    }
  }

  return modifier.trim();
};
