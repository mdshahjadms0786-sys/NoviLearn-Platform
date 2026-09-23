import { Router } from "express";

import {
  learningHistoryController,
  practiceHistoryController,
  practiceHistoryDetailController,
  progressSummaryController,
  suggestionsController,
  topicProgressController,
} from "../controllers/progress.controller.js";
import { authenticate } from "../middleware/auth.js";
import { createRateLimiter } from "../utils/rate-limit.js";
export const progressRouter = Router();
const PROGRESS_LIMITER = createRateLimiter({
  name: "progress",
  windowMs: 10 * 60 * 1000,
  max: 300,
  keyFor: (req) => req.user.id,
});
progressRouter.get(
  "/summary",
  authenticate,
  PROGRESS_LIMITER,
  progressSummaryController,
);
progressRouter.get(
  "/history/learning",
  authenticate,
  PROGRESS_LIMITER,
  learningHistoryController,
);
progressRouter.get(
  "/history/practice",
  authenticate,
  PROGRESS_LIMITER,
  practiceHistoryController,
);
progressRouter.get(
  "/history/practice/:id",
  authenticate,
  PROGRESS_LIMITER,
  practiceHistoryDetailController,
);
progressRouter.get(
  "/topics",
  authenticate,
  PROGRESS_LIMITER,
  topicProgressController,
);
progressRouter.get(
  "/suggestions",
  authenticate,
  PROGRESS_LIMITER,
  suggestionsController,
);
