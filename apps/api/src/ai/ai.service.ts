import type { LearningResponse } from "@novilearn/types";

import { config } from "../config";
import { AppError } from "../errors";
import type {
  AiCompletionInput,
  LanguageModelConfig,
  LanguageModelMessage,
} from "./ai.types";
import { normalizeProviderResponse } from "./normalizer";
import { buildGrounding } from "../rag/rag.service";
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

export interface ProviderCompletionOptions {
  messages: LanguageModelMessage;
  maxTokens?: number;
}

export async function completeProviderRequest(
  options: ProviderCompletionOptions,
): Promise<string> {
  const { ai } = config;
  if (ai.provider === "" || ai.apiKey === "") {
    throw notConfigured();
  }

  const provider = createProvider(ai.provider);

  const modelConfig: LanguageModelConfig = {
    provider: ai.provider,
    apiKey: ai.apiKey,
    model: ai.model,
    maxTokens: options.maxTokens ?? DEFAULT_MAX_TOKENS,
    temperature: DEFAULT_TEMPERATURE,
    timeoutMs: DEFAULT_TIMEOUT_MS,
  };

  return provider.complete(options.messages, modelConfig);
}

export async function generateLearningResponse(
  input: AiCompletionInput,
): Promise<LearningResponse> {
  const grounding = await buildGrounding(input.userId, input.question);
  const raw = await completeProviderRequest({
    messages: buildTutorMessages(input.question, grounding),
  });

  const response = normalizeProviderResponse(input.question, raw);
  if (grounding.sources.length > 0) {
    response.sources = grounding.sources;
  }
  return response;
}
