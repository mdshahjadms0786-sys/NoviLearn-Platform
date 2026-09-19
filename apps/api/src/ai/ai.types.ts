import type { AiProviderName } from "@novilearn/types";

export interface LanguageModelMessage {
  system: string;
  user: string;
}

export interface LanguageModelConfig {
  provider: AiProviderName;
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
  timeoutMs: number;
}

export interface LanguageModelProvider {
  readonly name: AiProviderName;
  complete(
    messages: LanguageModelMessage,
    config: LanguageModelConfig,
  ): Promise<string>;
}

export interface AiCompletionInput {
  question: string;
  userId: string;
}

export interface ProviderRawContent {
  summary?: string;
  explanation?: string;
  keyPoints?: string[];
  example?: string;
  analogy?: string;
  followUps?: string[];
  relatedConcepts?: string[];
  nextTopics?: string[];
  visualRepresentation?: unknown;
}
