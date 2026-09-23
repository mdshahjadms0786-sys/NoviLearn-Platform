export interface OpenAiEmbeddingRequestPayload {
  model: string;
  input: string[];
}

interface OpenAiEmbeddingData {
  index?: number;
  embedding?: unknown;
}

interface OpenAiEmbeddingResponse {
  data?: OpenAiEmbeddingData[];
}

export function buildOpenAiEmbeddingRequest(
  model: string,
  inputs: string[],
): OpenAiEmbeddingRequestPayload {
  return { model, input: inputs };
}

export function parseOpenAiEmbeddingResponse(
  body: unknown,
  expectedCount: number,
): number[][] | null {
  if (typeof body !== "object" || body === null) {
    return null;
  }
  const data = (body as OpenAiEmbeddingResponse).data;
  if (!Array.isArray(data) || data.length !== expectedCount) {
    return null;
  }
  const sorted = [...data].sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
  const vectors: number[][] = [];
  for (const item of sorted) {
    if (!Array.isArray(item.embedding)) {
      return null;
    }
    const vector = item.embedding as unknown[];
    if (!vector.every((value) => typeof value === "number")) {
      return null;
    }
    vectors.push(vector as number[]);
  }
  return vectors;
}