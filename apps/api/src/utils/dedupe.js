import { createApiError } from "@novilearn/shared";

import { logger } from "../logger.js";
import { prisma } from "../prisma.js";
function hashQuestion(question) {
  let hash = 0;
  for (let i = 0; i < question.length; i += 1) {
    hash = (hash * 31 + question.charCodeAt(i)) | 0;
  }
  return hash.toString(36);
}
export function createRecentDuplicateGuard({ windowMs }) {
  return async (req, res, next) => {
    const userKey = req.user.id;
    const question = req.body?.question ?? "";
    const hash = hashQuestion(question);
    const now = Date.now();
    try {
      const entry = await prisma.aiRecentEntry.findUnique({
        where: {
          userId: userKey,
        },
      });
      if (
        entry !== null &&
        entry.requestHash === hash &&
        now - entry.requestedAt.getTime() < windowMs
      ) {
        const error = createApiError(
          "RATE_LIMITED",
          "Please wait a moment before repeating the same question",
          429,
        );
        res.status(429).json(error);
        return;
      }
    } catch (err) {
      logger.error(
        "[dedupe] lookup failed, allowing request",
        logger.toError(err),
      );
    }
    res.on("finish", () => {
      if (res.statusCode >= 200 && res.statusCode < 400) {
        void prisma.aiRecentEntry
          .upsert({
            where: {
              userId: userKey,
            },
            create: {
              userId: userKey,
              requestHash: hash,
              requestedAt: new Date(now),
            },
            update: {
              requestHash: hash,
              requestedAt: new Date(now),
            },
          })
          .catch((err) => {
            logger.error(
              "[dedupe] record failed, request already allowed",
              logger.toError(err),
            );
          });
      }
    });
    next();
  };
}
