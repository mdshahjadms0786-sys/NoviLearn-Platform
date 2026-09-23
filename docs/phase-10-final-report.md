# Phase 10 Final Report — Production Readiness, RAG, LLM Enhancement & Personalization

Phase 10 — Production readiness & scalability (WS1–WS2), RAG with embeddings (WS3), LLM enhancement with grounding (WS4), personalization upgrade (WS5), web + mobile polish (WS6), observability & performance (WS8), automated phase-10 testing (WS9), full verification (WS10), and CI/Docker/docs (WS11) — is **complete**. All Phase-1–9 product behavior is preserved: the Phase-8 and Phase-9 suites stay green (19 + 54 + 52 + 48) alongside the new Phase-10 suites (63 unit + 31 integration), the API builds and boots in production mode, web `next build` and the mobile Android export both pass, and nothing was committed or pushed.

---

## 1. Goal

Take the Phase-1–9 product to production readiness and scalability without regressions: durable DB-backed rate limiting and duplicate protection, a Retrieval-Augmented Generation (RAG) pipeline with real embedding-backed retrieval (no external vector database), LLM responses grounded in retrieved learning content, richer personalization (deduplicated topic slugs + recency-based suggestions), a graceful 401-handling + grounding-sources UX on both clients, hardened logging/observability, and CI + containerized deployment.

## 2. Scope

**Included**

- **WS1** — Shared contracts & build pipeline (workspace packages build to `tsc` output while `main` keeps resolving to `src` for dev; production API runs `node --import tsx dist/index.js`); Prisma schema + migrations for Phase-10 storage; `cosine_similarity(float8[], float8[])` SQL function; env/config, structured logger, `/health` + `/readiness`, Sentry, production start script
- **WS2** — DB-backed rate limiting (`rate_limit_buckets`, PostgreSQL `INSERT … ON CONFLICT` with count reading) that **preserves the exact Phase-9 burst semantics**; DB-backed per-user AI duplicate dedupe (`ai_recent_entries`); hybrid practice-session store with synchronous create + background DB persistence
- **WS3** — RAG suite: deterministic local embeddings (fallback) + OpenAI embeddings, chunking (`splitIntoChunks` / `toChunkInputs`), `cosine_similarity` retrieval, swappable vector-store interface, `KnowledgeChunk` ingestion + CLI
- **WS4** — Anthropic completions provider registered alongside OpenAI; RAG grounding injected into the tutor prompt (`buildTutorMessages(question, grounding?)`); `response.sources` attached only when non-empty; ungrounded fallback keeps the Phase-9 `503` contract when AI is unconfigured
- **WS5** — Personalization upgrade: slug-deduplicated topic upserts (`topics`), recency-ranked suggestions (`continue_learning` prioritized, kinds preserved) while keeping the Phase-8 suggestion contract
- **WS6** — 401 auth-event wiring on web + mobile (graceful sign-out on mid-session expiry) and a `KnowledgeSource` grounding-sources component rendered in both learning experiences
- **WS8** — Security/perf pass: owner-scoping and index audit of every per-user query, fragment-based secret redaction in the logger
- **WS9** — `scripts/phase10-unit-tests.ts` (63 checks) + `scripts/phase10-integration-tests.ts` (31 checks) + `scripts/phase10-restart-check.ts` + `scripts/phase10-cleanup.ts`
- **WS10** — Verification: root `typecheck` + `lint`, `prisma validate` + `migrate status`, `pnpm -r run build`, `next build`, `expo export --platform android`, all test suites green on a fresh DB
- **WS11** — Root `Dockerfile`, `.dockerignore`, `docker-compose.yml`, `.github/workflows/ci.yml`, development-guide additions

**Excluded (deliberately)**

- Microservices, Redis/Kafka/Elasticsearch, a dedicated vector database, ML model training, external agents, teacher dashboards — explicitly out of scope for this student-only milestone
- Streaming LLM output (we keep a structured JSON contract)
- Live AI success-path testing (requires server-side provider keys this environment deliberately lacks — see §9)

## 3. What Was Built

### WS1 — Foundation & contracts

- Prisma schema additions (migration `20260923065200_phase10`, applied on top of baseline `20260923065022_init`): `knowledge_chunks` (`embedding DOUBLE PRECISION[]` — pgvector is unavailable, so embeddings are plain float arrays queried by the `cosine_similarity` SQL function), `rate_limit_buckets`, `ai_recent_entries`, `active_practice_sessions`, `topics`; both migration files rewritten as UTF-8 without BOM (fixes P3018 / `42601`).
- Workspace packages emit compiled output (`tsconfig.build.json`, `noEmit:false`) while `main`/`types` keep `./src/index.ts` so dev and tests keep resolving source; API production start = `node --import tsx dist/index.js`.
- `@novilearn/config` centralized env loading (`loadEnvFile()` — never overrides already-set `process.env` keys, tolerates a missing `.env`, so containers work from environment variables only), stricter config zod schema for the new AI/RAG/vars.
- Structured logger (pino) with fragment-based secret redaction, `/health` (readiness + database status), Sentry integration, `LOG_LEVEL` support.

