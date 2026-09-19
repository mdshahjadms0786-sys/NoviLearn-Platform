import type { Request, Response } from "express";

import { createApiResponse } from "@novilearn/shared";

import { generateLearningResponse } from "../ai/ai.service";
import type { AuthenticatedRequest } from "../middleware/auth";
import { asyncHandler } from "../utils/async-handler";

export const learnController = asyncHandler(
  async (req: Request, res: Response) => {
    const authenticated = req as AuthenticatedRequest;
    const response = await generateLearningResponse({
      question: req.body.question as string,
      userId: authenticated.user.id,
    });
    res.status(200).json(createApiResponse(response));
  },
);
