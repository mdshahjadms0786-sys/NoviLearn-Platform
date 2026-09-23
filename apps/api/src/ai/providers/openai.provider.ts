import { AppError } from "../../errors";
import { logger } from "../../logger";
import type {
  LanguageModelConfig,
  LanguageModelMessage,
  LanguageModelProvider,
} from "../ai.types";

const OPENAI_CHAT_COMPLETIONS_URL =
  "https://api.openai.com/v1/chat/completions";

interface ChatCompletionChoice {
  message?: { content?: string };
}

interface ChatCompletionResponse {
  choices?: ChatCompletionChoice[];
}

function providerUnavailable(): AppError {
  return new AppError(
    502,
    "AI_PROVIDER_ERROR",
    "AI Tutor is temporarily unavailable",
  );
}

export class OpenAiProvider implements LanguageModelProvider {
  readonly name = "openai" as const;

  async complete(
    messages: LanguageModelMessage,
    settings: LanguageModelConfig,
  ): Promise<string> {
    let response: Response;
    try {
      response = await fetch(OPENAI_CHAT_COMPLETIONS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${settings.apiKey}`,
        },
        body: JSON.stringify({
          model: settings.model,
          messages: [
            { role: "system", content: messages.system },
            { role: "user", content: messages.user },
          ],
          temperature: settings.temperature,
          max_tokens: settings.maxTokens,
          response_format: { type: "json_object" },
        }),
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

    let body: ChatCompletionResponse;
    try {
      body = (await response.json()) as ChatCompletionResponse;
    } catch {
      logger.error("[ai] provider returned invalid json", {
        provider: this.name,
      });
      throw providerUnavailable();
    }

    const content = body.choices?.[0]?.message?.content;
    if (!content || content.trim() === "") {
      logger.error("[ai] provider returned empty content", {
        provider: this.name,
      });
      throw providerUnavailable();
    }

    return content;
  }
}
