import { Router } from "express";

import { learningQuestionSchema } from "@novilearn/shared";

import { learnController } from "../controllers/ai.controller.js";
import { authenticate } from "../middleware/auth.js";
import { createRecentDuplicateGuard } from "../utils/dedupe.js";
import { createRateLimiter } from "../utils/rate-limit.js";
import { validate } from "../validators/auth.js";
export const aiRouter = Router();
const AI_LIMITER = createRateLimiter({
  name: "ai-learn",
  windowMs: 10 * 60 * 1000,
  max: 20,
  keyFor: (req) => req.user.id,
});
const AI_DUPLICATE_GUARD = createRecentDuplicateGuard({
  windowMs: 10 * 1000,
});
aiRouter.post(
  "/learn",
  authenticate,
  AI_LIMITER,
  validate(learningQuestionSchema),
  AI_DUPLICATE_GUARD,
  learnController,
);
