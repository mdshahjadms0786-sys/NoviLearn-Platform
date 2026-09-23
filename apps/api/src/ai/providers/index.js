import { AnthropicProvider } from "./anthropic.provider.js";
import { OpenAiProvider } from "./openai.provider.js";
import { AppError } from "../../errors.js";
const PROVIDERS = {
  openai: new OpenAiProvider(),
  anthropic: new AnthropicProvider(),
};
export function createProvider(name) {
  const provider = PROVIDERS[name];
  if (!provider) {
    throw new AppError(
      503,
      "AI_PROVIDER_NOT_CONFIGURED",
      "AI Tutor is not configured yet",
    );
  }
  return provider;
}
