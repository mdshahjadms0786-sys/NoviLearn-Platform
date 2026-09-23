import { inspect } from "node:util";

import type { LogLevel } from "@novilearn/types";

import { config } from "./config";

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const SENSITIVE_FRAGMENTS = [
  "authorization",
  "api-key",
  "api_key",
  "apikey",
  "cookie",
  "password",
  "secret",
  "token",
  "dsn",
  "privatekey",
  "private_key",
];

function isSensitiveKey(key: string): boolean {
  const normalized = key.toLowerCase();
  return SENSITIVE_FRAGMENTS.some((fragment) => normalized.includes(fragment));
}

function redactValue(value: unknown, depth = 0): unknown {
  if (depth > 4) {
    return "[max depth]";
  }
  if (value instanceof Error) {
    return { name: value.name, message: value.message, stack: value.stack };
  }
  if (Array.isArray(value)) {
    return value.map((item) => redactValue(item, depth + 1));
  }
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const redacted: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(obj)) {
      redacted[key] = isSensitiveKey(key) ? "[REDACTED]" : redactValue(val, depth + 1);
    }
    return redacted;
  }
  return value;
}

function canLog(level: LogLevel): boolean {
  return LEVEL_ORDER[level] >= LEVEL_ORDER[config.logLevel];
}

function write(level: LogLevel, message: string, context?: unknown): void {
  if (!canLog(level)) {
    return;
  }

  const entry: Record<string, unknown> = {
    level,
    message,
    timestamp: new Date().toISOString(),
  };
  if (context !== undefined) {
    entry.context = redactValue(context);
  }

  const line = JSON.stringify(entry);
  if (level === "warn" || level === "error") {
    process.stderr.write(`${line}\n`);
  } else {
    process.stdout.write(`${line}\n`);
  }
}

export const logger = {
  debug(message: string, context?: unknown): void {
    write("debug", message, context);
  },
  info(message: string, context?: unknown): void {
    write("info", message, context);
  },
  warn(message: string, context?: unknown): void {
    write("warn", message, context);
  },
  error(message: string, context?: unknown): void {
    write("error", message, context);
  },
  /** Format an unknown error for structured logging without throwing. */
  toError(err: unknown): { name: string; message: string; stack?: string } {
    if (err instanceof Error) {
      const stack = err.stack;
      return stack === undefined
        ? { name: err.name, message: err.message }
        : { name: err.name, message: err.message, stack };
    }
    return {
      name: "UnknownError",
      message: typeof err === "string" ? err : inspect(err),
    };
  },
};

export const logStream = {
  write(line: string): boolean {
    const trimmed = line.trimEnd();
    if (trimmed.length > 0) {
      write("info", trimmed);
    }
    return true;
  },
};