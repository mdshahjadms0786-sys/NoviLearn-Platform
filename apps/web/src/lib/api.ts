import type {
  ApiError,
  AuthSession,
  LearningQuestion,
  LearningResponse,
  LoginInput,
  PracticeAnswerInput,
  PracticeConfig,
  PracticeEvaluation,
  PracticeResult,
  PracticeSet,
  SignupInput,
  User,
} from "@novilearn/types";

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

  const payload = (await response.json()) as {
    data?: T;
    error?: ApiError;
    success?: boolean;
  };

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
