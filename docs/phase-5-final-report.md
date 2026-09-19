# Phase 5 — AI Tutor / Learning Intelligence Foundation (Final Report)

> Delivered: Sep 19, 2026 · Monorepo workspace · Zero new runtime dependencies

## 1. Files Added / Changed

### Added

| File | Purpose |
| --- | --- |
| `apps/api/src/ai/ai.types.ts` | Provider/LM interfaces: `LanguageModelMessage`, `LanguageModelConfig`, `AiProvider`, `AiCompletionInput`, `ProviderRawContent` |
| `apps/api/src/ai/ai.service.ts` | AI Tutor orchestration (config guard → provider call → normalization) |
| `apps/api/src/ai/normalizer.ts` | Validates & normalizes raw provider JSON into a shared `LearningResponse` |
| `apps/api/src/ai/prompts/system.ts` | System prompt + `buildTutorMessages(question)` |
| `apps/api/src/ai/providers/openai.provider.ts` | OpenAI chat-completions provider via native `fetch` |
| `apps/api/src/ai/providers/index.ts` | Provider registry / `createProvider(name)` factory |
| `apps/api/src/controllers/ai.controller.ts` | `POST /ai/learn` handler |
| `apps/api/src/routes/ai.routes.ts` | `/ai` router with protection middleware chain |
| `apps/api/src/utils/dedupe.ts` | Success-only duplicate-question guard |
| `apps/web/src/components/ai/ai-tutor.tsx` | Web AI Tutor (input, loading, error/retry, success states) |
| `apps/web/src/components/ai/ai-response.tsx` | Web structured response renderer |
| `apps/web/src/components/ai/markdown.tsx` | Web markdown-lite renderer (no `dangerouslySetInnerHTML`) |
| `apps/mobile/src/components/ai/ai-tutor.tsx` | Mobile AI Tutor |
| `apps/mobile/src/components/ai/ai-response.tsx` | Mobile structured response renderer |
| `apps/mobile/src/components/ai/markdown.tsx` | Mobile markdown-lite renderer (nested `Text`) |
| `docs/phase-5-final-report.md` | This report |

### Changed

| File | Change |
| --- | --- |
| `packages/types/src/index.ts` | Added `AiProviderName`, `AiConfig`, `LearningQuestion`, `LearningResponse`, `LearningResponseSection`, `LearningSectionType`; added `ai: AiConfig` to `AppConfig` |
| `packages/shared/src/validation.ts` | Added `learningQuestionSchema` (trim, 2–1000 chars) |
| `apps/api/src/config.ts` | Added `aiProvider`, `aiApiKey`, `aiModel` env parsing + `parseAiProvider()`; exposes `config.ai` |
| `apps/api/src/utils/rate-limit.ts` | Added optional `keyFor(req)` so limits can key on the user id |
| `apps/api/src/index.ts` | Mounted `/ai` router |
| `.env.example` | Replaced dummy OPENAI/ANTHROPIC placeholders with `AI_PROVIDER`, `AI_API_KEY`, `AI_MODEL` |
| `apps/web/src/lib/api.ts` | Added `aiApi.learn(token, { question })` |
| `apps/web/src/app/(app)/learn/page.tsx` | Replaced ComingSoon with `<Suspense>`-wrapped AI Tutor; prefills `?q=` |
| `apps/web/src/components/dashboard/learning-entry.tsx` | Now navigates to `/learn?q=<question>` (no fake "coming soon" note) |
| `apps/mobile/src/lib/api.ts` | Added `aiApi.learn(token, { question })` |
| `apps/mobile/src/app/learn.tsx` | Replaced ComingSoon with AI Tutor inside AppShell; prefills `?q=` via `useLocalSearchParams` |
| `apps/mobile/src/components/dashboard/learning-entry.tsx` | Now navigates to `/learn?q=<question>` |

## 2. Dependencies Added

**None (0 new dependencies).** The OpenAI integration uses Node's built-in `fetch` (Node 18+), so no SDK was added — consistent with the project's minimal-dependency policy. Mobile icon usage continues via the existing `@expo/vector-icons`.

## 3. AI Architecture & How It Works

