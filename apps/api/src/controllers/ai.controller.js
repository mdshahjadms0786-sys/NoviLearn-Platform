import { createApiResponse } from "@novilearn/shared";

import { generateLearningResponse } from "../ai/ai.service.js";
import { recordLearningActivity } from "../progress/progress.service.js";
import { asyncHandler } from "../utils/async-handler.js";
export const learnController = asyncHandler(async (req, res) => {
  const authenticated = req;
  const response = await generateLearningResponse({
    question: req.body.question,
    userId: authenticated.user.id,
  });
  await recordLearningActivity(
    authenticated.user.id,
    req.body.question,
    response.relatedConcepts,
    response.nextLearning,
  );
  res.status(200).json(createApiResponse(response));
});
