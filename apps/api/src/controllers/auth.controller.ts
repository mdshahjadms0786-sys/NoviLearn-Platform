import type { Request, Response } from 'express';

import { createApiResponse } from '@novilearn/shared';

import type { AuthenticatedRequest } from '../middleware/auth';
import {
  getPublicUserById,
  loginUser,
  logoutUser,
  signupUser,
} from '../services/auth.service';
import { asyncHandler } from '../utils/async-handler';

export const signupController = asyncHandler(
  async (req: Request, res: Response) => {
    const session = await signupUser(req.body);
    res.status(201).json(createApiResponse(session));
  },
);

export const loginController = asyncHandler(
  async (req: Request, res: Response) => {
    const session = await loginUser(req.body);
    res.status(200).json(createApiResponse(session));
  },
);

export const meController = asyncHandler(
  async (req: Request, res: Response) => {
    const authenticated = req as AuthenticatedRequest;
    const user = await getPublicUserById(authenticated.user.id);
    res.status(200).json(createApiResponse(user));
  },
);

export const logoutController = asyncHandler(
  async (req: Request, res: Response) => {
    const authenticated = req as AuthenticatedRequest;
    await logoutUser(authenticated.user.id);
    res.status(200).json(createApiResponse(null));
  },
);