### WS2 — Scalability primitives

- **DB rate limiter**: `INSERT … ON CONFLICT ("key") DO UPDATE SET "count" = "rate_limit_buckets"."count" + 1 RETURNING "count"`; allowed when `count <= max`. Phase-9's limiter call sites pass a `name`, so the new backend reproduces the exact window semantics the Phase-9 tests assert (“18 of 20 burst allowed, 21st → 429”). Fail-open on DB errors. Auth login 30/15 min per IP, signup 20/hr per IP, practice generate 20/user, practice action 200/user, progress 300/user, AI 20/user/10 min.
- **DB dedupe**: `AiRecentEntry` read-before-request + upsert on `res.on("finish")` for 2xx–3xx, fail-open — a duplicate identical AI request within 10 s returns `429 AI_REQUEST_DUPLICATE` even across processes.
- **Hybrid session store**: synchronous `createPracticeSession` (Phase-8/9 tests read `sessionId` immediately), async `getValidPracticeSession`, exported `savePracticeSession`, eviction capped at 1000 in-memory entries, and DB-backed persistence of active practice sessions. A write race was found and fixed (§5).

### WS3 — RAG / embeddings

- Vector-store interface swappable behind `getVectorStore()`; `local` provider = deterministic seeded hashing (crypto) into a configured dimension (default 64 → `localEmbedInputs` gens 32-dim), `openai` provider = `EMBEDDING_MODEL`/`EMBEDDING_DIMENSION`.
- Chunking: recursive splitter with 900-char chunks / 150 overlap, dedupe by `sha256` checksum, `toChunkInputs` with bounded batch size and cap; `knowledge_chunks` stores text + embedding + checksum + `(source, chunkIndex)` unique.
- Retrieval: `cosine_similarity(chunk.embedding, $query)` ordered desc, filtered by `RAG_MIN_SCORE` (0.3), `RAG_TOP_K` (4), returned as `KnowledgeSource[]` with bounded confidence/excerpt. No external vector DB needed.
- **Ingestion CLI** `scripts/ingest-knowledge.ts`: reads `.md`/`.csv`/`.json`/plain-text files from a directory, chunks, embeds (local or openai), upserts by checksum, and prints per-source stats.

### WS4 — LLM + grounding

- Anthropic `anthropic` provider (messages API, `AI_MODEL`), both providers normalized to `parseCompletionResponse` → `AiTutorResponse`; invalid/malformed provider output is caught and mapped to `502 AI_RESPONSE_INVALID` (unit-tested).
- RAG grounding: `buildTutorMessages(question, grounding?)` injects retrieved content as a `[SYSTEM CONTEXT]` block; the model is instructed to answer from context when available and to mark uncertainty otherwise; the structured JSON contract remains unchanged.
- `response.sources` optional array attached only when retrieval returned non-empty results; best-effort: any RAG/provider/DB failure falls back to the ungrounded path (Phase-9 `503` behavior intact when AI is unconfigured).

### WS5 — Personalization upgrade

- `recordLearningActivity` upserts `topics` with a slug-deduplicated key + normalized lowercase name (`zygotes` for “Zygotes”); weak topics (from practice without learning activity) merge into the same row.
- Suggestions: `continue_learning` promotes previously-seen-but-mastery-below-threshold topics ranked by recency over `practice`/`weak`/`related` kinds; ordering/dedupe/kind-preservation unit-tested while the Phase-8 suggestion contract (all four kinds, deterministic) is preserved.

### WS6 — Web + mobile polish

- `auth-events.ts` (both clients): tiny listener set exposing `emitAuthEvent` / `onAuthEvent`. Web + mobile `api.ts` emit `unauthorized` when a 401 arrives; the auth stores subscribe and clear the session only when `status === "authenticated" && token` — transient failures keep the session (Phase-9 recovery preserved).
- `learning-sources.tsx` (web + mobile): renders `KnowledgeSource[]` in the learning experience (title, excerpt, confidence, source url) and renders nothing when empty.

### WS8 — Security & performance

- Owner-scoping audit: every per-user query is gated by `userId` (e.g., `progress.service.ts` `where: { id: sessionId, userId }`), cross-user reads return `404`, `KnowledgeChunk` is a global curator corpus by design (no user data). Indexes added on every scoped/filtered column.
- Logger redaction upgraded from an exact-key list to fragment matching against `authorization, api-key, api_key, apikey, cookie, password, secret, token, dsn, privatekey, private_key` so camelCase keys like `embeddingApiKey` are masked too.
- No `console.*` in API code (except the intentional dev startup line), env/config/error-tracking audited clean.

