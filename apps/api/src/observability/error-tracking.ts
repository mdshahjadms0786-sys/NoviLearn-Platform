import type { ErrorRequestHandler, Request, Response } from "express";

import { config } from "../config";
import { logger } from "../logger";

interface SentryApi {
  init: (options: {
    dsn: string;
    environment: string;
    tracesSampleRate: number;
  }) => void;
  setupExpressErrorHandler: () => void;
  captureException: (
    exception: unknown,
    captureContext?: {
      user?: { id: string };
    },
  ) => void;
}

const sentry: SentryApi | null = (() => {
  try {
    // Lazy, guarded require: @sentry/node is an optional runtime dependency.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require("@sentry/node") as Partial<SentryApi>;
    if (
      typeof mod.init === "function" &&
      typeof mod.captureException === "function"
    ) {
      return mod as SentryApi;
    }
    return null;
  } catch {
    return null;
  }
})();

export function initErrorTracking(): void {
  if (!sentry || !config.sentryDsn) {
    return;
  }
  sentry.init({
    dsn: config.sentryDsn,
    environment: config.env,
    tracesSampleRate: config.env === "production" ? 0.1 : 0,
  });
  if (typeof sentry.setupExpressErrorHandler === "function") {
    sentry.setupExpressErrorHandler();
  }
}

function userIdFromRequest(req?: Request): string | undefined {
  const user = (req as { user?: { id?: string } } | undefined)?.user;
  return user?.id;
}

export function captureError(err: unknown, req?: Request): void {
  if (!sentry || !config.sentryDsn) {
    return;
  }
  const userId = userIdFromRequest(req);
  sentry.captureException(err, userId ? { user: { id: userId } } : undefined);
}

export function captureErrorHandler(): ErrorRequestHandler {
  return (
    err: unknown,
    req: Request,
    _res: Response,
    next: (err?: unknown) => void,
  ) => {
    captureError(err, req);
    logger.error("request error", logger.toError(err));
    next(err);
  };
}

export function captureUnhandledRejection(reason: unknown): void {
  if (!sentry || !config.sentryDsn) {
    return;
  }
  sentry.captureException(reason);
  logger.error("unhandled rejection", logger.toError(reason));
}