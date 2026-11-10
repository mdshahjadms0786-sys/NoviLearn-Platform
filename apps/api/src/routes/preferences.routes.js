import { Router } from "express";

import {
  getPreferencesController,
  updatePreferencesController,
  listAvatarsController,
  setAvatarController,
  getActiveAvatarController,
} from "../controllers/preferences.controller.js";
import { authenticate } from "../middleware/auth.js";

const preferencesRouter = Router();

preferencesRouter.use(authenticate);

preferencesRouter.get("/", getPreferencesController);
preferencesRouter.patch("/", updatePreferencesController);
preferencesRouter.get("/avatars", listAvatarsController);
preferencesRouter.get("/avatar/active", getActiveAvatarController);
preferencesRouter.post("/avatar", setAvatarController);

export { preferencesRouter };
