import { Router } from "express";

import {
  learningHistoryController,
  practiceHistoryController,
  practiceHistoryDetailController,
  progressSummaryController,
  suggestionsController,
  topicProgressController,
} from "../controllers/progress.controller";
import type { AuthenticatedRequest } from "../middleware/auth";
import { authenticate } from "../middleware/auth";
import { createRateLimiter } from "../utils/rate-limit";

export const progressRouter: Router = Router();

const PROGRESS_LIMITER = createRateLimiter({
  name: "progress",
  windowMs: 10 * 60 * 1000,
  max: 300,
  keyFor: (req) => (req as AuthenticatedRequest).user.id,
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
