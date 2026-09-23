import { config } from "../config.js";
import { AppError } from "../errors.js";
import { normalizeProviderResponse } from "./normalizer.js";
import { buildGrounding } from "../rag/rag.service.js";
import { buildTutorMessages } from "./prompts/system.js";
import { createProvider } from "./providers/index.js";
const DEFAULT_MAX_TOKENS = 700;
const DEFAULT_TEMPERATURE = 0.4;
const DEFAULT_TIMEOUT_MS = 30_000;
function notConfigured() {
  return new AppError(
    503,
    "AI_PROVIDER_NOT_CONFIGURED",
    "AI Tutor is not configured yet. Please try again later.",
  );
}
export async function completeProviderRequest(options) {
  const { ai } = config;
  if (ai.provider === "" || ai.apiKey === "") {
    throw notConfigured();
  }
  const provider = createProvider(ai.provider);
  const modelConfig = {
    provider: ai.provider,
    apiKey: ai.apiKey,
    model: ai.model,
    maxTokens: options.maxTokens ?? DEFAULT_MAX_TOKENS,
    temperature: DEFAULT_TEMPERATURE,
    timeoutMs: DEFAULT_TIMEOUT_MS,
  };
  return provider.complete(options.messages, modelConfig);
}
export async function generateLearningResponse(input) {
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
