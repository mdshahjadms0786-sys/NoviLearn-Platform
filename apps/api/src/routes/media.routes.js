import { Router } from "express";

import {
  createVideoJobController,
  getVideoJobController,
  listVideoJobsController,
  retryVideoJobController,
  uploadFileController,
  analyzeFileController,
  listFilesController,
} from "../controllers/media.controller.js";
import { authenticate } from "../middleware/auth.js";
import { createRateLimiter } from "../utils/rate-limit.js";

const mediaRouter = Router();

mediaRouter.use(authenticate);

const videoRateLimiter = createRateLimiter(10 * 60 * 1000, 10);
const fileRateLimiter = createRateLimiter(10 * 60 * 1000, 20);

mediaRouter.post("/video/generate", videoRateLimiter, createVideoJobController);
mediaRouter.get("/video", listVideoJobsController);
mediaRouter.get("/video/:jobId", getVideoJobController);
mediaRouter.post("/video/:jobId/retry", retryVideoJobController);

mediaRouter.post("/upload", fileRateLimiter, uploadFileController);
mediaRouter.post("/analyze", fileRateLimiter, analyzeFileController);
mediaRouter.get("/files", listFilesController);

export { mediaRouter };
