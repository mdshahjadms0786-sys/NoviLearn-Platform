import { createApiResponse } from "@novilearn/shared";

import {
  getPublicUserById,
  loginUser,
  logoutUser,
  signupUser,
} from "../services/auth.service.js";
import { asyncHandler } from "../utils/async-handler.js";
export const signupController = asyncHandler(async (req, res) => {
  const session = await signupUser(req.body);
  res.status(201).json(createApiResponse(session));
});
export const loginController = asyncHandler(async (req, res) => {
  const session = await loginUser(req.body);
  res.status(200).json(createApiResponse(session));
});
export const meController = asyncHandler(async (req, res) => {
  const authenticated = req;
  const user = await getPublicUserById(authenticated.user.id);
  res.status(200).json(createApiResponse(user));
});
export const logoutController = asyncHandler(async (req, res) => {
  const authenticated = req;
  await logoutUser(authenticated.user.id);
  res.status(200).json(createApiResponse(null));
});
