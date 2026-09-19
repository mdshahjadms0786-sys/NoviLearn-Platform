import cors from "cors";
import express, {
  type Express,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import helmet from "helmet";
import morgan from "morgan";

import { createApiError, createApiResponse } from "@novilearn/shared";
import type { HealthStatus } from "@novilearn/types";

import { config } from "./config";
import { AppError } from "./errors";
import { aiRouter } from "./routes/ai.routes";
import { authRouter } from "./routes/auth.routes";

function isDuplicateEmailError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: unknown }).code === "P2002"
  );
}

function getClientErrorStatus(err: unknown): number | null {
  if (
    typeof err === "object" &&
    err !== null &&
    "status" in err &&
    typeof (err as { status?: unknown }).status === "number"
  ) {
    const status = (err as { status: number }).status;
    if (status >= 400 && status <= 499) {
      return status;
    }
  }
  return null;
}

const app: Express = express();

app.use(
  cors({
    origin: config.webUrl,
  }),
);
app.use(helmet());
app.use(express.json());
app.use(morgan("combined"));

app.get("/health", (_req: Request, res: Response) => {
  const response = createApiResponse<{
    status: HealthStatus;
    timestamp: string;
    uptime: number;
    version: string;
  }>({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: "0.0.1",
  });
  res.json(response);
});

app.use("/auth", authRouter);
app.use("/ai", aiRouter);

app.use((_req: Request, res: Response) => {
  const error = createApiError("NOT_FOUND", "Route not found", 404);
  res.status(404).json(error);
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
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

  console.error("Unhandled error:", err);
  const error = createApiError(
    "INTERNAL_SERVER_ERROR",
    "Internal server error",
    500,
  );
  res.status(500).json(error);
});

app.listen(config.port, () => {
  console.log(`API server running on http://localhost:${config.port}`);
});

export { app };
