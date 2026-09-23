# Phase 8 Final Report — Progress, Mastery & Personalization

Phase 8 — Progress, Mastery & Personalization is **complete**. The `/progress` placeholder is gone on web and mobile. Learning and practice activity is now persisted to PostgreSQL, the API computes per-topic mastery and progress from that real activity, and both platforms render a progress dashboard (stats, recent activity, next-learning suggestions, topic mastery, learning history, and practice history with per-session detail). No fabricated data is shown anywhere — every number is derived from the signed-in user's own rows.

---

## 1. Goal

Turn the `/progress` coming-soon screens into a real progress surface backed by persisted activity: record learning and practice events, compute summary/mastery/personalization server-side, and render it on web and mobile using the existing Phase 6/7 design language.

## 2. Scope

**Included**

- Persisting practice results to the database on session completion (Phase 7 sessions were ephemeral)
- Recording a learning activity on each successful AI learn request
- Shared progress/history/suggestion contracts in `@novilearn/types` and query validation in `@novilearn/shared`
- Progress computation (summary, per-topic mastery + progress, suggestions) in `apps/api/src/progress`
- Authenticated `/progress` REST endpoints
- Full progress UI on web (`/progress`) and mobile (`/progress`), including practice session detail
- Fixing two pre-existing mobile typecheck failures (`quick-actions.tsx`, `bottom-nav.tsx`)

**Excluded (deliberately not in this phase)**

- Adaptive sequencing / spaced repetition / scheduled review
- Gamification (streaks, badges, points, leaderboards)
- Charts/graphs or time-series visualizations
- Teacher/parent dashboards or shared reports
- Semantic analysis of free-text learning questions for topic extraction (topics are the normalized question string)
- Real-time updates (progress is fetched on screen open)

## 3. Data Model

Two new models were added in `apps/api/prisma/schema.prisma` and pushed with `prisma db push`:

| Model              | Table                 | Key columns                                                                                                                                                                          | Indexes                                         |
| ------------------ | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------- |
| `LearningActivity` | `learning_activities` | `id`, `userId`, `topic`, `type` (default `"learn"`), `metadata` (Json?), `createdAt`                                                                                                 | `(userId, createdAt desc)`, `(userId, topic)`   |
| `PracticeSession`  | `practice_sessions`   | `id`, `userId`, `topic`, `questionCount`, `difficulty`, `questionType`, `totalQuestions`, `correctAnswers`, `incorrectAnswers`, `accuracy`, `score`, `results` (Json), `completedAt` | `(userId, completedAt desc)`, `(userId, topic)` |

Both have `user User @relation(..., onDelete: Cascade)`, and `User` gained the back-relations `learningActivities` / `practiceSessions`. The `results` JSON stores the enriched per-question breakdown (`questionId`, `question`, `type`, `correct`, `answer`, `correctAnswer`, `explanation`) so history detail can render question text and correct answers without re-calling the AI.

## 4. What Changed

### Shared contracts — `packages/types/src/index.ts`

Added the progress/personalization contract:

- `LearningActivity` — `{ id, topic, type: "learn", createdAt }`
- `ActivitySource` — `"learn" | "practice"`
- `RecentActivityItem` — `{ id, type, topic, at }`
- `ProgressSummary` — counts (`learningActivityCount`, `practiceSessionCount`, `uniqueTopicCount`, `learnedTopicCount`, `practicedTopicCount`), totals (`totalAnswers`, `totalCorrectAnswers`), `averageAccuracy: number | null`, and `recentActivity[]`
- `MasteryState` — `"NOT_STARTED" | "LEARNING" | "PRACTICING" | "STRONG"`
- `TopicProgress` — `{ topic, learningCount, practiceCount, bestAccuracy, averageAccuracy, mastery, progress, lastActivityAt }`
- `SuggestionKind` — `"continue_learning" | "practice_again" | "review_weak_topic" | "related_next_topic"`
- `NextLearningSuggestion` — `{ kind, title, description, topic }`
- `PracticeSessionSummary` — session row without results
- `PracticeHistoryResultRow` — enriched per-question result
- `PracticeSessionDetail` — summary + `results[]`

### Shared validation — `packages/shared/src/validation.ts`

- `progressHistoryLimitSchema` — `{ limit: coerce number, int, 1..100, default 50 }`
- `practiceSessionIdParamSchema` — `z.string().uuid()`

### API — persistence wiring

- `apps/api/src/practice/practice.service.ts` — `completePracticeSession` now builds an enriched `PracticeHistoryResultRow[]` from the session's internal questions + recorded answers and persists a `PracticeSession` row via a `persistPracticeResult` helper. Duplicate completion is tolerated: a `P2002` unique-violation on the session id is swallowed (idempotent), any other error rethrows.
- `apps/api/src/controllers/ai.controller.ts` — after a successful `generateLearningResponse`, calls `recordLearningActivity(userId, question, response.relatedConcepts, response.nextLearning)`. Only successful learn calls are recorded.
- `apps/api/src/index.ts` — mounts `progressRouter` at `/progress`.

