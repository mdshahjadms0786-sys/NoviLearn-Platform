import type {
  ApiError,
  AuthSession,
  LearningActivity,
  LearningQuestion,
  LearningResponse,
  LoginInput,
  NextLearningSuggestion,
  PracticeAnswerInput,
  PracticeConfig,
  PracticeEvaluation,
  PracticeResult,
  PracticeSessionDetail,
  PracticeSessionSummary,
  PracticeSet,
  ProgressSummary,
  SignupInput,
  TopicProgress,
  User,
} from "@novilearn/types";

import { emitAuthEvent } from "./auth-events";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export class ApiClientError extends Error {
  readonly error: ApiError;

  constructor(error: ApiError) {
    super(error.message);
    this.name = "ApiClientError";
    this.error = error;
  }
}

interface ApiRequestOptions {
  method?: "GET" | "POST";
  body?: unknown;
  token?: string;
}

export async function apiClient<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {};
  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    ...(options.body !== undefined
      ? { body: JSON.stringify(options.body) }
      : {}),
  });

  let payload: {
    data?: T;
    error?: ApiError;
    success?: boolean;
  };
  try {
    payload = (await response.json()) as {
      data?: T;
      error?: ApiError;
      success?: boolean;
    };
  } catch {
    throw new ApiClientError({
      code: "UNKNOWN_ERROR",
      message: "The server returned an unexpected response",
      statusCode: response.status,
    });
  }

  if (response.status === 401 && options.token) {
    emitAuthEvent();
  }

  if (!response.ok || payload.success === false || payload.error) {
    throw new ApiClientError(
      payload.error ?? {
        code: "UNKNOWN_ERROR",
        message: "An unexpected error occurred",
        statusCode: response.status,
      },
    );
  }

  return payload.data as T;
}

export const authApi = {
  login: (input: LoginInput) =>
    apiClient<AuthSession>("/auth/login", { method: "POST", body: input }),
  signup: (input: SignupInput) =>
    apiClient<AuthSession>("/auth/signup", { method: "POST", body: input }),
  me: (token: string) => apiClient<User>("/auth/me", { token }),
  logout: (token: string) =>
    apiClient<null>("/auth/logout", { method: "POST", token }),
};

export const aiApi = {
  learn: (token: string, input: LearningQuestion) =>
    apiClient<LearningResponse>("/ai/learn", {
      method: "POST",
      body: input,
      token,
    }),
};

export const practiceApi = {
  generate: (token: string, input: PracticeConfig) =>
    apiClient<PracticeSet>("/practice/generate", {
      method: "POST",
      body: input,
      token,
    }),
  answer: (token: string, input: PracticeAnswerInput) =>
    apiClient<PracticeEvaluation>("/practice/answer", {
      method: "POST",
      body: input,
      token,
    }),
  complete: (token: string, sessionId: string) =>
    apiClient<PracticeResult>("/practice/complete", {
      method: "POST",
      body: { sessionId },
      token,
    }),
};

export const progressApi = {
  summary: (token: string) =>
    apiClient<ProgressSummary>("/progress/summary", { token }),
  learningHistory: (token: string, limit = 50) =>
    apiClient<LearningActivity[]>(`/progress/history/learning?limit=${limit}`, {
      token,
    }),
  practiceHistory: (token: string, limit = 50) =>
    apiClient<PracticeSessionSummary[]>(
      `/progress/history/practice?limit=${limit}`,
      {
        token,
      },
    ),
  practiceDetail: (token: string, sessionId: string) =>
    apiClient<PracticeSessionDetail>(
      `/progress/history/practice/${encodeURIComponent(sessionId)}`,
      { token },
    ),
  topics: (token: string) =>
    apiClient<TopicProgress[]>("/progress/topics", { token }),
  suggestions: (token: string) =>
    apiClient<NextLearningSuggestion[]>("/progress/suggestions", { token }),
};
