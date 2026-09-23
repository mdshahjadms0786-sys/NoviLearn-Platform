function hashToken(token) {
  let hash = 0;
  for (let i = 0; i < token.length; i += 1) {
    hash = (hash * 31 + token.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}
function tokenize(input) {
  return input
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 0);
}

/**
 * Deterministic local pseudo-embedding for development and tests when no
 * embedding API key is configured. Not semantically reliable — production
 * deployments should use a real embedding provider (e.g. openai).
 */
export function localEmbedInputs(inputs, dimension) {
  return inputs.map((input) => {
    const vector = new Array(dimension).fill(0);
    const tokens = tokenize(input);
    for (const token of tokens) {
      const bucket = hashToken(token) % Math.max(dimension, 1);
      const index = Math.min(bucket, dimension - 1);
      vector[index] += 1;
    }
    const norm = Math.sqrt(
      vector.reduce((sum, value) => sum + value * value, 0),
    );
    if (norm === 0) {
      return vector;
    }
    return vector.map((value) => value / norm);
  });
}
