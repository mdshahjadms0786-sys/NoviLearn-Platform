export interface KnowledgeChunkInput {
  source: string;
  title: string;
  topic: string;
  content: string;
  metadata?: Record<string, unknown>;
  checksum: string;
  chunkIndex: number;
}

export interface KnowledgeChunkRecord {
  id: string;
  source: string;
  title: string;
  topic: string;
  content: string;
  metadata: Record<string, unknown> | null;
  embedding: number[];
  checksum: string;
  chunkIndex: number;
  similarity?: number;
}

export interface RawChunkRow {
  id: string;
  source: string;
  title: string;
  topic: string;
  content: string;
  metadata: unknown;
  embedding: unknown;
  checksum: string;
  chunkIndex: number;
  similarity?: number | bigint;
}

export interface PersonalContext {
  knownTopics: string[];
  practicedTopics: string[];
  weakTopics: string[];
}

export interface GroundingContext {
  systemContext: string;
  sources: import("@novilearn/types").KnowledgeSource[];
}