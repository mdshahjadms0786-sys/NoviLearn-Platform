import { Router } from "express";

import {
  createSessionController,
  getSessionController,
  listSessionsController,
  sendMessageController,
  saveSessionController,
  unsaveSessionController,
  listSavedController,
} from "../controllers/learning.controller.js";
import { authenticate } from "../middleware/auth.js";
import { createRateLimiter } from "../utils/rate-limit.js";

export const learningRouter = Router();

learningRouter.use(authenticate);

const createLimiter = createRateLimiter({
  name: "create_session",
  windowMs: 10 * 60 * 1000,
  max: 30,
  keyFor: (req) => `learn_create_${req.user.id}`,
});

const messageLimiter = createRateLimiter({
  name: "send_message",
  windowMs: 10 * 60 * 1000,
  max: 50,
  keyFor: (req) => `learn_msg_${req.user.id}`,
});

learningRouter.post("/", createLimiter, createSessionController);
learningRouter.get("/", listSessionsController);
learningRouter.get("/saved", listSavedController);
learningRouter.get("/:id", getSessionController);
learningRouter.post("/:id/messages", messageLimiter, sendMessageController);
learningRouter.post("/:id/save", saveSessionController);
learningRouter.delete("/:id/save", unsaveSessionController);
