import { emitAuthEvent } from "./auth-events";
import { API_URL } from "./config";
export class ApiClientError extends Error {
  constructor(error) {
    super(error.message);
    this.name = "ApiClientError";
    this.error = error;
  }
}
export async function apiClient(path, options = {}) {
  const headers = {};
  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (options.token !== undefined) {
    headers.Authorization = `Bearer ${options.token}`;
  }
  let payload;
  try {
    const response = await fetch(`${API_URL}${path}`, {
      method: options.method ?? "GET",
      headers,
      ...(options.body !== undefined
        ? {
            body: JSON.stringify(options.body),
          }
        : {}),
    });
    payload = await response.json();
    if (response.status === 401 && options.token !== undefined) {
      emitAuthEvent();
    }
    if (!response.ok || payload.success === false || payload.error) {
      throw new ApiClientError(
        payload.error ?? {
          code: "UNKNOWN_ERROR",
          message: "Something went wrong. Please try again.",
          statusCode: response.status,
        },
      );
    }
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    throw new ApiClientError({
      code: "NETWORK_ERROR",
      message:
        "Unable to reach the NoviLearn server. Please check your connection.",
      statusCode: 0,
    });
  }
  return payload.data;
}
export const authApi = {
  signup: (input) =>
    apiClient("/auth/signup", {
      method: "POST",
      body: input,
    }),
  login: (input) =>
    apiClient("/auth/login", {
      method: "POST",
      body: input,
    }),
  me: (token) =>
    apiClient("/auth/me", {
      token,
    }),
  logout: (token) =>
    apiClient("/auth/logout", {
      method: "POST",
      token,
    }),
};
export const aiApi = {
  learn: (token, input) =>
    apiClient("/ai/learn", {
      method: "POST",
      body: input,
      token,
    }),
};
export const practiceApi = {
  generate: (token, input) =>
    apiClient("/practice/generate", {
      method: "POST",
      body: input,
      token,
    }),
  answer: (token, input) =>
    apiClient("/practice/answer", {
      method: "POST",
      body: input,
      token,
    }),
  complete: (token, sessionId) =>
    apiClient("/practice/complete", {
      method: "POST",
      body: {
        sessionId,
      },
      token,
    }),
};
export const progressApi = {
  summary: (token) =>
    apiClient("/progress/summary", {
      token,
    }),
  learningHistory: (token, limit = 50) =>
    apiClient(`/progress/history/learning?limit=${limit}`, {
      token,
    }),
  practiceHistory: (token, limit = 50) =>
    apiClient(`/progress/history/practice?limit=${limit}`, {
      token,
    }),
  practiceDetail: (token, sessionId) =>
    apiClient(`/progress/history/practice/${encodeURIComponent(sessionId)}`, {
      token,
    }),
  topics: (token) =>
    apiClient("/progress/topics", {
      token,
    }),
  suggestions: (token) =>
    apiClient("/progress/suggestions", {
      token,
    }),
};
