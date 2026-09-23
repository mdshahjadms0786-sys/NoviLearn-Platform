import { createApiError } from "@novilearn/shared";

import { logger } from "../logger.js";
import { prisma } from "../prisma.js";
export function createRateLimiter({ name, windowMs, max, keyFor }) {
  return async (req, res, next) => {
    const key = keyFor ? keyFor(req) : (req.ip ?? "unknown");
    const now = Date.now();
    const windowStart = new Date(now);
    const expiresAt = new Date(now + windowMs);
    try {
      const rows = await prisma.$queryRaw`
        INSERT INTO rate_limit_buckets ("key", "count", "windowStart", "expiresAt", "updatedAt")
        VALUES (${key}, 1, ${windowStart}, ${expiresAt}, ${windowStart})
        ON CONFLICT ("key") DO UPDATE SET
          "count" = CASE
            WHEN rate_limit_buckets."windowStart" < ${new Date(now - windowMs)} THEN 1
            ELSE rate_limit_buckets."count" + 1
          END,
          "windowStart" = CASE
            WHEN rate_limit_buckets."windowStart" < ${new Date(now - windowMs)} THEN ${windowStart}
            ELSE rate_limit_buckets."windowStart"
          END,
          "expiresAt" = CASE
            WHEN rate_limit_buckets."windowStart" < ${new Date(now - windowMs)} THEN ${expiresAt}
            ELSE rate_limit_buckets."expiresAt"
          END,
          "updatedAt" = ${windowStart}
        RETURNING "count"
      `;
      const count = Number(rows[0]?.count ?? 0);
      if (count > max) {
        const error = createApiError(
          "RATE_LIMITED",
          "Too many requests, please try again later",
          429,
        );
        res.status(429).json(error);
        return;
      }
      next();
    } catch (err) {
      logger.error(
        `[rate-limit] ${name} limiter failed open`,
        logger.toError(err),
      );
      next();
    }
  };
}
