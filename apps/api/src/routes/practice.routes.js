import { Router } from "express";

import {
  practiceAnswerSchema,
  practiceCompleteSchema,
  practiceConfigSchema,
} from "@novilearn/shared";

import {
  practiceAnswerController,
  practiceCompleteController,
  practiceGenerateController,
} from "../controllers/practice.controller.js";
import { authenticate } from "../middleware/auth.js";
import { createRateLimiter } from "../utils/rate-limit.js";
import { validate } from "../validators/auth.js";
export const practiceRouter = Router();
const PRACTICE_GENERATE_LIMITER = createRateLimiter({
  name: "practice-generate",
  windowMs: 10 * 60 * 1000,
  max: 20,
  keyFor: (req) => req.user.id,
});
const PRACTICE_ACTION_LIMITER = createRateLimiter({
  name: "practice-action",
  windowMs: 10 * 60 * 1000,
  max: 200,
  keyFor: (req) => req.user.id,
});
practiceRouter.post(
  "/generate",
  authenticate,
  PRACTICE_GENERATE_LIMITER,
  validate(practiceConfigSchema),
  practiceGenerateController,
);
practiceRouter.post(
  "/answer",
  authenticate,
  PRACTICE_ACTION_LIMITER,
  validate(practiceAnswerSchema),
  practiceAnswerController,
);
practiceRouter.post(
  "/complete",
  authenticate,
  PRACTICE_ACTION_LIMITER,
  validate(practiceCompleteSchema),
  practiceCompleteController,
);