```
StudentUI (web/mobile)
        │ POST /ai/learn  { question }   (Bearer token)
        ▼
Protection middleware chain (routes/ai.routes.ts):
  authenticate → per-user rate limiter (20 / 10 min) → validate(learningQuestionSchema)
              → duplicate guard (success-only) → learnController
        ▼
ai.service.ts: resolve config.ai  →  503 AI_PROVIDER_NOT_CONFIGURED if provider/key empty
        ▼
providers/index.ts: createProvider('openai')
        ▼
openai.provider.ts: POST https://api.openai.com/v1/chat/completions
        { model, messages: [system, user], max_tokens:700, temperature:0.4,
          response_format:{type:'json_object'} }, AbortSignal.timeout(30000)
        │ (provider errors → sanitized 502 AI_PROVIDER_ERROR, details never leak)
        ▼
raw JSON  →  normalizer.ts  →  shared LearningResponse
```

- The **system prompt** instructs JSON-only output, beginner-friendly language, no fabricated citations, and no claims about the student's level; the schema is whatever the model returns under `summary`, `explanation`, `keyPoints`, `example`, `analogy`, `followUps`.
- The **normalizer** requires a non-empty `summary` and builds fixed-titled sections in order: Answer, Simple explanation, Key points, Example, Analogy, Follow-up questions (only produced sections are included), plus an accuracy disclaimer.
- **Stateless**: no conversation history is stored; each request is independent. No new DB tables.

## 4. API Endpoint

`POST /ai/learn`

| Case | Status | Body |
| --- | --- | --- |
| Success | `200` | `{ success, data: LearningResponse, meta }` |
| Missing/invalid token | `401` | `UNAUTHORIZED` |
| Invalid question (validation) | `400` | `VALIDATION_ERROR` + field details |
| Repeated identical successful question | `429` | `RATE_LIMITED` |
| Per-user rate limit exceeded (20/10 min) | `429` | `RATE_LIMITED` |
| Provider not configured | `503` | `AI_PROVIDER_NOT_CONFIGURED` |
| Provider call failed / malformed response | `502` | `AI_PROVIDER_ERROR` |

Middleware chain order: `authenticate → AI_LIMITER (keyed by user.id) → validate → AI_DUPLICATE_GUARD → learnController`.

## 5. Shared Contracts

Defined in `packages/types` (types) and `packages/shared` (zod):

```ts
// types
type AiProviderName = 'openai';
interface AiConfig { provider: AiProviderName | ''; apiKey: string; model: string; }
type LearningSectionType = 'summary'|'explanation'|'key_points'|'example'|'analogy'|'follow_ups';
interface LearningQuestion { question: string; }
interface LearningResponseSection { type; title; content?; items?; }
interface LearningResponse { question: string; sections: LearningResponseSection[]; disclaimer?: string; }

// shared (zod)
export const learningQuestionSchema = z.object({
  question: z.string().trim().min(2).max(1000),
});
```

## 6. Web Changes

- `/learn` is now a functional page (wrapped in `<Suspense>` for `useSearchParams`), prefilling the question from `?q=`.
- The AI Tutor has four states: idle (form + empty state), loading (spinner with the current question), error (server message + Retry), success (structured response cards).
- Responses render through a markdown-lite component supporting `**bold**`, `` `inline code` ``, and `-` / `1.` lists — **no `dangerouslySetInnerHTML`**.
- The dashboard Learning Entry now sends the student to `/learn?q=<question>`.

## 7. Mobile Changes

- `/learn` is now functional inside the existing `AppShell`, prefilling from `?q=` via `useLocalSearchParams`.
- Same four-state UX as web; the response uses Cards with per-section `MarkdownText` (nested `Text` nodes for inline bold/code and lists).
- Dashboard Learning Entry now routes to `/learn?q=<question>`.

## 8. Security Considerations

- **API key secrecy**: `AI_API_KEY` is only read server-side from `config.ai`; it is never sent to clients or logged (provider logs are diagnostic-only).
- **Sanitized errors**: provider failures become generic `502 AI_PROVIDER_ERROR`; validation/details never include secrets.
- **Route protection**: `/ai/learn` requires a valid JWT (`authenticate`).
- **Abuse / cost control**: per-user rate limit (20/10 min), a success-only duplicate guard (double-submits don't burn credits, failed retries aren't blocked), bounded question length (2–1000), bounded output (max 700 tokens), 30s timeout, and no unbounded input body.
- **No injection surface**: client rendering uses structured DOM/component rendering, not HTML injection.

