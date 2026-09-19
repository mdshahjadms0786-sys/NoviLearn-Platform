import type { NextFunction, Request, Response } from "express";

import { createApiError } from "@novilearn/shared";

import type { AuthenticatedRequest } from "../middleware/auth";

interface RecentDuplicateGuardOptions {
  windowMs: number;
}

function hashQuestion(question: string): string {
  let hash = 0;
  for (let i = 0; i < question.length; i += 1) {
    hash = (hash * 31 + question.charCodeAt(i)) | 0;
  }
  return hash.toString(36);
}

interface RecentEntry {
  hash: string;
  at: number;
}

export function createRecentDuplicateGuard({
  windowMs,
}: RecentDuplicateGuardOptions) {
  const recent = new Map<string, RecentEntry>();

  return (req: Request, res: Response, next: NextFunction): void => {
    const userKey = (req as AuthenticatedRequest).user.id;
    const question = (req.body?.question as string | undefined) ?? "";
    const hash = hashQuestion(question);
    const now = Date.now();
    const entry = recent.get(userKey);

    if (entry && entry.hash === hash && now - entry.at < windowMs) {
      const error = createApiError(
        "RATE_LIMITED",
        "Please wait a moment before repeating the same question",
        429,
      );
      res.status(429).json(error);
      return;
    }

    res.on("finish", () => {
      if (res.statusCode >= 200 && res.statusCode < 400) {
        recent.set(userKey, { hash, at: Date.now() });
      }
    });

    next();
  };
}
