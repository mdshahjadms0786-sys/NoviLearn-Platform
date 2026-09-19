import type { NextFunction, Request, Response } from "express";

import { createApiError } from "@novilearn/shared";

interface RateLimiterOptions {
  windowMs: number;
  max: number;
  keyFor?: (req: Request) => string;
}

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

export function createRateLimiter({
  windowMs,
  max,
  keyFor,
}: RateLimiterOptions) {
  const buckets = new Map<string, RateLimitBucket>();

  return (req: Request, res: Response, next: NextFunction): void => {
    const key = keyFor ? keyFor(req) : (req.ip ?? "unknown");
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    bucket.count += 1;
    if (bucket.count > max) {
      const error = createApiError(
        "RATE_LIMITED",
        "Too many requests, please try again later",
        429,
      );
      res.status(429).json(error);
      return;
    }

    next();
  };
}
