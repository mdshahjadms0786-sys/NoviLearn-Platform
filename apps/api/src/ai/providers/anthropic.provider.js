import { AppError } from "../../errors.js";
import { logger } from "../../logger.js";
const ANTHROPIC_MESSAGES_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
export function buildAnthropicRequest(messages, settings) {
  return {
    model: settings.model,
    max_tokens: settings.maxTokens,
    temperature: settings.temperature,
    system: messages.system,
    messages: [
      {
        role: "user",
        content: messages.user,
      },
    ],
  };
}
export function parseAnthropicResponse(body) {
  if (typeof body !== "object" || body === null) {
    return null;
  }
  const content = body.content;
  if (!Array.isArray(content)) {
    return null;
  }
  for (const block of content) {
    const textBlock = block;
    if (textBlock.type === "text" && typeof textBlock.text === "string") {
      return textBlock.text;
    }
  }
  return null;
}
function providerUnavailable() {
  return new AppError(
    502,
    "AI_PROVIDER_ERROR",
    "AI Tutor is temporarily unavailable",
  );
}
export class AnthropicProvider {
  name = "anthropic";
  async complete(messages, settings) {
    let response;
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
    let body;
    try {
      body = await response.json();
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
