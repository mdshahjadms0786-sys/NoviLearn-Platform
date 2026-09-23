import { embedTexts } from "../ai/embeddings/service.js";
import { logger } from "../logger.js";
import { prisma } from "../prisma.js";
import { vectorStore } from "./vector-store.js";
/**
 * Two-phase ingestion: insert chunks with an empty embedding first (deduped by
 * checksum), then backfill embeddings for anything still pending. Runs without
 * an embedding provider, ingestion still lands chunks (embedded later).
 */
export async function ingestKnowledge(inputs) {
  if (inputs.length === 0) {
    return {
      attempted: 0,
      inserted: 0,
      embedded: 0,
    };
  }
  const inserted = await vectorStore.insertPending(inputs);
  const embedded = await embedAllPending();
  return {
    attempted: inputs.length,
    inserted,
    embedded,
  };
}
export async function embedAllPending() {
  const pending = await vectorStore.pendingCount();
  if (pending === 0) {
    return 0;
  }
  const candidates = await prisma.knowledgeChunk.findMany({
    where: {
      embedding: {
        isEmpty: true,
      },
    },
    select: {
      checksum: true,
      content: true,
    },
    take: 200,
  });
  if (candidates.length === 0) {
    return 0;
  }
  const contents = candidates.map((candidate) => candidate.content);
  const vectors = await embedTexts(contents);
  if (vectors === null) {
    logger.info("[rag] no embedding provider, chunks left pending", {
      count: candidates.length,
    });
    return 0;
  }
  let embedded = 0;
  for (let i = 0; i < candidates.length; i += 1) {
    const candidate = candidates[i];
    const vector = vectors[i];
    if (candidate === undefined || vector === undefined) {
      continue;
    }
    await vectorStore.setEmbedding(candidate.checksum, vector);
    embedded += 1;
  }
  return embedded;
}
