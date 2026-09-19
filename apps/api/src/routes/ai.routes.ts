import { Router } from "express";

import { learningQuestionSchema } from "@novilearn/shared";

import { learnController } from "../controllers/ai.controller";
import type { AuthenticatedRequest } from "../middleware/auth";
import { authenticate } from "../middleware/auth";
import { createRecentDuplicateGuard } from "../utils/dedupe";
import { createRateLimiter } from "../utils/rate-limit";
import { validate } from "../validators/auth";

export const aiRouter: Router = Router();

const AI_LIMITER = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 20,
  keyFor: (req) => (req as AuthenticatedRequest).user.id,
});

const AI_DUPLICATE_GUARD = createRecentDuplicateGuard({ windowMs: 10 * 1000 });

aiRouter.post(
  "/learn",
  authenticate,
  AI_LIMITER,
  validate(learningQuestionSchema),
  AI_DUPLICATE_GUARD,
  learnController,
);
