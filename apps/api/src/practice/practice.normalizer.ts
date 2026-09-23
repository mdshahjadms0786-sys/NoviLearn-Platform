import { z } from "zod";

import type { PracticeConfig } from "@novilearn/types";

import { AppError } from "../errors";
import { logger } from "../logger";
import type { InternalPracticeQuestion } from "./practice.types";
import { normalizeMatchText } from "./text";

const questionBaseSchema = z.object({
  question: z.string(),
  explanation: z.string(),
});

const mcqQuestionSchema = questionBaseSchema.extend({
  type: z.literal("mcq"),
  options: z.array(z.string()),
  correctAnswer: z.string(),
});

const trueFalseQuestionSchema = questionBaseSchema.extend({
  type: z.literal("true_false"),
  correctAnswer: z.string(),
  options: z.array(z.string()).optional(),
});

const shortAnswerQuestionSchema = questionBaseSchema.extend({
  type: z.literal("short_answer"),
  correctAnswer: z.union([z.string(), z.array(z.string())]),
  options: z.array(z.string()).optional(),
});

const questionSchema = z.discriminatedUnion("type", [
  mcqQuestionSchema,
  trueFalseQuestionSchema,
  shortAnswerQuestionSchema,
]);

const providerResponseSchema = z.object({
  questions: z.array(questionSchema),
});

export function invalidResponse(): AppError {
  return new AppError(
    502,
    "AI_RESPONSE_INVALID",
    "Practice is temporarily unavailable",
  );
}

interface NormalizedQuestionRecord {
  type: "mcq" | "true_false" | "short_answer";
  question: string;
  options?: string[];
  correctAnswer: string;
  acceptedAnswers: string[];
  explanation: string;
}

function cleanMcq(
  raw: z.infer<typeof mcqQuestionSchema>,
): NormalizedQuestionRecord {
  const options: string[] = [];
  for (const option of raw.options) {
    const trimmed = option.trim();
    if (trimmed === "") {
      continue;
    }
    const duplicate = options.some(
      (existing) =>
        normalizeMatchText(existing) === normalizeMatchText(trimmed),
    );
    if (!duplicate) {
      options.push(trimmed);
    }
  }

  if (options.length < 2) {
    throw invalidResponse();
  }

  const match = options.find(
    (option) =>
      normalizeMatchText(option) === normalizeMatchText(raw.correctAnswer),
  );
  if (match === undefined) {
    throw invalidResponse();
  }

  return {
    type: "mcq",
    question: raw.question.trim(),
    options,
    correctAnswer: match,
    acceptedAnswers: [match],
    explanation: raw.explanation.trim(),
  };
}

function cleanTrueFalse(
  raw: z.infer<typeof trueFalseQuestionSchema>,
): NormalizedQuestionRecord {
  const normalized = normalizeMatchText(raw.correctAnswer);
  if (normalized !== "true" && normalized !== "false") {
    throw invalidResponse();
  }

  const canonical = normalized === "true" ? "True" : "False";

  return {
    type: "true_false",
    question: raw.question.trim(),
    options: ["True", "False"],
    correctAnswer: canonical,
    acceptedAnswers: [canonical],
    explanation: raw.explanation.trim(),
  };
}

function cleanShortAnswer(
  raw: z.infer<typeof shortAnswerQuestionSchema>,
): NormalizedQuestionRecord {
  const rawAccepted = Array.isArray(raw.correctAnswer)
    ? raw.correctAnswer
    : [raw.correctAnswer];
  const acceptedAnswers: string[] = [];
  for (const candidate of rawAccepted) {
    const trimmed = candidate.trim();
    if (trimmed === "" || normalizeAnswerPresent(acceptedAnswers, trimmed)) {
      continue;
    }
    acceptedAnswers.push(trimmed);
  }

  const primary = acceptedAnswers[0];
  if (primary === undefined) {
    throw invalidResponse();
  }

  return {
    type: "short_answer",
    question: raw.question.trim(),
    correctAnswer: primary,
    acceptedAnswers,
    explanation: raw.explanation.trim(),
  };
}

function normalizeAnswerPresent(
  accepted: string[],
  candidate: string,
): boolean {
  const normalizedCandidate = normalizeMatchText(candidate);
  return accepted.some(
    (existing) => normalizeMatchText(existing) === normalizedCandidate,
  );
}

function cleanQuestion(
  raw: z.infer<typeof questionSchema>,
): NormalizedQuestionRecord {
  if (raw.question.trim() === "" || raw.explanation.trim() === "") {
    throw invalidResponse();
  }

  switch (raw.type) {
    case "mcq":
      return cleanMcq(raw);
    case "true_false":
      return cleanTrueFalse(raw);
    case "short_answer":
      return cleanShortAnswer(raw);
  }
}

export function normalizePracticeQuestions(
  config: PracticeConfig,
  rawContent: string,
): InternalPracticeQuestion[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawContent) as unknown;
  } catch {
    logger.error("[practice] response is not valid json");
    throw invalidResponse();
  }

  const result = providerResponseSchema.safeParse(parsed);
  if (!result.success) {
    logger.error("[practice] response does not match expected shape");
    throw invalidResponse();
  }

  const cleaned: NormalizedQuestionRecord[] = [];
  for (const rawQuestion of result.data.questions) {
    const normalized = cleanQuestion(rawQuestion);
    const duplicate = cleaned.some(
      (existing) =>
        normalizeMatchText(existing.question) ===
        normalizeMatchText(normalized.question),
    );
    if (!duplicate) {
      cleaned.push(normalized);
    }
  }

  const selected = cleaned.slice(0, config.questionCount);

  if (selected.length < config.questionCount) {
    logger.error("[practice] response has too few distinct questions");
    throw invalidResponse();
  }

  return selected.map((question, index) => ({
    id: `q${index + 1}`,
    type: question.type,
    question: question.question,
    ...(question.options !== undefined ? { options: question.options } : {}),
    correctAnswer: question.correctAnswer,
    acceptedAnswers: question.acceptedAnswers,
    explanation: question.explanation,
  }));
}
