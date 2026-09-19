import type { LearningResponse } from "@novilearn/types";

import { config } from "../config";
import { AppError } from "../errors";
import type { AiCompletionInput, LanguageModelConfig } from "./ai.types";
import { normalizeProviderResponse } from "./normalizer";
import { buildTutorMessages } from "./prompts/system";
import { createProvider } from "./providers";

const DEFAULT_MAX_TOKENS = 700;
const DEFAULT_TEMPERATURE = 0.4;
const DEFAULT_TIMEOUT_MS = 30_000;

function notConfigured(): AppError {
  return new AppError(
    503,
    "AI_PROVIDER_NOT_CONFIGURED",
    "AI Tutor is not configured yet. Please try again later.",
  );
}

export async function generateLearningResponse(
  input: AiCompletionInput,
): Promise<LearningResponse> {
  const { ai } = config;
  if (ai.provider === "" || ai.apiKey === "") {
    throw notConfigured();
  }

  const provider = createProvider(ai.provider);

  const modelConfig: LanguageModelConfig = {
    provider: ai.provider,
    apiKey: ai.apiKey,
    model: ai.model,
    maxTokens: DEFAULT_MAX_TOKENS,
    temperature: DEFAULT_TEMPERATURE,
    timeoutMs: DEFAULT_TIMEOUT_MS,
  };

  const messages = buildTutorMessages(input.question);
  const raw = await provider.complete(messages, modelConfig);

  return normalizeProviderResponse(input.question, raw);
}
