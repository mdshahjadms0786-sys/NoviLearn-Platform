import { Router } from 'express';

import { loginSchema, signupSchema } from '@novilearn/shared';

import {
  loginController,
  logoutController,
  meController,
  signupController,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { createRateLimiter } from '../utils/rate-limit';
import { validate } from '../validators/auth';

export const authRouter: Router = Router();

const LOGIN_LIMITER = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 30 });
const SIGNUP_LIMITER = createRateLimiter({ windowMs: 60 * 60 * 1000, max: 20 });

authRouter.post(
  '/signup',
  SIGNUP_LIMITER,
  validate(signupSchema),
  signupController,
);
authRouter.post(
  '/login',
  LOGIN_LIMITER,
  validate(loginSchema),
  loginController,
);
authRouter.get('/me', authenticate, meController);
authRouter.post('/logout', authenticate, logoutController);
