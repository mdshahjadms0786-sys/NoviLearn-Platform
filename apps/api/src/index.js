import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { createApiError, createApiResponse } from "@novilearn/shared";

import { config } from "./config.js";
import { AppError } from "./errors.js";
import { logger, logStream } from "./logger.js";
import {
  captureError,
  captureUnhandledRejection,
  initErrorTracking,
} from "./observability/error-tracking.js";
import { prisma } from "./prisma.js";
import { aiRouter } from "./routes/ai.routes.js";
import { authRouter } from "./routes/auth.routes.js";
import { practiceRouter } from "./routes/practice.routes.js";
import { progressRouter } from "./routes/progress.routes.js";
function isDuplicateEmailError(err) {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    err.code === "P2002"
  );
}
function getClientErrorStatus(err) {
  if (
    typeof err === "object" &&
    err !== null &&
    "status" in err &&
    typeof err.status === "number"
  ) {
    const status = err.status;
    if (status >= 400 && status <= 499) {
      return status;
    }
  }
  return null;
}
const app = express();
app.use(
  cors({
    origin: config.webUrl,
  }),
);
app.use(helmet());
app.use(express.json());
app.use(
  morgan("combined", {
    stream: logStream,
  }),
);
app.get("/health", (_req, res) => {
  const response = createApiResponse({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: "0.0.1",
  });
  res.json(response);
});
app.get("/health/readiness", async (_req, res) => {
  const checks = {
    database: {
      status: "unhealthy",
    },
  };
  const databaseCheck = checks.database;
  try {
    await prisma.$queryRaw`SELECT 1`;
    databaseCheck.status = "healthy";
  } catch (err) {
    captureError(err);
    databaseCheck.status = "unhealthy";
  }
  const ready =
    databaseCheck.status === "healthy" ||
    (config.env === "development" && process.env.NODE_ENV !== "test");
  const status = ready ? "healthy" : "degraded";
  if (!ready) {
    res.status(503);
  }
  res.json(
    createApiResponse({
      status,
      checks,
      timestamp: new Date().toISOString(),
    }),
  );
});
app.use("/auth", authRouter);
app.use("/ai", aiRouter);
app.use("/practice", practiceRouter);
app.use("/progress", progressRouter);
app.use((_req, res) => {
  const error = createApiError("NOT_FOUND", "Route not found", 404);
  res.status(404).json(error);
});
app.use((err, _req, res, _next) => {
  captureError(err);
  if (err instanceof AppError) {
    const error =
      err.details !== undefined
        ? createApiError(err.code, err.message, err.statusCode, err.details)
        : createApiError(err.code, err.message, err.statusCode);
    res.status(err.statusCode).json(error);
    return;
  }
  if (isDuplicateEmailError(err)) {
    const error = createApiError(
      "EMAIL_ALREADY_EXISTS",
      "An account with this email already exists",
      409,
    );
    res.status(409).json(error);
    return;
  }
  const clientErrorStatus = getClientErrorStatus(err);
  if (clientErrorStatus !== null) {
    const error = createApiError(
      "BAD_REQUEST",
      "Invalid request",
      clientErrorStatus,
    );
    res.status(clientErrorStatus).json(error);
    return;
  }
  logger.error("Unhandled error:", logger.toError(err));
  const error = createApiError(
    "INTERNAL_SERVER_ERROR",
    "Internal server error",
    500,
  );
  res.status(500).json(error);
});
process.on("unhandledRejection", captureUnhandledRejection);
initErrorTracking();
app.listen(config.port, () => {
  logger.info(`API server running on http://localhost:${config.port}`, {
    env: config.env,
  });
});
export { app };
