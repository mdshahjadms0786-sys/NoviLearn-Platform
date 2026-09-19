import { z } from "zod";

import { environmentSchema } from "@novilearn/shared";
import type { AiProviderName, AppConfig } from "@novilearn/types";

import { loadEnvFile } from "./env";

loadEnvFile();

function parseAiProvider(value: string | undefined): AiProviderName | "" {
  if (value === "openai") {
    return "openai";
  }
  return "";
}

const envSchema = z.object({
  env: environmentSchema.default("development"),
  port: z.coerce.number().int().min(1).max(65535).default(3001),
  apiUrl: z.string().url().default("http://localhost:3001"),
  webUrl: z.string().url().default("http://localhost:3000"),
  databaseUrl: z.string().min(1),
  jwtSecret: z.string().min(32),
  jwtExpiresIn: z.string().min(1).default("7d"),
  aiProvider: z.string().default(""),
  aiApiKey: z.string().default(""),
  aiModel: z.string().min(1).default("gpt-4o-mini"),
});

const parsed = envSchema.parse({
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  apiUrl: process.env.API_URL,
  webUrl: process.env.WEB_URL,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN,
  aiProvider: process.env.AI_PROVIDER,
  aiApiKey: process.env.AI_API_KEY,
  aiModel: process.env.AI_MODEL,
});

export const config: AppConfig = {
  env: parsed.env,
  port: parsed.port,
  apiUrl: parsed.apiUrl,
  webUrl: parsed.webUrl,
  databaseUrl: parsed.databaseUrl,
  jwtSecret: parsed.jwtSecret,
  jwtExpiresIn: parsed.jwtExpiresIn,
  ai: {
    provider: parseAiProvider(parsed.aiProvider),
    apiKey: parsed.aiApiKey,
    model: parsed.aiModel,
  },
};
