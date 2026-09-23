export function buildOpenAiEmbeddingRequest(model, inputs) {
  return {
    model,
    input: inputs,
  };
}
export function parseOpenAiEmbeddingResponse(body, expectedCount) {
  if (typeof body !== "object" || body === null) {
    return null;
  }
  const data = body.data;
  if (!Array.isArray(data) || data.length !== expectedCount) {
    return null;
  }
  const sorted = [...data].sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
  const vectors = [];
  for (const item of sorted) {
    if (!Array.isArray(item.embedding)) {
      return null;
    }
    const vector = item.embedding;
    if (!vector.every((value) => typeof value === "number")) {
      return null;
    }
    vectors.push(vector);
  }
  return vectors;
}
