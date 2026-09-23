import { createApiResponse } from "@novilearn/shared";

import {
  answerPracticeQuestion,
  completePracticeSession,
  generatePracticeSet,
} from "../practice/practice.service.js";
import { asyncHandler } from "../utils/async-handler.js";
export const practiceGenerateController = asyncHandler(async (req, res) => {
  const authenticated = req;
  const config = req.body;
  const set = await generatePracticeSet(authenticated.user.id, config);
  res.status(200).json(createApiResponse(set));
});
export const practiceAnswerController = asyncHandler(async (req, res) => {
  const authenticated = req;
  const body = req.body;
  const evaluation = await answerPracticeQuestion(
    authenticated.user.id,
    body.sessionId,
    body.questionId,
    body.answer,
  );
  res.status(200).json(createApiResponse(evaluation));
});
export const practiceCompleteController = asyncHandler(async (req, res) => {
  const authenticated = req;
  const body = req.body;
  const result = await completePracticeSession(
    authenticated.user.id,
    body.sessionId,
  );
  res.status(200).json(createApiResponse(result));
});
