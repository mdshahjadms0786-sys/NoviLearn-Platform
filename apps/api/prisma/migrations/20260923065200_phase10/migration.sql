-- CreateTable
CREATE TABLE "knowledge_chunks" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "embedding" DOUBLE PRECISION[] DEFAULT ARRAY[]::DOUBLE PRECISION[],
    "checksum" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_chunks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rate_limit_buckets" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "windowStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rate_limit_buckets_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "ai_recent_entries" (
    "userId" TEXT NOT NULL,
    "requestHash" TEXT NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_recent_entries_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "active_practice_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "active_practice_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "topics" (
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "topics_pkey" PRIMARY KEY ("slug")
);

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_chunks_checksum_key" ON "knowledge_chunks"("checksum");

-- CreateIndex
CREATE INDEX "knowledge_chunks_topic_idx" ON "knowledge_chunks"("topic");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_chunks_source_chunkIndex_key" ON "knowledge_chunks"("source", "chunkIndex");

-- CreateIndex
CREATE INDEX "rate_limit_buckets_expiresAt_idx" ON "rate_limit_buckets"("expiresAt");

-- CreateIndex
CREATE INDEX "active_practice_sessions_userId_expiresAt_idx" ON "active_practice_sessions"("userId", "expiresAt");

-- CreateIndex
CREATE INDEX "active_practice_sessions_expiresAt_idx" ON "active_practice_sessions"("expiresAt");

-- CreateIndex
CREATE INDEX "topics_name_idx" ON "topics"("name");

-- AddForeignKey
ALTER TABLE "active_practice_sessions" ADD CONSTRAINT "active_practice_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateFunction
CREATE OR REPLACE FUNCTION "cosine_similarity"("a" double precision[], "b" double precision[])
RETURNS double precision
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  "dot" double precision := 0;
  "noma" double precision := 0;
  "nomb" double precision := 0;
  "i" integer;
BEGIN
  IF array_length("a", 1) IS NULL OR array_length("b", 1) IS NULL THEN
    RETURN 0;
  END IF;
  IF array_length("a", 1) <> array_length("b", 1) THEN
    RETURN 0;
  END IF;
  FOR "i" IN array_lower("a", 1)..array_upper("a", 1) LOOP
    "dot" := "dot" + ("a"["i"] * "b"["i"]);
    "noma" := "noma" + ("a"["i"] * "a"["i"]);
    "nomb" := "nomb" + ("b"["i"] * "b"["i"]);
  END LOOP;
  IF "noma" = 0 OR "nomb" = 0 THEN
    RETURN 0;
  END IF;
  RETURN "dot" / (sqrt("noma") * sqrt("nomb"));
END;
$$;

