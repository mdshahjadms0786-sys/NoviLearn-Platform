import { Prisma } from "@prisma/client";

import { prisma } from "../prisma.js";
function toRecord(row) {
  const similarity =
    row.similarity !== undefined ? Number(row.similarity) : undefined;
  const record = {
    id: row.id,
    source: row.source,
    title: row.title,
    topic: row.topic,
    content: row.content,
    metadata:
      row.metadata === null || row.metadata === undefined ? null : row.metadata,
    embedding: row.embedding,
    checksum: row.checksum,
    chunkIndex: row.chunkIndex,
  };
  if (similarity !== undefined) {
    record.similarity = similarity;
  }
  return record;
}
export class PostgresVectorStore {
  async search(embedding, options) {
    if (embedding.length === 0) {
      return [];
    }
    const rows = await prisma.$queryRaw`
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
  async insertPending(inputs) {
    const values = inputs.map((input) => ({
      source: input.source,
      title: input.title,
      topic: input.topic,
      content: input.content,
      metadata: input.metadata ?? Prisma.JsonNull,
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
  async setEmbedding(checksum, embedding) {
    await prisma.knowledgeChunk.update({
      where: {
        checksum,
      },
      data: {
        embedding,
      },
    });
  }
  async pendingCount() {
    return prisma.knowledgeChunk.count({
      where: {
        embedding: {
          isEmpty: true,
        },
      },
    });
  }
}
export const vectorStore = new PostgresVectorStore();
