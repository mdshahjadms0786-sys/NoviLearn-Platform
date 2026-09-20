import { randomUUID } from "node:crypto";

import type { PracticeConfig } from "@novilearn/types";

import { AppError } from "../errors";
import type {
  InternalPracticeQuestion,
  PracticeSessionRecord,
} from "./practice.types";

const SESSION_TTL_MS = 60 * 60 * 1000;
const MAX_SESSIONS_PER_USER = 12;

const sessions = new Map<string, PracticeSessionRecord>();

function sessionNotFound(): AppError {
  return new AppError(
    404,
    "PRACTICE_SESSION_NOT_FOUND",
    "This practice session is no longer available. Please start a new practice.",
  );
}

function evictExpired(): void {
  const now = Date.now();
  for (const [id, record] of sessions) {
    if (record.expiresAt <= now) {
      sessions.delete(id);
    }
  }
}

export function createPracticeSession(
  userId: string,
  config: PracticeConfig,
  questions: InternalPracticeQuestion[],
): PracticeSessionRecord {
  evictExpired();

  const now = Date.now();
  const userSessions = [...sessions.values()].filter(
    (record) => record.userId === userId && record.expiresAt > now,
  );
  if (userSessions.length >= MAX_SESSIONS_PER_USER) {
    const oldest = userSessions.sort((a, b) => a.expiresAt - b.expiresAt)[0];
    if (oldest !== undefined) {
      sessions.delete(oldest.sessionId);
    }
  }

  const record: PracticeSessionRecord = {
    sessionId: randomUUID(),
    userId,
    topic: config.topic,
    config,
    questions,
    expiresAt: now + SESSION_TTL_MS,
    answers: new Map(),
  };
  sessions.set(record.sessionId, record);
  return record;
}

export function getValidPracticeSession(
  sessionId: string,
  userId: string,
): PracticeSessionRecord {
  const record = sessions.get(sessionId);
  if (record === undefined || record.userId !== userId) {
    throw sessionNotFound();
  }
  if (record.expiresAt <= Date.now()) {
    sessions.delete(sessionId);
    throw sessionNotFound();
  }
  return record;
}
