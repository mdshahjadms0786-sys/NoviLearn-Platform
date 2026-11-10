import { AppError } from "../../errors.js";
import { logger } from "../../logger.js";

const GEMINI_API_BASE =
  "https://generativelanguage.googleapis.com/v1beta/models";

function providerUnavailable() {
  return new AppError(
    502,
    "AI_PROVIDER_ERROR",
    "Gemini AI Tutor is temporarily unavailable",
  );
}

export class GeminiProvider {
  name = "gemini";

  async complete(messages, settings) {
    const model = settings.model || "gemini-1.5-flash";
    const endpoint = `${GEMINI_API_BASE}/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(settings.apiKey)}`;

    let response;
    try {
      response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: messages.system }],
          },
          contents: [
            {
              role: "user",
              parts: [{ text: messages.user }],
            },
          ],
          generationConfig: {
            response_mime_type: "application/json",
            temperature: settings.temperature ?? 0.4,
            maxOutputTokens: settings.maxTokens ?? 2048,
          },
        }),
        signal: AbortSignal.timeout(settings.timeoutMs || 30_000),
      });
    } catch (error) {
      logger.error("[ai] gemini request failed", {
        provider: this.name,
        reason: error instanceof Error ? error.message : "unknown error",
      });
      throw providerUnavailable();
    }

    if (!response.ok) {
      let errText = "";
      try {
        errText = await response.text();
      } catch {
        // ignore
      }
      logger.error("[ai] gemini http error", {
        provider: this.name,
        status: response.status,
        detail: errText,
      });
      throw providerUnavailable();
    }

    let body;
    try {
      body = await response.json();
    } catch {
      logger.error("[ai] gemini returned invalid json", {
        provider: this.name,
      });
      throw providerUnavailable();
    }

    const content = body.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content || content.trim() === "") {
      logger.error("[ai] gemini returned empty content", {
        provider: this.name,
      });
      throw providerUnavailable();
    }

    return content;
  }
}
