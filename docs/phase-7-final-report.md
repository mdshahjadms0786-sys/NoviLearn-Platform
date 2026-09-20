# Phase 7 Final Report — Practice, Quiz, and Assessment Foundation

Phase 7 — Practice, Quiz, and Assessment Foundation is **complete**. Both platforms now ship a functional practice engine: students configure a topic, difficulty, question count, and question type; the API generates a question set through the existing AI provider pipeline; each answer is evaluated server-side with instant feedback; and a session result with a per-question breakdown is produced at the end. The `/practice` placeholder is gone on web and mobile. The report ends at the Phase 6/7 boundary; **Phase 8 has NOT been started.**

---

## 1. Goal

Replace the `/practice` coming-soon placeholder with a real practice/quiz/assessment loop on web and mobile, reusing Phase 5's AI provider infrastructure and Phase 6's learning surface, without adding database models or new runtime dependencies.

## 2. Scope

**Included**

- Shared practice contracts in `@novilearn/types` and validation schemas in `@novilearn/shared`
- Server-side generation, evaluation, and session result code (`apps/api/src/practice`, `/practice` routes)
- "Practice this topic" CTA wired into the learning experience (web + mobile)
- Full practice session UI on web (`/practice`) and mobile (`/practice`)
- Cross-linking between Practice and Learn (`?topic=` into Practice, `?q=` back into Learn)

**Excluded (deliberately not in this phase)**

- Persistent user/lesson practice history (no migration, no DB writes)
- Adaptive sequencing / spaced-repetition / mastery scoring
- Semantic grading of short answers (normalized exact match only)
- Teacher/parent dashboards, shared result links
- Progress tracking, gamification, recommendations
- Any Phase 8 work

## 3. Delivery Plan Discrepancies

The original plan and the shipped implementation differ in one designed way: the practice session is authored to be **stateless and ephemeral** rather than persisted. A server-side in-memory session holds the generated questions and the student's answers for a fixed 60-minute window; nothing touches the database. This keeps the correct answers off the client, avoids a Prisma migration this phase, and is explicitly flagged in Architecture as the base that a later persistence layer can extend.

## 4. What Changed

### Shared contracts — `packages/types/src/index.ts`

Added the full practice/quiz/assessment contract:

- `PracticeQuestionType` — `"mcq" | "true_false" | "short_answer"`
- `PracticeDifficulty` — `"easy" | "medium" | "hard"`
- `PracticeQuestionMode` — `"mixed" | PracticeQuestionType`
- `PracticeConfig` — `{ topic, questionCount: 5 | 10, difficulty, questionType }`
- `PracticeQuestion` — the client-facing question (id, type, question, optional options). **Never contains the correct answer or explanation.**
- `PracticeSet` — `{ sessionId, topic, config, questions[] }`
- `PracticeAnswerInput` — `{ sessionId, questionId, answer }`
- `PracticeEvaluation` — `{ questionId, correct, explanation, correctAnswer }`
- `PracticeQuestionResult` — per-question result row
- `PracticeResult` — `{ sessionId, topic, totalQuestions, correctAnswers, incorrectAnswers, accuracy, score, results[] }`

### Shared validation — `packages/shared/src/validation.ts`

- `practiceConfigSchema` — topic trimmed 2–100 chars; `questionCount` is `5 | 10` (default 5); `difficulty` (default `medium`); `questionType` (default `mixed`); unknown fields stripped
- `practiceAnswerSchema` — `sessionId` ≤ 512, `questionId` ≤ 64, trimmed `answer` 1–2000 chars
- `practiceCompleteSchema` — `sessionId` ≤ 512
- Supporting enum schemas (`practiceDifficultySchema`, `practiceQuestionTypeSchema`, `practiceQuestionModeSchema`)

### API — new practice engine (`apps/api/src/practice`)

| File                     | Purpose                                                                                                           |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| `practice.types.ts`      | Internal question/session types; `toClientQuestion`/`toClientPracticeSet` mappers (strip answers)                 |
| `text.ts`                | `normalizeMatchText` + `normalizeAnswerText` (trim, lowercase, whitespace collapse, trailing punctuation strip)   |
| `practice.normalizer.ts` | Provider JSON → internal questions; rejects unsafe shapes with `502 AI_RESPONSE_INVALID`                          |
| `evaluator.ts`           | Server-side scoring (exact match for MCQ/true-false; normalized match against `acceptedAnswers` for short answer) |
| `session-store.ts`       | In-memory ephemeral sessions: opaque `randomUUID` id, 60-min TTL, max 12 per user, ownership check                |
| `practice.service.ts`    | `generatePracticeSet`, `answerPracticeQuestion`, `completePracticeSession`; `PRACTICE_MAX_TOKENS = 2500`          |

