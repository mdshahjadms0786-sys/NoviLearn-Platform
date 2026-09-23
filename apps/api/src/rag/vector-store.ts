import { Prisma } from "@prisma/client";

import { prisma } from "../prisma";
import type { KnowledgeChunkInput, KnowledgeChunkRecord, RawChunkRow } from "./types";

export interface VectorSearchOptions {
  topK: number;
  minScore: number;
}

export interface VectorStore {
  search(
    embedding: number[],
    options: VectorSearchOptions,
  ): Promise<KnowledgeChunkRecord[]>;
  insertPending(inputs: KnowledgeChunkInput[]): Promise<number>;
  setEmbedding(checksum: string, embedding: number[]): Promise<void>;
  pendingCount(): Promise<number>;
}

function toRecord(row: RawChunkRow): KnowledgeChunkRecord {
  const similarity =
    row.similarity !== undefined ? Number(row.similarity) : undefined;
  const record: KnowledgeChunkRecord = {
    id: row.id,
    source: row.source,
    title: row.title,
    topic: row.topic,
    content: row.content,
    metadata:
      row.metadata === null || row.metadata === undefined
        ? null
        : (row.metadata as Record<string, unknown>),
    embedding: row.embedding as number[],
    checksum: row.checksum,
    chunkIndex: row.chunkIndex,
  };
  if (similarity !== undefined) {
    record.similarity = similarity;
  }
  return record;
}

export class PostgresVectorStore implements VectorStore {
  async search(
    embedding: number[],
    options: VectorSearchOptions,
  ): Promise<KnowledgeChunkRecord[]> {
    if (embedding.length === 0) {
      return [];
    }
    const rows = await prisma.$queryRaw<RawChunkRow[]>`
      SELECT id, source, title, topic, content, metadata, embedding, checksum, "chunkIndex",
             cosine_similarity(embedding, ${embedding}::double precision[]) AS similarity
      FROM knowledge_chunks
      WHERE cardinality(embedding) > 0
        AND cosine_similarity(embedding, ${embedding}::double precision[]) >= ${options.minScore}
      ORDER BY similarity DESC, "chunkIndex" ASC
      LIMIT ${options.topK}
    `;
    return rows.map(toRecord);
  }

  async insertPending(inputs: KnowledgeChunkInput[]): Promise<number> {
    const values = inputs.map((input) => ({
      source: input.source,
      title: input.title,
      topic: input.topic,
      content: input.content,
      metadata: (input.metadata ?? Prisma.JsonNull) as Prisma.InputJsonValue,
      checksum: input.checksum,
      chunkIndex: input.chunkIndex,
      embedding: [],
    }));
    const created = await prisma.knowledgeChunk.createMany({
      data: values,
      skipDuplicates: true,
    });
    return created.count;
  }

  async setEmbedding(checksum: string, embedding: number[]): Promise<void> {
    await prisma.knowledgeChunk.update({
      where: { checksum },
      data: { embedding },
    });
  }

  async pendingCount(): Promise<number> {
    return prisma.knowledgeChunk.count({
      where: { embedding: { isEmpty: true } },
    });
  }
}

export const vectorStore: VectorStore = new PostgresVectorStore();