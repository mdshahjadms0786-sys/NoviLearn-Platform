import * as sentryModule from "@sentry/node";

import { config } from "../config.js";
import { logger } from "../logger.js";

const sentry =
  typeof sentryModule.init === "function" &&
  typeof sentryModule.captureException === "function"
    ? sentryModule
    : null;
export function initErrorTracking() {
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
function userIdFromRequest(req) {
  const user = req?.user;
  return user?.id;
}
export function captureError(err, req) {
  if (!sentry || !config.sentryDsn) {
    return;
  }
  const userId = userIdFromRequest(req);
  sentry.captureException(
    err,
    userId
      ? {
          user: {
            id: userId,
          },
        }
      : undefined,
  );
}
export function captureErrorHandler() {
  return (err, req, _res, next) => {
    captureError(err, req);
    logger.error("request error", logger.toError(err));
    next(err);
  };
}
export function captureUnhandledRejection(reason) {
  if (!sentry || !config.sentryDsn) {
    return;
  }
  sentry.captureException(reason);
  logger.error("unhandled rejection", logger.toError(reason));
}
