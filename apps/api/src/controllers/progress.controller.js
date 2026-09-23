import { createApiResponse } from "@novilearn/shared";
import {
  practiceSessionIdParamSchema,
  progressHistoryLimitSchema,
} from "@novilearn/shared";

import { AppError } from "../errors.js";
import {
  getPracticeHistoryDetail,
  getProgressSummary,
  getSuggestions,
  getTopicProgress,
  listLearningHistory,
  listPracticeHistory,
} from "../progress/progress.service.js";
import { asyncHandler } from "../utils/async-handler.js";
function parseLimit(req) {
  const parsed = progressHistoryLimitSchema.safeParse(req.query);
  if (!parsed.success) {
    throw new AppError(
      400,
      "VALIDATION_ERROR",
      "Invalid query parameters",
      parsed.error.flatten().fieldErrors,
    );
  }
  return parsed.data.limit;
}
function parseSessionId(req) {
  const parsed = practiceSessionIdParamSchema.safeParse(req.params.id);
  if (!parsed.success) {
    throw new AppError(400, "VALIDATION_ERROR", "Invalid session id", {
      id: parsed.error.flatten().formErrors,
    });
  }
  return parsed.data;
}
export const progressSummaryController = asyncHandler(async (req, res) => {
  const authenticated = req;
  const summary = await getProgressSummary(authenticated.user.id);
  res.status(200).json(createApiResponse(summary));
});
export const learningHistoryController = asyncHandler(async (req, res) => {
  const authenticated = req;
  const limit = parseLimit(req);
  const activities = await listLearningHistory(authenticated.user.id, limit);
  res.status(200).json(createApiResponse(activities));
});
export const practiceHistoryController = asyncHandler(async (req, res) => {
  const authenticated = req;
  const limit = parseLimit(req);
  const sessions = await listPracticeHistory(authenticated.user.id, limit);
  res.status(200).json(createApiResponse(sessions));
});
export const practiceHistoryDetailController = asyncHandler(
  async (req, res) => {
    const authenticated = req;
    const sessionId = parseSessionId(req);
    const detail = await getPracticeHistoryDetail(
      authenticated.user.id,
      sessionId,
    );
    res.status(200).json(createApiResponse(detail));
  },
);
export const topicProgressController = asyncHandler(async (req, res) => {
  const authenticated = req;
  const topics = await getTopicProgress(authenticated.user.id);
  res.status(200).json(createApiResponse(topics));
});
export const suggestionsController = asyncHandler(async (req, res) => {
  const authenticated = req;
  const suggestions = await getSuggestions(authenticated.user.id);
  res.status(200).json(createApiResponse(suggestions));
});
