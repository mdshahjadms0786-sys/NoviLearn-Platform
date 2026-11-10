import { createApiResponse } from "@novilearn/shared";

import * as mediaService from "../media/media.service.js";
import { asyncHandler } from "../utils/async-handler.js";

export const createVideoJobController = asyncHandler(async (req, res) => {
  const { topic, sessionId } = req.body;
  const job = await mediaService.createVideoJob(req.user.id, topic, sessionId);
  res.json(createApiResponse(job));
});

export const getVideoJobController = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const job = await mediaService.getVideoJob(req.user.id, jobId);
  res.json(createApiResponse(job));
});

export const listVideoJobsController = asyncHandler(async (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
  const jobs = await mediaService.listVideoJobs(req.user.id, limit);
  res.json(createApiResponse(jobs));
});

export const retryVideoJobController = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const job = await mediaService.retryVideoJob(req.user.id, jobId);
  res.json(createApiResponse(job));
});

export const uploadFileController = asyncHandler(async (req, res) => {
  const { filename, mimeType, size, path } = req.body;
  const file = await mediaService.uploadFile(
    req.user.id,
    filename,
    mimeType,
    size,
    path,
  );
  res.json(createApiResponse(file));
});

export const analyzeFileController = asyncHandler(async (req, res) => {
  const { fileId, action } = req.body;
  const result = await mediaService.analyzeUploadedFile(
    req.user.id,
    fileId,
    action,
  );
  res.json(createApiResponse(result));
});

export const listFilesController = asyncHandler(async (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
  const files = await mediaService.listFiles(req.user.id, limit);
  res.json(createApiResponse(files));
});
