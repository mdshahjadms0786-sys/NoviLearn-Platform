import { AppError } from "../../errors";
import { logger } from "../../logger";
import type {
  LanguageModelConfig,
  LanguageModelMessage,
  LanguageModelProvider,
} from "../ai.types";

const ANTHROPIC_MESSAGES_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";

export interface AnthropicRequestPayload {
  model: string;
  max_tokens: number;
  temperature: number;
  system: string;
  messages: { role: "user"; content: string }[];
}

interface AnthropicTextBlock {
  type?: string;
  text?: string;
}

export function buildAnthropicRequest(
  messages: LanguageModelMessage,
  settings: LanguageModelConfig,
): AnthropicRequestPayload {
  return {
    model: settings.model,
    max_tokens: settings.maxTokens,
    temperature: settings.temperature,
    system: messages.system,
    messages: [{ role: "user", content: messages.user }],
  };
}

export function parseAnthropicResponse(body: unknown): string | null {
  if (typeof body !== "object" || body === null) {
    return null;
  }
  const content = (body as { content?: unknown }).content;
  if (!Array.isArray(content)) {
    return null;
  }
  for (const block of content) {
    const textBlock = block as AnthropicTextBlock;
    if (textBlock.type === "text" && typeof textBlock.text === "string") {
      return textBlock.text;
    }
  }
  return null;
}

function providerUnavailable(): AppError {
  return new AppError(
    502,
    "AI_PROVIDER_ERROR",
    "AI Tutor is temporarily unavailable",
  );
}

export class AnthropicProvider implements LanguageModelProvider {
  readonly name = "anthropic" as const;

  async complete(
    messages: LanguageModelMessage,
    settings: LanguageModelConfig,
  ): Promise<string> {
    let response: Response;
    try {
      response = await fetch(ANTHROPIC_MESSAGES_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": settings.apiKey,
          "anthropic-version": ANTHROPIC_VERSION,
        },
        body: JSON.stringify(buildAnthropicRequest(messages, settings)),
        signal: AbortSignal.timeout(settings.timeoutMs),
      });
    } catch (error) {
      logger.error("[ai] provider request failed", {
        provider: this.name,
        reason: error instanceof Error ? error.message : "unknown error",
      });
      throw providerUnavailable();
    }

    if (!response.ok) {
      logger.error("[ai] provider http error", {
        provider: this.name,
        status: response.status,
      });
      throw providerUnavailable();
    }

    let body: unknown;
    try {
      body = (await response.json()) as unknown;
    } catch {
      logger.error("[ai] provider returned invalid json", {
        provider: this.name,
      });
      throw providerUnavailable();
    }

    const content = parseAnthropicResponse(body);
    if (content === null || content.trim() === "") {
      logger.error("[ai] provider returned empty content", {
        provider: this.name,
      });
      throw providerUnavailable();
    }

    return content;
  }
}