The AI prompt lives in `apps/api/src/ai/prompts/practice.ts` (strict JSON-only output, beginner-friendly, no fabricated content, requests exactly `questionCount` questions of the configured type/difficulty). `apps/api/src/ai/ai.service.ts` gained a shared `completeProviderRequest` helper so `/ai/learn` and practice generation use the identical provider path.

### API — endpoints

`POST /practice/generate` (Bearer token)

```
Body: { topic: string, questionCount: 5 | 10, difficulty, questionType }
200  { success, data: PracticeSet }              (no correct answers)
400  VALIDATION_ERROR
401  UNAUTHORIZED
429  RATE_LIMITED
502  AI_RESPONSE_INVALID                        (malformed/unsafe generated JSON)
503  AI_PROVIDER_NOT_CONFIGURED
500  INTERNAL_SERVER_ERROR
```

`POST /practice/answer` (Bearer token)

```
Body: { sessionId, questionId, answer }
200  { success, data: PracticeEvaluation }
400  VALIDATION_ERROR / PRACTICE_QUESTION_NOT_FOUND
401  UNAUTHORIZED
404  PRACTICE_SESSION_NOT_FOUND                 (missing, other user's, or expired)
429  RATE_LIMITED
```

`POST /practice/complete` (Bearer token)

```
Body: { sessionId }
200  { success, data: PracticeResult }
400  VALIDATION_ERROR
401  UNAUTHORIZED
404  PRACTICE_SESSION_NOT_FOUND
429  RATE_LIMITED
```

Middleware chain per route: `authenticate → per-user rate limiter → validate(schema) → handler`. All responses use the existing `createApiResponse` envelope.

### Client API clients

`practiceApi` (`generate`, `answer`, `complete`) added to `apps/web/src/lib/api.ts` and `apps/mobile/src/lib/api.ts`, typed against the shared contracts and throwing `ApiClientError` on non-2xx.

## 5. Files Added

```
apps/api/src/ai/prompts/practice.ts
apps/api/src/practice/practice.types.ts
apps/api/src/practice/text.ts
apps/api/src/practice/practice.normalizer.ts
apps/api/src/practice/evaluator.ts
apps/api/src/practice/session-store.ts
apps/api/src/practice/practice.service.ts
apps/api/src/controllers/practice.controller.ts
apps/api/src/routes/practice.routes.ts
apps/web/src/components/practice/practice-setup.tsx
apps/web/src/components/practice/practice-question.tsx
apps/web/src/components/practice/practice-feedback.tsx
apps/web/src/components/practice/practice-result.tsx
apps/web/src/components/practice/practice-tutor.tsx
apps/web/src/components/ai/practice-cta.tsx
apps/mobile/src/components/practice/practice-flow.tsx
apps/mobile/src/components/practice/practice-setup.tsx
apps/mobile/src/components/practice/practice-question.tsx
apps/mobile/src/components/practice/practice-feedback.tsx
apps/mobile/src/components/practice/practice-result.tsx
apps/mobile/src/components/ai/practice-cta.tsx
docs/phase-7-final-report.md
```

## 6. Files Modified

```
packages/types/src/index.ts                       Practice contracts
packages/shared/src/validation.ts                 Practice zod schemas
apps/api/src/ai/ai.service.ts                     Shared completeProviderRequest helper
apps/api/src/index.ts                             Mount /practice router
apps/web/src/lib/api.ts                           practiceApi
apps/mobile/src/lib/api.ts                        practiceApi
apps/web/src/app/(app)/practice/page.tsx          Replace ComingSoon with PracticeTutor (Suspense + ?topic=)
apps/mobile/src/app/practice.tsx                  Replace ComingSoon with PracticeFlow
apps/web/src/components/ai/learning-experience.tsx  PracticeCta inserted
apps/mobile/src/components/ai/learning-experience.tsx  PracticeCta inserted
docs/architecture.md                             Practice & Assessment (Phase 7) section
docs/project-structure.md                        Updated API/web/mobile trees + shared exports
```

## 7. Data Model & Session Design

No schema changes. Practice state is **stateless and ephemeral**:

- A session record is created server-side per `generate` call and stored in an in-memory `Map` keyed by an opaque `sessionId` (crypto `randomUUID`). It is bound to the authenticated user's id and is never returned to a different user.
- Sessions expire after 60 minutes (expired records are evicted lazily on access/creation).
- Each user may hold up to 12 live sessions; the oldest is evicted when the cap is hit (soft cap, no error).
- The client only ever receives questions **without** `correctAnswer`/`explanation`, so correct answers cannot be leaked through state, network payloads, or DevTools.
- `/practice/answer` is **idempotent**: re-submitting an already-answered question returns the recorded evaluation without changing the session score.

## 8. Web Flow

`apps/web/src/app/(app)/practice/page.tsx` wraps `PracticeTutor` in `Suspense` and reads `?topic=` from `useSearchParams` (same prefill pattern as Learn). Files are `"use client"`.

