import { z } from "zod";
export const uuidSchema = z.string().uuid();
export const uuid = (value) => value;
export const paginationParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});
export const environmentSchema = z.enum([
  "development",
  "staging",
  "production",
]);
export const logLevelSchema = z.enum(["debug", "info", "warn", "error"]);
export const emailSchema = z.string().email();
export const passwordSchema = z.string().min(8).max(128);
export const nameSchema = z.string().min(1).max(100);
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(128),
});
export const signupSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1).max(128),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export const learningQuestionSchema = z.object({
  question: z.string().trim().min(2).max(1000),
});
export const practiceDifficultySchema = z.enum(["easy", "medium", "hard"]);
export const practiceQuestionTypeSchema = z.enum([
  "mcq",
  "true_false",
  "short_answer",
]);
export const practiceQuestionModeSchema = z.enum([
  "mixed",
  "mcq",
  "true_false",
  "short_answer",
]);
export const practiceConfigSchema = z.object({
  topic: z.string().trim().min(2).max(100),
  questionCount: z.union([z.literal(5), z.literal(10)]).default(5),
  difficulty: practiceDifficultySchema.default("medium"),
  questionType: practiceQuestionModeSchema.default("mixed"),
});
export const practiceAnswerSchema = z.object({
  sessionId: z.string().trim().min(1).max(512),
  questionId: z.string().trim().min(1).max(64),
  answer: z.string().trim().min(1).max(2000),
});
export const practiceCompleteSchema = z.object({
  sessionId: z.string().trim().min(1).max(512),
});
export const progressHistoryLimitSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
});
export const practiceSessionIdParamSchema = z.string().uuid();
export const createApiResponse = (data, meta) => ({
  success: true,
  data,
  meta: {
    timestamp: new Date().toISOString(),
    requestId: crypto.randomUUID(),
    version: "1.0.0",
    ...meta,
  },
});
export const createApiError = (code, message, statusCode, details) => ({
  success: false,
  error: {
    code,
    message,
    statusCode,
    details,
  },
  meta: {
    timestamp: new Date().toISOString(),
    requestId: crypto.randomUUID(),
    version: "1.0.0",
  },
});
export const createPaginatedResponse = (data, page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
      version: "1.0.0",
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    },
  };
};