### API — progress engine (`apps/api/src/progress`)

| File                  | Purpose                                                                                              |
| --------------------- | ---------------------------------------------------------------------------------------------------- |
| `calculations.ts`     | Pure `computeMastery(stats)` and `computeTopicProgress(stats)` functions                             |
| `personalization.ts`  | Pure `buildSuggestions(input)` → ordered `NextLearningSuggestion[]`                                  |
| `progress.service.ts` | DB reads/aggregation, topic normalization, `recordLearningActivity`, history + summary + suggestions |

`normalizeTopic` collapses whitespace, trims, lowercases, and caps topics at 500 chars so learning and practice topics deduplicate consistently.

### API — endpoints (`apps/api/src/routes/progress.routes.ts`)

All routes require a Bearer token and share a per-user in-memory rate limiter (300 requests / 10 minutes):

| Method | Path                             | Returns                                |
| ------ | -------------------------------- | -------------------------------------- |
| GET    | `/progress/summary`              | `ProgressSummary`                      |
| GET    | `/progress/history/learning`     | `LearningActivity[]` (`?limit=1..100`) |
| GET    | `/progress/history/practice`     | `PracticeSessionSummary[]` (`?limit`)  |
| GET    | `/progress/history/practice/:id` | `PracticeSessionDetail` (owner only)   |
| GET    | `/progress/topics`               | `TopicProgress[]`                      |
| GET    | `/progress/suggestions`          | `NextLearningSuggestion[]`             |