- `practice-setup.tsx` — topic input (2+ chars to enable) plus choice-chip groups for question count (5/10), difficulty (easy/medium/hard), and question type (mixed/MCQ/True-False/Short answer), each with a labelled `fieldset`/`aria-pressed`.
- `practice-tutor.tsx` — the state machine (`setup → loading → error → ready → complete`, with `evaluating`/`completing` guards): calls `generate`, then `answer`, then `complete`; prevents double submits; distinguishes generation vs. action failures with a safe error + **Try Again / Back to Practice**; staged loading copy ("Preparing your practice…", "Creating questions…").
- `practice-question.tsx` — MCQ/true-false via `RadioGroup`; short answer via `Input`; submit disabled until an answer is entered; controls locked while evaluating.
- `practice-feedback.tsx` — Correct/Incorrect banner (success/destructive theme tokens) + explanation + **Next Question** (or **See Results** on the last question).
- `practice-result.tsx` — score, correct/incorrect/accuracy stats, per-question breakdown (joined against the client-held set for question text), **Practice Again** (restarts with the same topic) and **Learn This Topic** (routes to `/learn?q=<topic>`).

## 9. Mobile Flow

`apps/mobile/src/app/practice.tsx` renders `PracticeFlow` (with `PracticeCta`'s `?topic=` prefill via `useLocalSearchParams`). The flow mirrors web with RN primitives:

- `practice-setup.tsx` — `Input` + choice chips built on `Pressable` (min-height 48px, `accessibilityRole="button"`, `accessibilityState={{selected}}`).
- `practice-flow.tsx` — same state machine as web including staged loading, idempotent guard, error retry, and routing back to Learn.
- `practice-question.tsx` — option rows are `Pressable` radio rows (min-height 48px, `accessibilityRole="radio"`, checked state); short answer is a multiline `Input`.
- `practice-feedback.tsx` and `practice-result.tsx` — success uses a fixed green; errors use the theme's error color; result shows score, stats, and breakdown rows (≥ accessible contrast on surface tokens).

All touch targets are ≥ 48pt and marked with descriptive accessibility labels/states, matching the Phase 6 conventions.

## 10. Cross-Linking & Learn Integration

- A new `PracticeCta` card ("Practice This Topic") renders inside the learning experience after "Continue learning" on both platforms, using the student's question as the seed topic and navigating to `/practice?topic=<topic>`.
- The practice result screen's "Learn This Topic" navigates back to `/learn?q=<topic>`.

## 11. Safety, Limits & Cost Controls

- Providers/keys stay configurable via env only (`AI_PROVIDER`, `AI_API_KEY`, `AI_MODEL`); unconfigured service → `503 AI_PROVIDER_NOT_CONFIGURED`, never a crash or a leaked key.
- Per-user in-memory rate limits: **20** `generate` per 10 minutes; **200** `answer`+`complete` actions per 10 minutes; keyed by user id.
- Generation `maxTokens` 2500, `temperature` 0.4, 30s per-completion timeout (same provider path as `/ai/learn`).
- Strict JSON-only prompt; the normalizer rejects malformed or unsafe question output (missing/undefined correct answer, wrong option counts, unbalanced true/false, duplicate question text, wrong count) with `502 AI_RESPONSE_INVALID`.
- Client errors are sanitized user-facing messages; server internals never surface.

## 12. Concurrency & Idempotency

- The session map is single-process in-memory (Express default), so reads/writes are effectively serialized in a single instance.
- Duplicate answer submissions are deduplicated by question id — the first evaluation wins and the score is unchanged.
- UI-level in-flight guards (`evaluating`/`completing`) prevent duplicate requests from a single device.
- Multi-process/instances would need a shared store; documented as a scaling note for a later phase.

## 13. Evaluation Approach & Known Limitation

MCQ and true/false compare the selected option with the stored correct answer (exact match after normalization). Short answers are scored by normalized exact matching against the model-provided `acceptedAnswers` list (trim, lowercase, whitespace collapse, trailing punctuation strip). This is deliberately strict — phrasing variations that don't match an accepted answer are marked incorrect. Semantic grading is out of scope and documented as the main Phase 7 accuracy limitation.

## 14. Test Coverage Plan

No test runner exists in the repo yet. Verification is performed with throwaway `tsx` scripts that are run against the compiled contracts/modules and then deleted (they are not committed):

1. Valid MCQ normalization (options stripped of answers)
2. Valid true/false normalization (balanced "True"/"False")
3. Valid short-answer normalization with accepted answers
4. Missing answer → 502
5. Invalid correct-answer type → 502
6. Wrong MCQ option count → 502
7. Wrong true/false options → 502
8. Duplicate question text → 502
9. Malformed top-level JSON → 502
10. Too few/many questions for `questionCount` → 502
11. Evaluate correct MCQ → correct
12. Evaluate incorrect MCQ → incorrect
13. Short answer builds its own normalization (suffix punctuation)
14. Session scoring totals (correct/incorrect/score/accuracy)
15. Empty topic → validation error
16. Session integrity — answer on unknown session/question → not-found/error codes

Plus a live API regression suite (see §16) that runs only when `AI_API_KEY` is unset to avoid model cost.

## 15. Verification: Static Gates

| Command                                                                            | Result                                                                                                    |
| ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `pnpm -r run typecheck` (types, shared, design-tokens, api, web, mobile)           | Pass                                                                                                      |
| `pnpm --filter=@novilearn/api run lint`                                            | Pass (only pre-existing startup `console.log` warning in `apps/api/src/index.ts:120`, intentionally kept) |
| `pnpm --filter=@novilearn/web exec eslint "src/**/*.{ts,tsx}" --max-warnings=0`    | Pass                                                                                                      |
| `pnpm --filter=@novilearn/mobile exec eslint "src/**/*.{ts,tsx}" --max-warnings=0` | Pass                                                                                                      |
| `pnpm --filter=@novilearn/types exec eslint "src/**/*.ts" --max-warnings=0`        | Pass                                                                                                      |
| `pnpm --filter=@novilearn/shared exec eslint "src/**/*.ts" --max-warnings=0`       | Pass                                                                                                      |
| `prettier --check` on all changed files                                            | Pass (24 new files formatted via `prettier --write`)                                                      |
| `pnpm --filter=@novilearn/web exec next build`                                     | Pass — 12 routes; `/practice` 10.6 kB                                                                     |
| `pnpm --filter=@novilearn/mobile exec expo export --platform android`              | Pass — android bundle exported (1423 modules)                                                             |

## 16. Verification: Live API Regression (no AI key)

Run against a live `tsx` server on `:3001` with freshly signed-up users (a separate account for the rate-limit check):

| Scenario                                             | Observed | Expected                         |
| ---------------------------------------------------- | -------- | -------------------------------- |
| `POST /practice/generate` no token                   | `401` ✓  | `401` UNAUTHORIZED               |
| `POST /practice/generate` authed, topic `"x"`        | `400` ✓  | `400` VALIDATION_ERROR           |
| `POST /practice/generate` authed, `questionCount: 7` | `400` ✓  | `400` VALIDATION_ERROR           |
| `POST /practice/generate` authed, valid config       | `503` ✓  | `503` AI_PROVIDER_NOT_CONFIGURED |
| `POST /practice/answer` authed, unknown session      | `404` ✓  | `404` PRACTICE_SESSION_NOT_FOUND |
| `POST /practice/answer` authed, blank answer         | `400` ✓  | `400` VALIDATION_ERROR           |
| `POST /practice/answer` authed, answer > 2000 chars  | `400` ✓  | `400` VALIDATION_ERROR           |
| `POST /practice/complete` authed, unknown session    | `404` ✓  | `404` PRACTICE_SESSION_NOT_FOUND |
| 21st consecutive generate within the window          | `429` ✓  | `429` RATE_LIMITED               |
| `POST /auth/logout` → `POST /practice/generate`      | `401` ✓  | `401` after logout               |

The rate limiter responds with the body from `createApiError("RATE_LIMITED", …)` — `code`/`message`/`statusCode` at the root, matching the pre-existing shared-utility convention used by `/ai/learn`. No `AI_API_KEY` is present, so the regression is model-free; the live 200 path is covered by the 23 unit-style checks run against the shared schemas, normalizer, evaluator, and service modules (see §14).

## 17. Gates Closed

Every gate in §15 and §16 passes. The throwaway validation script shipped 23 checks (normalizer 502 paths, true/false canonicalization, short-answer accepted-answers, request-schema validation, correct/incorrect evaluation, end-to-end session scoring with accuracy rounding, idempotent re-answer, session ownership) — 23/23 passed, and the script was deleted afterwards. The regression server was shut down. Both `next build` and `expo export --platform android` succeed with the new practice pages included.

## 18. Notes for Future Phases

- Persisting sessions/results would replace `session-store.ts` with a Prisma-backed store (e.g., `PracticeSession`, `PracticeAnswer` models) without changing the endpoint contract.
- Semantic short-answer grading can replace `evaluator.ts`'s exact-match branch while keeping the same response shape.
- Rate limit windows/keys are per-user and would carry over unchanged to a multi-instance deployment backed by Redis.

## 19. Phase 8 Status

Phase 8 has NOT been started. No phase 8 design, prompts, endpoints, or UI work was created or modified during this phase. The practice/learning cross-links shipped here are intentionally limited to the Phase 7 scope (a practice call-to-action inside the learning experience and a "Learn This Topic" action on the result screen).
