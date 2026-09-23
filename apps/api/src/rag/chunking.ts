import { createHash } from "node:crypto";

import type { KnowledgeChunkInput } from "./types";

const MAX_CHUNK_CHARS = 900;

export interface ChunkCandidate {
  content: string;
  chunkIndex: number;
  checksum: string;
}

function hashChecksum(source: string, chunkIndex: number, content: string): string {
  return createHash("sha1")
    .update(`${source}:${chunkIndex}:${content}`)
    .digest("hex")
    .slice(0, 32);
}

/**
 * Deterministic paragraph-based chunking. Paragraphs are accumulated up to
 * MAX_CHUNK_CHARS. Checksums are stable across runs so re-ingestion is a no-op.
 */
export function splitIntoChunks(
  source: string,
  text: string,
): ChunkCandidate[] {
  const paragraphs = text
    .split(/\r?\n\r?\n|\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);

  const chunks: ChunkCandidate[] = [];
  let current: string[] = [];
  let currentLength = 0;
  let chunkIndex = 0;

  for (const paragraph of paragraphs) {
    if (currentLength + paragraph.length + 1 > MAX_CHUNK_CHARS && currentLength > 0) {
      const content = current.join("\n\n");
      chunks.push({ content, chunkIndex, checksum: hashChecksum(source, chunkIndex, content) });
      chunkIndex += 1;
      current = [];
      currentLength = 0;
    }
    current.push(paragraph);
    currentLength += paragraph.length + 2;
  }

  if (current.length > 0) {
    const content = current.join("\n\n");
    chunks.push({ content, chunkIndex, checksum: hashChecksum(source, chunkIndex, content) });
  }

  return chunks;
}

export function toChunkInputs(
  source: string,
  title: string,
  topic: string,
  text: string,
  metadata?: Record<string, unknown>,
): KnowledgeChunkInput[] {
  return splitIntoChunks(source, text).map((chunk) => ({
    source,
    title,
    topic,
    content: chunk.content,
    ...(metadata !== undefined ? { metadata } : {}),
    checksum: chunk.checksum,
    chunkIndex: chunk.chunkIndex,
  }));
}