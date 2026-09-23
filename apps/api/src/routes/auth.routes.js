import { Router } from "express";

import { loginSchema, signupSchema } from "@novilearn/shared";

import {
  loginController,
  logoutController,
  meController,
  signupController,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.js";
import { createRateLimiter } from "../utils/rate-limit.js";
import { validate } from "../validators/auth.js";
export const authRouter = Router();
const LOGIN_LIMITER = createRateLimiter({
  name: "auth-login",
  windowMs: 15 * 60 * 1000,
  max: 30,
});
const SIGNUP_LIMITER = createRateLimiter({
  name: "auth-signup",
  windowMs: 60 * 60 * 1000,
  max: 20,
});
authRouter.post(
  "/signup",
  SIGNUP_LIMITER,
  validate(signupSchema),
  signupController,
);
authRouter.post(
  "/login",
  LOGIN_LIMITER,
  validate(loginSchema),
  loginController,
);
authRouter.get("/me", authenticate, meController);
authRouter.post("/logout", authenticate, logoutController);
