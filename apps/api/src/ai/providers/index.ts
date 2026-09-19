import type { AiProviderName } from "@novilearn/types";

import { AppError } from "../../errors";
import type { LanguageModelProvider } from "../ai.types";
import { OpenAiProvider } from "./openai.provider";

const PROVIDERS: Record<AiProviderName, LanguageModelProvider> = {
  openai: new OpenAiProvider(),
};

export function createProvider(name: AiProviderName): LanguageModelProvider {
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
