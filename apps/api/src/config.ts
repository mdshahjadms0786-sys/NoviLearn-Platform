import { z } from "zod";

import { environmentSchema } from "@novilearn/shared";
import type {
  AiProviderName,
  AppConfig,
  EmbeddingProviderName,
} from "@novilearn/types";

import { loadEnvFile } from "./env";

loadEnvFile();

function parseAiProvider(value: string | undefined): AiProviderName | "" {
  if (value === "openai" || value === "anthropic") {
    return value;
  }
  return "";
}

function parseEmbeddingProvider(
  value: string | undefined,
): EmbeddingProviderName | "" {
  if (value === "openai" || value === "local") {
    return value;
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
  embeddingProvider: z.string().default(""),
  embeddingApiKey: z.string().default(""),
  embeddingModel: z.string().min(1).default("text-embedding-3-small"),
  embeddingDimension: z.coerce.number().int().min(1).max(8192).default(1536),
  ragEnabled: z
    .string()
    .optional()
    .transform((value) => value !== "false"),
  ragTopK: z.coerce.number().int().min(1).max(50).default(4),
  ragMinScore: z.coerce.number().min(0).max(1).default(0.3),
  sentryDsn: z.string().default(""),
  logLevel: z
    .enum(["debug", "info", "warn", "error"])
    .default("debug"),
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
  embeddingProvider: process.env.EMBEDDING_PROVIDER,
  embeddingApiKey: process.env.EMBEDDING_API_KEY,
  embeddingModel: process.env.EMBEDDING_MODEL,
  embeddingDimension: process.env.EMBEDDING_DIMENSION,
  ragEnabled: process.env.RAG_ENABLED,
  ragTopK: process.env.RAG_TOP_K,
  ragMinScore: process.env.RAG_MIN_SCORE,
  sentryDsn: process.env.SENTRY_DSN,
  logLevel: process.env.LOG_LEVEL,
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
  embeddings: {
    provider: parseEmbeddingProvider(parsed.embeddingProvider),
    apiKey:
      parsed.embeddingApiKey || (parsed.aiProvider === "openai" ? parsed.aiApiKey : ""),
    model: parsed.embeddingModel,
    dimension: parsed.embeddingDimension,
  },
  rag: {
    enabled: parsed.ragEnabled,
    topK: parsed.ragTopK,
    minScore: parsed.ragMinScore,
  },
  sentryDsn: parsed.sentryDsn,
  logLevel: parsed.logLevel,
};