### WS9–11 — Tests, verification, CI/Docker

See §6/§7 and the CI workflow. Docker builds the whole monorepo, applies migrations, and runs the compiled API; docker-compose adds a Postgres 18 service on host port 5433 (no collision with a developer's local Postgres).

## 4. Phase-10 Defects Found and FIXED

### 4.1 CRITICAL — practice-session write race (P2025)

The background `evictExpiredFromDb().then(() => db.activePracticeSession.create(...))` from `createPracticeSession` could race the answer-time `savePracticeSession` update (`... where id = …` found no row → `P2025` crash). **Fix:** `persistOrCreate` upsert helper + `loggedPersist` (P2002-tolerant) in `session-store.ts`; create writes via `evictExpiredFromDb().then(() => loggedPersist(...))`, save uses the upsert. Stress re-runs show no store errors.

### 4.2 CORS in the Phase-8/9 suites vs new rate limiting

Bucket state persists across runs and auth limiters key on client IP, so cumulative logins over repeated local runs could tip into `429`. **Fix:** `rate_limit_buckets` is fully reset before a fresh suite batch (`phase10-cleanup.ts` now truncates all buckets), and CI starts from a fresh Postgres service container every run.

## 5. What Changed (files — headliners)

| File                                                                                                                                              | Change                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `apps/api/prisma/migrations/20260923065022_init/migration.sql`, `…/20260923065200_phase10/migration.sql`                                          | baseline + phase10 schema & `cosine_similarity` function (UTF-8, no BOM)                 |
| `apps/api/src/db/rate-limit.ts`                                                                                                                   | DB-backed limiter preserving phase9 burst semantics                                      |
| `apps/api/src/db/dedupe.ts`                                                                                                                       | DB-backed `AiRecentEntry` dedupe                                                         |
| `apps/api/src/practice/session-store.ts`                                                                                                          | hybrid store + `persistOrCreate`/`loggedPersist` race fix                                |
| `apps/api/src/rag/**`                                                                                                                             | embeddings, chunking, retrieval, vector-store interface, `cosine_similarity` SQL wrapper |
| `apps/api/src/ai/**`                                                                                                                              | anthropic + openai providers, grounding-aware `buildTutorMessages`, sources attachment   |
| `apps/api/src/progress/progress.service.ts`, `apps/api/src/practice/practice.service.ts`                                                          | topic upserting + slugdedupe, weak-topic merge                                           |
| `apps/api/src/logger.ts`                                                                                                                          | fragment-based SENSITIVE redaction                                                       |
| `apps/api/src/config.ts`, `apps/api/src/env.ts`, `src/prisma.ts`                                                                                  | env loading, AI/RAG/Sentry/LOG_LEVEL config, prisma singleton                            |
| `apps/api/scripts/phase10-unit-tests.ts`, `phase10-integration-tests.ts`, `phase10-restart-check.ts`, `phase10-cleanup.ts`, `ingest-knowledge.ts` | new tooling                                                                              |
| `apps/web/src/lib/auth-events.ts`, `apps/mobile/src/lib/auth-events.ts`                                                                           | new auth-event bus                                                                       |
| `apps/web/src/lib/api.ts`, `apps/mobile/src/lib/api.ts`                                                                                           | emit `unauthorized` on 401                                                               |
| `apps/web/src/lib/auth-store.ts`, `apps/mobile/src/lib/auth-store.ts`                                                                             | session-clear only on real 401                                                           |
| `apps/web/src/components/ai/learning-sources.tsx`, `apps/mobile/src/components/ai/learning-sources.tsx`                                           | grounding-sources UI                                                                     |
| `Dockerfile`, `.dockerignore`, `docker-compose.yml`, `.github/workflows/ci.yml`                                                                   | new — containerized deploy + CI                                                          |

## 6. Test Suites

### `scripts/phase10-unit-tests.ts` — 63 checks, no DB/server

- Anthropic prompt build + response parse (valid, malformed, wrong shape, top-level array, blank summary → `502`) and OpenAI embedding request/response builders (sort-by-index normalization) (16)
- `localEmbedInputs` determinism + normalization; `splitIntoChunks` cap/overlap/determinism; `toChunkInputs` batching caps (12)
- `cosineSimilarity`: identical/orthogonal/empty/unequal-dimension handling (6)
- `slugifyTopic` dedupe + `toKnowledgeSources` truncation/confidence bounds (8)
- `buildSuggestions`: ordering (`continue_learning` first), dedupe, never-drops-kinds, empty-state (14)
- `buildTutorMessages`: grounding injection, gating for empty context, sanitization, no-grounding path (7)

### `scripts/phase10-integration-tests.ts` — 31 checks, live HTTP on port 3210 + real PostgreSQL (`EMBEDDING_PROVIDER=local`)

- **Health/readiness**: `/health` healthy; `/readiness` healthy+database (2)
- **DB rate limiter**: 20-burst allowed → 21st `429` → bucket count persisted = 21 → cross-user isolation → window reset under mocked `Date.now` → count resets to 1 (6)
- **DB dedupe** via fake `EventEmitter` response: allow → repeat `429` → different-question allowed → window reset (4)
- **RAG**: empty before ingestion; `ingest` + local embedding backfill; retrieval returns the seeded source with bounded confidence + excerpt; `systemContext` includes the source; chunk cleanup (6)
- **Session persistence**: answer `correct===true`; `active_practice_sessions` row exists; spawned fresh-process `phase10-restart-check.ts` prints `PHASE10_RESTART_OK` (3)
- **Topics**: `recordLearningActivity` upserts slug `zygotes` (lowercase name); weak topic `zygotes` detected from a practice-only row; suggestions lead with `continue_learning` → `zygotes`; fresh user gets empty suggestions (4)
- **Cleanup**: 0 test users / 0 phase10 chunks (6 combined assertions)

`phase10-restart-check.ts` verifies DB-persisted state from a fresh process; `phase10-cleanup.ts` removes `@test.local` users, their entries/buckets, phase10 chunks, and clears all rate-limit buckets.

## 7. Verification Matrix (fresh DB, buckets reset)

| Check                                                            | Result                                                                             |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `pnpm -r run typecheck` (7 projects)                             | Pass                                                                               |
| `pnpm -r run lint` (7 projects)                                  | Pass (0 errors; pre-existing `next lint` deprecation notice only)                  |
| `pnpm exec prisma validate`                                      | Pass                                                                               |
| `prisma migrate status`                                          | Up to date (2 migrations)                                                          |
| Phase-8 unit / integration                                       | 19 passed, 0 failed / 54 passed, 0 failed                                          |
| Phase-9 unit / integration                                       | 52 passed, 0 failed / 48 passed, 0 failed                                          |
| Phase-10 unit / integration                                      | 63 passed, 0 failed / 31 passed, 0 failed                                          |
| `pnpm -r run build` (types, shared, api, web + `next build`)     | Pass (design-tokens emits only the harmless `MODULE_TYPELESS_PACKAGE_JSON` notice) |
| `expo export --platform android` (mobile; no `build` script)     | Pass (`EXPORT_EXIT=0`)                                                             |
| Production API boot (`node --import tsx apps/api/dist/index.js`) | Boots; `/health` + `/readiness` healthy                                            |
| No secrets, no commits                                           | `.env` untouched; report contains no keys; nothing staged/pushed                   |

## 8. Known Limitations (documented, not changed)

- AI gating is **per-keypad DB** with count reading; a single shared `rate_limit_buckets` table suffices for the target scale but should move to Redis if the API ever horizontally scales — the limiters keep their `name` for a drop-in swap.
- `KnowledgeChunk` is a global curator corpus; per-tenant isolation of the knowledge base is a future feature.
- Practice-session in-memory cache can hold up to 1000 active sessions per process; DB persistence now survives restarts, but a fresh process must evict-expire-on-read.
- Web `next lint` deprecation notice is pre-existing; `design-tokens` package lacks a `"type": "module"` marker (notice only, build fine).
- OCR/appendix scan of legacy migrations was done via reflowed `_init` + `_phase10`; `db:push` remains the documented fast-path for schema experiments.

## 9. NOT TESTABLE Without External Configuration

- **Live AI success path**: generating grounded tutor responses and practice questions needs a server-side `AI_PROVIDER` / `AI_API_KEY` / `AI_MODEL` (and `EMBEDDING_API_KEY` for cloud embeddings). This environment deliberately has none — the graceful `503 AI_PROVIDER_NOT_CONFIGURED`, validation, rate limit, dedupe, and all normalizers are fully unit- and integration-tested instead, and the integration suite exercises the **entire RAG path with the `local` embedding provider**.
- **Sentry delivery**: `SENTRY_DSN` is empty here; integration verified via code review/typecheck only.
- **Docker/CI execution**: files are linted and validated, but a Docker build / GitHub Actions run requires an external runner; CI uses a fresh Postgres 18 service container per run.

## 10. Notes for Future Phases

- Phase 11 should focus on **live AI credential smoke tests against real providers** (Anthropic `claude-*`, OpenAI `text-embedding-3-small`), plus any horizontal-scaling move (Redis limiters, per-tenant knowledge chunks).
- The mobile app has no `build` script — CI and docs call `expo export --platform android` explicitly; consider adding a wrapper.
- `phase10-cleanup.ts` doubles as the "reset rate-limit windows" tool before full local suite batches.

PHASE 10 COMPLETE — PHASE 11 HAS NOT BEEN STARTED.
