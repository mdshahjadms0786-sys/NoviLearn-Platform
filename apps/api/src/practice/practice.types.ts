import type {
  PracticeConfig,
  PracticeQuestion,
  PracticeQuestionType,
} from "@novilearn/types";

export interface InternalPracticeQuestion {
  id: string;
  type: PracticeQuestionType;
  question: string;
  options?: string[];
  correctAnswer: string;
  acceptedAnswers: string[];
  explanation: string;
}

export interface RecordedAnswer {
  questionId: string;
  answer: string;
  correct: boolean;
}

export interface PracticeSessionRecord {
  sessionId: string;
  userId: string;
  topic: string;
  config: PracticeConfig;
  questions: InternalPracticeQuestion[];
  expiresAt: number;
  answers: Map<string, RecordedAnswer>;
}

export function toClientQuestion(
  question: InternalPracticeQuestion,
): PracticeQuestion {
  return {
    id: question.id,
    type: question.type,
    question: question.question,
    ...(question.options !== undefined ? { options: question.options } : {}),
  };
}

export function toClientPracticeSet(session: PracticeSessionRecord) {
  return {
    sessionId: session.sessionId,
    topic: session.topic,
    config: session.config,
    questions: session.questions.map(toClientQuestion),
  };
}
