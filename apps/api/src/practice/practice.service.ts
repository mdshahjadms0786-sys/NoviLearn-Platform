import { Prisma } from "@prisma/client";

import type {
  PracticeConfig,
  PracticeEvaluation,
  PracticeHistoryResultRow,
  PracticeQuestionResult,
  PracticeResult,
  PracticeSet,
} from "@novilearn/types";

import { completeProviderRequest } from "../ai/ai.service";
import { buildPracticeMessages } from "../ai/prompts/practice";
import { AppError } from "../errors";
import { prisma } from "../prisma";
import { evaluateAnswer } from "./evaluator";
import { normalizePracticeQuestions } from "./practice.normalizer";
import {
  toClientPracticeSet,
  type InternalPracticeQuestion,
  type PracticeSessionRecord,
} from "./practice.types";
import {
  createPracticeSession,
  getValidPracticeSession,
  savePracticeSession,
} from "./session-store";
import { upsertTopic } from "../progress/topics";
import { normalizeTopic } from "../utils/topic";

const PRACTICE_MAX_TOKENS = 2500;

export async function generatePracticeSet(
  userId: string,
  config: PracticeConfig,
): Promise<PracticeSet> {
  const raw = await completeProviderRequest({
    messages: buildPracticeMessages(config),
    maxTokens: PRACTICE_MAX_TOKENS,
  });

  const questions = normalizePracticeQuestions(config, raw);
  const session = createPracticeSession(userId, config, questions);

  return toClientPracticeSet(session);
}

export async function answerPracticeQuestion(
  userId: string,
  sessionId: string,
  questionId: string,
  answer: string,
): Promise<PracticeEvaluation> {
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
    session.answers.set(questionId, { questionId, answer, correct });
    await savePracticeSession(session);
  }

  return {
    questionId,
    correct,
    explanation: question.explanation,
    correctAnswer: question.correctAnswer,
  };
}

export async function completePracticeSession(
  userId: string,
  sessionId: string,
): Promise<PracticeResult> {
  const session = await getValidPracticeSession(sessionId, userId);

  const totalQuestions = session.questions.length;
  const answered = [...session.answers.values()];
  const correctAnswers = answered.filter((answer) => answer.correct).length;
  const incorrectAnswers = answered.length - correctAnswers;
  const accuracy =
    totalQuestions === 0
      ? 0
      : Math.round((correctAnswers / totalQuestions) * 100);

  const results: PracticeQuestionResult[] = session.questions.map(
    (question: InternalPracticeQuestion) => {
      const recorded = session.answers.get(question.id);
      return {
        questionId: question.id,
        correct: recorded?.correct ?? false,
        answer: recorded?.answer ?? "",
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
      };
    },
  );

  const result: PracticeResult = {
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

async function persistPracticeResult(
  userId: string,
  session: PracticeSessionRecord,
  result: PracticeResult,
): Promise<void> {
  const enrichedResults: PracticeHistoryResultRow[] = session.questions.map(
    (question: InternalPracticeQuestion) => {
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
    },
  );

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
        results: enrichedResults as unknown as Prisma.InputJsonValue,
      },
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: unknown }).code === "P2002"
    ) {
      return;
    }
    throw error;
  }
}
