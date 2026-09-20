import type {
  PracticeConfig,
  PracticeEvaluation,
  PracticeQuestionResult,
  PracticeResult,
  PracticeSet,
} from "@novilearn/types";

import { completeProviderRequest } from "../ai/ai.service";
import { buildPracticeMessages } from "../ai/prompts/practice";
import { AppError } from "../errors";
import { evaluateAnswer } from "./evaluator";
import { normalizePracticeQuestions } from "./practice.normalizer";
import {
  toClientPracticeSet,
  type InternalPracticeQuestion,
} from "./practice.types";
import {
  createPracticeSession,
  getValidPracticeSession,
} from "./session-store";

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
  const session = getValidPracticeSession(sessionId, userId);
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
  const session = getValidPracticeSession(sessionId, userId);

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

  return {
    sessionId: session.sessionId,
    topic: session.topic,
    totalQuestions,
    correctAnswers,
    incorrectAnswers,
    accuracy,
    score: correctAnswers,
    results,
  };
}
