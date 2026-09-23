import { localEmbedInputs } from "./local";
import { config } from "../../config";
import { AppError } from "../../errors";
import { logger } from "../../logger";
import {
  buildOpenAiEmbeddingRequest,
  parseOpenAiEmbeddingResponse,
} from "./providers/openai.embeddings";

const OPENAI_EMBEDDINGS_URL = "https://api.openai.com/v1/embeddings";
const EMBEDDING_TIMEOUT_MS = 30_000;

function unavailable(): AppError {
  return new AppError(
    503,
    "EMBEDDING_PROVIDER_NOT_CONFIGURED",
    "Embeddings are not configured yet.",
  );
}

export async function embedTexts(inputs: string[], signal?: AbortSignal): Promise<number[][] | null> {
  const { provider, apiKey, model, dimension } = config.embeddings;
  if (provider === "") {
    return null;
  }
  if (inputs.length === 0) {
    return [];
  }

  if (provider === "local") {
    return localEmbedInputs(inputs, dimension);
  }

  if (provider === "openai") {
    if (apiKey === "") {
      throw unavailable();
    }
    let response: Response;
    try {
      response = await fetch(OPENAI_EMBEDDINGS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(buildOpenAiEmbeddingRequest(model, inputs)),
        signal: signal ?? AbortSignal.timeout(EMBEDDING_TIMEOUT_MS),
      });
    } catch (err: unknown) {
      logger.error("[embeddings] request failed", logger.toError(err));
      throw unavailable();
    }

    if (!response.ok) {
      logger.error("[embeddings] http error", { status: response.status });
      throw unavailable();
    }

    let body: unknown;
    try {
      body = (await response.json()) as unknown;
    } catch {
      logger.error("[embeddings] invalid json");
      throw unavailable();
    }

    const vectors = parseOpenAiEmbeddingResponse(body, inputs.length);
    if (vectors === null) {
      logger.error("[embeddings] unexpected payload shape");
      throw unavailable();
    }
    if (vectors.some((vector) => vector.length !== dimension)) {
      logger.error("[embeddings] dimension mismatch", {
        expected: dimension,
      });
      throw unavailable();
    }
    return vectors;
  }

  logger.error("[embeddings] unknown provider", { provider });
  return null;
}

export async function embedText(input: string): Promise<number[] | null> {
  const vectors = await embedTexts([input]);
  return vectors?.[0] ?? null;
}