import { completeProviderRequest } from "../ai/ai.service.js";
import { buildPracticeMessages } from "../ai/prompts/practice.js";
import { AppError } from "../errors.js";
import { prisma } from "../prisma.js";
import { evaluateAnswer } from "./evaluator.js";
import { normalizePracticeQuestions } from "./practice.normalizer.js";
import { toClientPracticeSet } from "./practice.types.js";
import {
  createPracticeSession,
  getValidPracticeSession,
  savePracticeSession,
} from "./session-store.js";
import { upsertTopic } from "../progress/topics.js";
import { normalizeTopic } from "../utils/topic.js";
const PRACTICE_MAX_TOKENS = 2500;
export async function generatePracticeSet(userId, config) {
  const raw = await completeProviderRequest({
    messages: buildPracticeMessages(config),
    maxTokens: PRACTICE_MAX_TOKENS,
  });
  const questions = normalizePracticeQuestions(config, raw);
  const session = createPracticeSession(userId, config, questions);
  return toClientPracticeSet(session);
}
export async function answerPracticeQuestion(
  userId,
  sessionId,
  questionId,
  answer,
) {
  const session = await getValidPracticeSession(sessionId, userId);
  const question = session.questions.find((q) => q.id === questionId);
  if (question === undefined) {
    throw new AppError(
      400,
      "PRACTICE_QUESTION_NOT_FOUND",
      "Question not found in this practice session",
    );
  }
  const existing = session.answers.get(questionId);
  const correct = existing?.correct ?? evaluateAnswer(question, answer);
  if (existing === undefined) {
    session.answers.set(questionId, {
      questionId,
      answer,
      correct,
    });
    await savePracticeSession(session);
  }
  return {
    questionId,
    correct,
    explanation: question.explanation,
    correctAnswer: question.correctAnswer,
  };
}
export async function completePracticeSession(userId, sessionId) {
  const session = await getValidPracticeSession(sessionId, userId);
  const totalQuestions = session.questions.length;
  const answered = [...session.answers.values()];
  const correctAnswers = answered.filter((answer) => answer.correct).length;
  const incorrectAnswers = answered.length - correctAnswers;
  const accuracy =
    totalQuestions === 0
      ? 0
      : Math.round((correctAnswers / totalQuestions) * 100);
  const results = session.questions.map((question) => {
    const recorded = session.answers.get(question.id);
    return {
      questionId: question.id,
      correct: recorded?.correct ?? false,
      answer: recorded?.answer ?? "",
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
    };
  });
  const result = {
    sessionId: session.sessionId,
    topic: normalizeTopic(session.topic),
    totalQuestions,
    correctAnswers,
    incorrectAnswers,
    accuracy,
    score: correctAnswers,
    results,
  };
  await persistPracticeResult(userId, session, result);
  await upsertTopic(result.topic);
  return result;
}
async function persistPracticeResult(userId, session, result) {
  const enrichedResults = session.questions.map((question) => {
    const recorded = session.answers.get(question.id);
    return {
      questionId: question.id,
      question: question.question,
      type: question.type,
      correct: recorded?.correct ?? false,
      answer: recorded?.answer ?? "",
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
    };
  });
  try {
    await prisma.practiceSession.create({
      data: {
        id: session.sessionId,
        userId,
        topic: result.topic,
        questionCount: session.config.questionCount,
        difficulty: session.config.difficulty,
        questionType: session.config.questionType,
        totalQuestions: result.totalQuestions,
        correctAnswers: result.correctAnswers,
        incorrectAnswers: result.incorrectAnswers,
        accuracy: result.accuracy,
        score: result.score,
        results: enrichedResults,
      },
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return;
    }
    throw error;
  }
}
