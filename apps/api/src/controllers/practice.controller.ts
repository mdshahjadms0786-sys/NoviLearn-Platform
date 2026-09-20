import type { Request, Response } from "express";

import { createApiResponse } from "@novilearn/shared";
import type { PracticeConfig } from "@novilearn/types";

import type { AuthenticatedRequest } from "../middleware/auth";
import {
  answerPracticeQuestion,
  completePracticeSession,
  generatePracticeSet,
} from "../practice/practice.service";
import { asyncHandler } from "../utils/async-handler";

export const practiceGenerateController = asyncHandler(
  async (req: Request, res: Response) => {
    const authenticated = req as AuthenticatedRequest;
    const config = req.body as PracticeConfig;
    const set = await generatePracticeSet(authenticated.user.id, config);
    res.status(200).json(createApiResponse(set));
  },
);

export const practiceAnswerController = asyncHandler(
  async (req: Request, res: Response) => {
    const authenticated = req as AuthenticatedRequest;
    const body = req.body as {
      sessionId: string;
      questionId: string;
      answer: string;
    };
    const evaluation = await answerPracticeQuestion(
      authenticated.user.id,
      body.sessionId,
      body.questionId,
      body.answer,
    );
    res.status(200).json(createApiResponse(evaluation));
  },
);

export const practiceCompleteController = asyncHandler(
  async (req: Request, res: Response) => {
    const authenticated = req as AuthenticatedRequest;
    const body = req.body as { sessionId: string };
    const result = await completePracticeSession(
      authenticated.user.id,
      body.sessionId,
    );
    res.status(200).json(createApiResponse(result));
  },
);
