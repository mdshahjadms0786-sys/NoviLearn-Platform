import { createApiResponse } from "@novilearn/shared";

import * as learningService from "../learning/learning.service.js";
import { asyncHandler } from "../utils/async-handler.js";

export const createSessionController = asyncHandler(async (req, res) => {
  const { question } = req.body;
  const session = await learningService.createSession(req.user.id, question);
  res.json(createApiResponse(session));
});

export const getSessionController = asyncHandler(async (req, res) => {
  const session = await learningService.getSession(req.user.id, req.params.id);
  res.json(createApiResponse(session));
});

export const listSessionsController = asyncHandler(async (req, res) => {
  const { limit } = req.query;
  const sessions = await learningService.listSessions(req.user.id, limit);
  res.json(createApiResponse(sessions));
});

export const sendMessageController = asyncHandler(async (req, res) => {
  const { content, mode } = req.body;
  const messages = await learningService.sendMessage(
    req.user.id,
    req.params.id,
    content,
    mode,
  );
  res.json(createApiResponse(messages));
});

export const saveSessionController = asyncHandler(async (req, res) => {
  const result = await learningService.saveSession(req.user.id, req.params.id);
  res.json(createApiResponse(result));
});

export const unsaveSessionController = asyncHandler(async (req, res) => {
  const result = await learningService.unsaveSession(
    req.user.id,
    req.params.id,
  );
  res.json(createApiResponse(result));
});

export const listSavedController = asyncHandler(async (req, res) => {
  const { limit } = req.query;
  const saved = await learningService.listSavedSessions(req.user.id, limit);
  res.json(createApiResponse(saved));
});
