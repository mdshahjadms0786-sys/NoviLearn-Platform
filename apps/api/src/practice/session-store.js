import { randomUUID } from "node:crypto";

import { AppError } from "../errors.js";
import { logger } from "../logger.js";
import { prisma } from "../prisma.js";
const SESSION_TTL_MS = 60 * 60 * 1000;
const MAX_SESSIONS_PER_USER = 12;
// Read-through cache: same-process lookups stay deterministic (the record
// object is mutated in place across answer calls). PostgreSQL is the durable
// store, so a fresh instance/restart falls back to the DB.
const cache = new Map();
function sessionNotFound() {
  return new AppError(
    404,
    "PRACTICE_SESSION_NOT_FOUND",
    "This practice session is no longer available. Please start a new practice.",
  );
}
function toStoredData(record) {
  return {
    sessionId: record.sessionId,
    userId: record.userId,
    topic: record.topic,
    config: record.config,
    questions: record.questions,
    expiresAt: record.expiresAt,
    answers: Object.fromEntries(record.answers.entries()),
  };
}
function toPracticeSessionRecord(data) {
  return {
    ...data,
    answers: new Map(Object.entries(data.answers ?? {})),
  };
}
function parseStoredData(json) {
  return json;
}
async function evictExpiredFromDb() {
  try {
    await prisma.activePracticeSession.deleteMany({
      where: {
        expiresAt: {
          lte: new Date(),
        },
      },
    });
  } catch (err) {
    logger.error("[session-store] db eviction failed", logger.toError(err));
  }
}
function evictExpiredFromCache() {
  const now = Date.now();
  for (const [id, record] of cache) {
    if (record.expiresAt <= now) {
      cache.delete(id);
    }
  }
}
function isDuplicateError(err) {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    err.code === "P2002"
  );
}
async function persistOrCreate(record) {
  await prisma.activePracticeSession.upsert({
    where: {
      id: record.sessionId,
    },
    create: {
      id: record.sessionId,
      userId: record.userId,
      expiresAt: new Date(record.expiresAt),
      data: toStoredData(record),
    },
    update: {
      expiresAt: new Date(record.expiresAt),
      data: toStoredData(record),
    },
  });
}
function loggedPersist(record, label) {
  persistOrCreate(record).catch((err) => {
    if (!isDuplicateError(err)) {
      logger.error(`[session-store] ${label} failed`, logger.toError(err));
    }
  });
}

// Synchronous by design: Phase 8/9 service-level tests construct sessions and
// read sessionId immediately. Persistence happens in the background; in-memory
// reads keep same-process behavior deterministic.
export function createPracticeSession(userId, config, questions) {
  evictExpiredFromCache();
  const now = Date.now();
  const userSessions = [...cache.values()].filter(
    (record) => record.userId === userId && record.expiresAt > now,
  );
  if (userSessions.length >= MAX_SESSIONS_PER_USER) {
    const oldest = userSessions.sort((a, b) => a.expiresAt - b.expiresAt)[0];
    if (oldest !== undefined) {
      cache.delete(oldest.sessionId);
    }
  }
  const record = {
    sessionId: randomUUID(),
    userId,
    topic: config.topic,
    config,
    questions,
    expiresAt: now + SESSION_TTL_MS,
    answers: new Map(),
  };
  cache.set(record.sessionId, record);
  void evictExpiredFromDb().then(() =>
    loggedPersist(record, "db persist on create failed"),
  );
  return record;
}
export async function getValidPracticeSession(sessionId, userId) {
  const cached = cache.get(sessionId);
  if (cached !== undefined) {
    if (cached.userId !== userId) {
      throw sessionNotFound();
    }
    if (cached.expiresAt <= Date.now()) {
      cache.delete(sessionId);
      void prisma.activePracticeSession
        .delete({
          where: {
            id: sessionId,
          },
        })
        .catch(() => undefined);
      throw sessionNotFound();
    }
    return cached;
  }
  let row = null;
  try {
    row = await prisma.activePracticeSession.findUnique({
      where: {
        id: sessionId,
      },
    });
  } catch (err) {
    logger.error("[session-store] db read failed", logger.toError(err));
    throw sessionNotFound();
  }
  if (row === null || row.userId !== userId) {
    throw sessionNotFound();
  }
  const record = toPracticeSessionRecord(parseStoredData(row.data));
  if (record.expiresAt <= Date.now()) {
    void prisma.activePracticeSession
      .delete({
        where: {
          id: sessionId,
        },
      })
      .catch(() => undefined);
    throw sessionNotFound();
  }
  cache.set(record.sessionId, record);
  return record;
}
export async function savePracticeSession(record) {
  cache.set(record.sessionId, record);
  try {
    await persistOrCreate(record);
  } catch (err) {
    logger.error("[session-store] db save failed", logger.toError(err));
  }
}
