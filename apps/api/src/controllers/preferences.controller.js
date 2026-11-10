import { createApiResponse } from "@novilearn/shared";

import * as preferencesService from "../preferences/preferences.service.js";
import { asyncHandler } from "../utils/async-handler.js";

export const getPreferencesController = asyncHandler(async (req, res) => {
  const prefs = await preferencesService.getPreferences(req.user.id);
  res.json(createApiResponse(prefs));
});

export const updatePreferencesController = asyncHandler(async (req, res) => {
  const prefs = await preferencesService.updatePreferences(
    req.user.id,
    req.body,
  );
  res.json(createApiResponse(prefs));
});

export const listAvatarsController = asyncHandler(async (req, res) => {
  const avatars = preferencesService.getAvailableAvatars();
  res.json(createApiResponse(avatars));
});

export const setAvatarController = asyncHandler(async (req, res) => {
  const { avatarId, avatarType } = req.body;
  const avatar = await preferencesService.setActiveAvatar(
    req.user.id,
    avatarId,
    avatarType,
  );
  res.json(createApiResponse(avatar));
});

export const getActiveAvatarController = asyncHandler(async (req, res) => {
  const avatar = await preferencesService.getActiveAvatar(req.user.id);
  res.json(createApiResponse(avatar));
});