## 9. Environment Variables

New variables documented in `.env.example`:

```
# AI Provider
AI_PROVIDER=            # Provider name (currently only "openai")
AI_API_KEY=             # Provider API key (keep secret, never expose to clients)
AI_MODEL=gpt-4o-mini    # Model name to use
```

If `AI_PROVIDER` or `AI_API_KEY` is empty, requests fail gracefully with `503 AI_PROVIDER_NOT_CONFIGURED` instead of crashing the server.

## 10. Database Changes

**None.** No schema or migration changes. Conversations are stateless; `tokenVersion`/User untouched.

## 11. Verification

Commands (all passed):

- `pnpm typecheck` → 7/7 packages, 0 errors
- `apps/api` → `pnpm exec tsc --noEmit` ✓
- `apps/api` → `pnpm exec eslint "src/**/*.{ts,tsx}" --max-warnings=0` → 0 errors, 1 pre-existing warning (`index.ts:118` intentional startup `console.log`)
- `apps/web` → `pnpm exec eslint "src/**/*.{ts,tsx}" --max-warnings=0` → clean
- `apps/web` → `pnpm exec prettier --check` on all Phase 5 files → clean
- `apps/web` → `pnpm exec next build` → 12 routes, `/learn` compiled (2.06 kB)
- `apps/mobile` → `pnpm exec eslint "src/**/*.{ts,tsx}" --max-warnings=0` → clean
- `apps/mobile` → `pnpm exec prettier --check` on all Phase 5 files → clean
- `apps/mobile` → `pnpm exec expo export --platform android` → Android bundle (4.51 MB) + Ionicons bundled

Live API tests (against the running dev server on `:3001`):

| Test | Result |
| --- | --- |
| `POST /ai/learn` no token | `401` UNAUTHORIZED ✓ |
| `POST /ai/learn` `{"question":"x"}` (authed) | `400` VALIDATION_ERROR ✓ |
| `POST /ai/learn` valid question (authed) | `503` AI_PROVIDER_NOT_CONFIGURED ✓ (no key configured) |
| Identical question repeated immediately | 2nd attempt also `503` (NOT `429`) ✓ — confirms duplicate guard only blocks successful responses |
| `POST /auth/signup` → `GET /auth/me` | `200`, correct user ✓ |
| `POST /auth/logout` → `POST /ai/learn` + `GET /auth/me` | `401` after logout ✓ |

## 12. Known Warnings

- `apps/api` has **1 warning**: `no-console` on the intentional startup log in `index.ts` (pre-existing since Phase 3). No new warnings introduced.
- Next.js build emits a harmless `MODULE_TYPELESS_PACKAGE_JSON` warning for `packages/design-tokens` (pre-existing; opt-in feature note).
- The web repo has 64 pre-existing files not currently conforming to Prettier (all from Phases 1–4 code, untouched in this phase).
- The "Next.js plugin not detected in ESLint config" note is informational only (`eslint-plugin-next` rules are provided via `@novilearn/config/next`).

## 13. Known Limitations & Future Improvements

- **Success path not fully verifiable in CI/dev here**: no real `AI_API_KEY` is set, so the 200 path is code-reviewed + type-checked but its live 200 response requires provider credentials. Output schema is validated at runtime by the normalizer.
- **Provider coverage**: only `openai` is registered; the factory throws `503` for any other name. Future providers (Anthropic, local models) extend `providers/`.
- **In-memory limits**: rate limit + duplicate guard reset on server restart and don't scale horizontally (fine single-instance; move to Redis later).
- **Stateless UX**: refreshing loses the conversation; a future phase may persist threads (requires DB changes — intentionally out of scope).
- **Markdown-lite**: only bold/code/lists are rendered; headings, links, tables are displayed as plain text.
- **No content/search grounding**: v1 is completion-only; RAG/vector embeddings are explicitly a later phase.

## 14. Phase 6 Status

**Phase 6 has NOT been started.**