Error contract: `401 UNAUTHORIZED` (no/invalid token), `400 VALIDATION_ERROR` (bad `limit` or non-UUID id), `404 PRACTICE_SESSION_NOT_FOUND` (missing or another user's session), `429 RATE_LIMITED`.

## 5. Computation Rules

### Mastery (`computeMastery`)

- No learning and no practice → `NOT_STARTED`
- Learning but zero practice → `LEARNING`
- ≥ 2 practices with `bestAccuracy ≥ 80` **and** `averageAccuracy ≥ 80` → `STRONG`
- Otherwise (any practice) → `PRACTICING`

### Topic progress (`computeTopicProgress`)

A bounded 0–100 score:

- Learning component: `min(learningCount, 4) / 4 * 50` (max 50)
- Practice component: `min(practiceCount, 3) / 3 * 30` (max 30)
- Accuracy component: `(averageAccuracy ?? 0) / 100 * 20` (max 20)

Rounded and clamped to `[0, 100]`.

### Suggestions (`buildSuggestions`)

Deterministic, fixed order, one item per kind when data exists:

1. `continue_learning` — most recent learning topic not already `STRONG` (falls back to the most recent learning topic when all are mastered)
2. `practice_again` — most recently practiced topic
3. `review_weak_topic` — practiced topic with the lowest best accuracy below 80 (ties broken by recency)
4. `related_next_topic` — first `related`/`next` concept from recent learning metadata

`averageAccuracy` in the summary is the mean of session accuracies rounded to one decimal; per-topic averages are rounded to integers. Recent activity merges learning + practice, sorts by timestamp descending, and is capped at 10.

## 6. Web Flow (`apps/web`)

`apps/web/src/app/(app)/progress/page.tsx` renders `ProgressDashboard` (client component). On mount it loads summary, learning history, practice history, topics, and suggestions in parallel (`Promise.all`), with a full-page loading state, a safe error state + **Try again**, and a first-run empty state offering **Start learning** / **Start practicing**.

Components under `apps/web/src/components/progress/`:

- `progress-dashboard.tsx` — orchestration, data loading, session-detail navigation
- `progress-stats.tsx` — `ProgressStats` (counts, answers, average accuracy) + `EmptyProgressStats`
- `recent-activity.tsx` — merged recent learn/practice timeline
- `next-learning.tsx` — suggestion cards that route into `/learn` / `/practice`
- `topic-progress-list.tsx` — per-topic progress bar + mastery badge
- `mastery-badge.tsx` — mastery state chip
- `learning-history-list.tsx` — recent learning rows
- `practice-history-list.tsx` — recent practice rows with open-session action
- `practice-session-detail.tsx` — score/stats + per-question breakdown (correct/incorrect, correct answer, explanation) with loading/error/back states
- `format.ts` — small date/percent formatting helpers

## 7. Mobile Flow (`apps/mobile`)

`apps/mobile/src/app/progress.tsx` renders `ProgressDashboard` inside `AppShell`. It mirrors the web data flow and component set 1:1 with React Native primitives and `Pressable`/`Button` with `accessibilityRole`, themed error color, and `Spinner`. The same `progressApi` surface is used on both platforms.

## 8. Client API Clients

`progressApi` (`summary`, `learningHistory`, `practiceHistory`, `practiceDetail`, `topics`, `suggestions`) was added to `apps/web/src/lib/api.ts` and `apps/mobile/src/lib/api.ts`, typed against the shared contracts and throwing `ApiClientError` on non-2xx.

## 9. Files Added

```
apps/api/src/progress/calculations.ts
apps/api/src/progress/personalization.ts
apps/api/src/progress/progress.service.ts
apps/api/src/controllers/progress.controller.ts
apps/api/src/routes/progress.routes.ts
apps/api/scripts/phase8-unit-tests.ts
apps/api/scripts/phase8-integration-tests.ts
apps/api/scripts/phase8-check-db.ts
apps/web/src/components/progress/format.ts
apps/web/src/components/progress/learning-history-list.tsx
apps/web/src/components/progress/mastery-badge.tsx
apps/web/src/components/progress/next-learning.tsx
apps/web/src/components/progress/practice-history-list.tsx
apps/web/src/components/progress/practice-session-detail.tsx
apps/web/src/components/progress/progress-dashboard.tsx
apps/web/src/components/progress/progress-stats.tsx
apps/web/src/components/progress/recent-activity.tsx
apps/web/src/components/progress/topic-progress-list.tsx
apps/mobile/src/components/progress/format.ts
apps/mobile/src/components/progress/learning-history-list.tsx
apps/mobile/src/components/progress/mastery-badge.tsx
apps/mobile/src/components/progress/next-learning.tsx
apps/mobile/src/components/progress/practice-history-list.tsx
apps/mobile/src/components/progress/practice-session-detail.tsx
apps/mobile/src/components/progress/progress-dashboard.tsx
apps/mobile/src/components/progress/progress-stats.tsx
apps/mobile/src/components/progress/recent-activity.tsx
apps/mobile/src/components/progress/topic-progress-list.tsx
docs/phase-8-final-report.md
```

## 10. Files Modified

```
apps/api/prisma/schema.prisma                    LearningActivity + PracticeSession models
apps/api/src/index.ts                            Mount /progress router
apps/api/src/controllers/ai.controller.ts        Record learning activity on success
apps/api/src/practice/practice.service.ts        Persist practice result on completion
packages/types/src/index.ts                      Progress/history/suggestion contracts
packages/shared/src/validation.ts                Progress query validation
apps/web/src/lib/api.ts                          progressApi
apps/mobile/src/lib/api.ts                       progressApi
apps/web/src/app/(app)/progress/page.tsx         Replace ComingSoon with ProgressDashboard
apps/mobile/src/app/progress.tsx                 Replace ComingSoon with ProgressDashboard
apps/mobile/src/components/dashboard/quick-actions.tsx  Typed Href navigation (pre-existing typecheck fix)
apps/mobile/src/components/layout/bottom-nav.tsx         Typed Href navigation (pre-existing typecheck fix)
docs/architecture.md                             Progress & Personalization (Phase 8) section
docs/project-structure.md                        Updated API/web/mobile trees + shared exports
```

## 11. Safety, Ownership & Cost Controls

- Every `/progress` route is behind `authenticate`; there is no cross-user read path.
- Practice detail is scoped by `findFirst({ where: { id, userId } })`, so another user's session id yields `404` (never leaking existence).
- Queries are limited (`limit ≤ 100`, recent activity capped at 10, suggestion scans bounded) and indexed by `(userId, ...)`.
- The AI learn activity write uses only model-returned metadata (`related`/`next`, sanitized and capped at 6 each) and the normalized question topic — no answer content beyond the user's own question.
- Progress writes are best-effort with respect to duplicates (practice completion is idempotent via `P2002` handling).

## 12. Test Coverage

Two committed `tsx` scripts under `apps/api/scripts/` (no test runner exists in the repo):

- `phase8-unit-tests.ts` — pure checks for `computeMastery`, `computeTopicProgress`, and `buildSuggestions` (19 checks).
- `phase8-integration-tests.ts` — boots the real API on `:3207` against the real database, signs up two users, exercises auth/ownership/validation/empty-state/persistence/regression paths, then cleans up (54 checks).
- `phase8-check-db.ts` — post-run sanity check that no test users or rows remain.

## 13. Verification: Static Gates

| Command                                                                  | Result                                                                                         |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| `pnpm -r run typecheck` (types, shared, design-tokens, api, web, mobile) | Pass (7 projects)                                                                              |
| `pnpm -r run lint`                                                       | Pass — only the pre-existing `no-console` warning in `apps/api/src/index.ts:122` (intentional) |
| `pnpm --filter=@novilearn/api exec prisma validate`                      | Pass — schema valid                                                                            |
| `prettier --check` on all Phase 8 files                                  | Pass for all Phase 8 files (repo-wide check still flags pre-existing files — see §16)          |
| `pnpm run build:web` (`next build`)                                      | Pass — 12 routes; `/progress` 6.01 kB (124 kB First Load JS)                                   |
| `pnpm --filter=@novilearn/mobile exec expo export --platform android`    | Pass — android Hermes bundle exported                                                          |

## 14. Verification: Unit Script

`pnpm --filter=@novilearn/api exec tsx scripts/phase8-unit-tests.ts` → **19 passed, 0 failed**:

`computeMastery` (7): none → `NOT_STARTED`; learn-only → `LEARNING`; single low-accuracy practice → `PRACTICING`; two practices best≥80 avg≥80 → `STRONG`; avg<80 → `PRACTICING`; null avg → `PRACTICING`; single 100% practice → `PRACTICING`.
`computeTopicProgress` (5): none → 0; full envelope → 100; one learning → 13; one 80% practice → 26; null accuracy never negative → 10.
`buildSuggestions` (7): empty → `[]`; continue-learning fallback when all mastered; most-recent non-mastered selection; `practice_again`; `review_weak_topic` with accuracy text; `related_next_topic`; full ordering continue → practice → weak → related.

## 15. Verification: Integration Script

`pnpm --filter=@novilearn/api exec tsx scripts/phase8-integration-tests.ts` → **54 passed, 0 failed**:

- **Auth**: all five progress endpoints return `401` without a token.
- **Empty state**: fresh user has zero counts, empty topics/history/suggestions, `averageAccuracy: null`.
- **Persistence (real DB)**: 3 learning activities recorded, 3 seeded + 1 completed practice session (4 rows), `totalAnswers` 17, `totalCorrectAnswers` 12, average accuracy 60, 3 unique topics; the completed session row exists with its enriched results.
- **Mastery/progress**: photosynthesis `STRONG` (best 100, avg 90, progress 63); magnetism `PRACTICING` (best 60); chemistry `PRACTICING` (avg 0); topics sorted by recency.
- **History**: learning limit honored; practice detail returns topic/stats/results including question text and correct answer for enriched rows.
- **Suggestions**: correct ordering; continue-learning skips mastered; weak topic is the lowest-accuracy topic; related concept surfaces from metadata.
- **Ownership/security**: user B gets `404` for user A's session; B's topics/summary/suggestions are isolated and empty.
- **Validation**: `limit` of `0`/`101`/`abc`/`-3` → `400`; non-UUID id → `400`; missing UUID → `404`.
- **Phase 7 regression**: `/practice/generate` without token `401`; without AI key `503` (not `500`); no practice row leaked on failed generation.
- **Service layer**: summary/topics/suggestions/history/detail match the HTTP results.
- **Cleanup**: both test users deleted; cascading rows removed.

Post-run, `phase8-check-db.ts` reports `0` test users, `0` learning activities, `0` practice sessions.

## 16. Known Pre-existing Issues (not introduced by Phase 8)

- **Repo-wide `prettier --check` fails on the untouched HEAD.** The shared config at `packages/config/prettier/index.js` is not wired up: there is no root `.prettierrc`, the root `format` script passes no `--config`, and its referenced `prettier-plugin-packagejson` is not installed. `prettier` therefore runs with defaults and flags ~160 files that predate this phase. All Phase 8 files were formatted with the effective tooling and pass. Fixing this properly (adding a root config) is a standalone repo-wide task.
- **Mobile web-export requires `react-native-web`**, which is not in `apps/mobile/package.json`; `expo export --platform web` fails with a "install react-native-web" message. The native (android) export used for verification succeeds. This predates Phase 8.
- **`apps/api/src/index.ts:122`** logs a startup line that trips the `no-console` rule (warning only, intentionally kept).

## 17. Gates Closed

Every gate in §13–§15 passes: recursive typecheck (7 projects), recursive lint (one pre-existing warning), `prisma validate`, Phase 8 prettier compliance, `next build` with the new `/progress` route, `expo export --platform android`, 19/19 unit checks, 54/54 integration checks, and a clean database afterwards.

## 18. Notes for Future Phases

- Topic identity is currently the normalized question string; a real topic taxonomy/embedding would improve mastery grouping and suggestion quality.
- `LearningActivity.type` and `metadata` are extensible for future activity sources (e.g., quizzes, reading) without a migration.
- Progress is computed on demand; if data volume grows, a materialized per-topic aggregate table can replace the group-by scans without changing the API contract.
- Personalization is deterministic and rule-based; it can be swapped for a heuristic/ML ranker behind `buildSuggestions` while keeping the response shape.
