# Phase 6 — Learning Experience & Interactive Learning (Final Report)

> Delivered: Sep 19, 2026 · Monorepo workspace · Zero new runtime dependencies

## 1. Files Added / Changed

### Added

| File                                                    | Purpose                                                         |
| ------------------------------------------------------- | --------------------------------------------------------------- |
| `apps/web/src/components/ai/learning-section.tsx`       | Reusable titled learning section (content or bullet items)      |
| `apps/web/src/components/ai/visual-learning.tsx`        | Visual learning foundation card (flow/steps/chain)              |
| `apps/web/src/components/ai/related-concepts.tsx`       | Related concepts row (navigates via `?q=`)                      |
| `apps/web/src/components/ai/continue-learning.tsx`      | Continue learning row (navigates via `?q=`)                     |
| `apps/web/src/components/ai/follow-up-questions.tsx`    | Interactive follow-up question buttons                          |
| `apps/web/src/components/ai/learning-experience.tsx`    | Composes the full learning experience from a `LearningResponse` |
| `apps/web/src/components/ai/question-form.tsx`          | Reusable ask-a-question form (top + "Ask another question")     |
| `apps/mobile/src/components/ai/learning-section.tsx`    | Mobile learning section                                         |
| `apps/mobile/src/components/ai/visual-learning.tsx`     | Mobile visual learning card                                     |
| `apps/mobile/src/components/ai/related-concepts.tsx`    | Mobile related concepts                                         |
| `apps/mobile/src/components/ai/continue-learning.tsx`   | Mobile continue learning                                        |
| `apps/mobile/src/components/ai/follow-up-questions.tsx` | Mobile follow-up question buttons                               |
| `apps/mobile/src/components/ai/learning-experience.tsx` | Mobile learning experience composer                             |
| `apps/mobile/src/components/ai/question-form.tsx`       | Mobile ask-a-question form                                      |
| `docs/phase-6-final-report.md`                          | This report                                                     |

### Changed

| File                                            | Change                                                                                                                                                                                                 |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `packages/types/src/index.ts`                   | Added `VisualLearningType`, `VisualLearningNode`, `VisualLearningEdge`, `VisualLearning`; `LearningResponse` gains optional `visualLearning`, `relatedConcepts`, `nextLearning` (backwards-compatible) |
| `apps/api/src/ai/ai.types.ts`                   | `ProviderRawContent` gains optional `relatedConcepts`, `nextTopics`, `visualRepresentation`                                                                                                            |
| `apps/api/src/ai/normalizer.ts`                 | Rewritten: zod-driven optional enrichment validation, list caps, visual cleaning, new "Learn this concept" summary title                                                                               |
| `apps/api/src/ai/prompts/system.ts`             | Prompt + JSON shape rules for related concepts / next topics / visual representation                                                                                                                   |
| `apps/web/src/components/ai/ai-tutor.tsx`       | Rewritten: staged loading, LearningExperience, two QuestionForms, `onAskFollowUp` auto-submit                                                                                                          |
| `apps/mobile/src/components/ai/ai-tutor.tsx`    | Rewritten to mirror web behavior                                                                                                                                                                       |
| `apps/web/src/components/ai/ai-response.tsx`    | **Removed** (replaced by `LearningExperience`)                                                                                                                                                         |
| `apps/mobile/src/components/ai/ai-response.tsx` | **Removed** (replaced by `LearningExperience`)                                                                                                                                                         |
| `docs/architecture.md`                          | Documented Phase 6 learning-experience architecture                                                                                                                                                    |
| `docs/project-structure.md`                     | Documented new components, types, and this report                                                                                                                                                      |

## 2. Dependencies Added

**None (0 new dependencies).** No visualization framework, no new client/server libraries — the visual learning foundation is rendered from plain component markup (numbered steps / arrow-separated flow) driven by structured data. Consistent with the project's minimal-dependency policy.

## 3. Overview: From Q&A to a Learning Experience

The `/learn` surface is no longer a single Q→A exchange. A question now produces a guided, structured learning journey:

```
Your question (echo banner)
  → Learn this concept (summary)
  → Simple explanation
  → Key points
  → Example
  → Analogy
  → Visual learning foundation   (optional)
  → Related concepts             (optional)
  → Continue learning            (optional)
  → Follow-up questions          (interactive, auto-submit through /ai/learn)
  → Accuracy disclaimer
```

Only sections the model actually produced, plus the optional enrichment the model genuinely found useful, are rendered — nothing is fabricated or forced.

## 4. Shared Contracts

All in `packages/types` (no request-schema changes in `packages/shared`):

```ts
type VisualLearningType = "flow" | "steps" | "chain";
interface VisualLearningNode {
  label: string;
  details?: string;
}
interface VisualLearningEdge {
  from: number;
  to: number;
  label?: string;
}
interface VisualLearning {
  type: VisualLearningType;
  title: string;
  nodes: VisualLearningNode[];
  edges?: VisualLearningEdge[];
}

interface LearningResponse {
  question: string;
  sections: LearningResponseSection[]; // unchanged semantics
  visualLearning?: VisualLearning; // NEW optional
  relatedConcepts?: string[]; // NEW optional (<= 6)
  nextLearning?: string[]; // NEW optional (<= 6)
  disclaimer?: string;
}
```

The additions are optional and backward-compatible: a Phase 5-style response remains a valid Phase 6 response.

## 5. AI Prompt & Normalization Pipeline

- **Prompt (`prompts/system.ts`)** now permits three additional JSON fields alongside the core sections: `relatedConcepts` (≤ 6 truly-related topics), `nextTopics` (≤ 6 natural next topics), and `visualRepresentation` (`{ type: 'flow'|'steps'|'chain', title?, nodes: [{label, details?}], edges?: [{from, to}] }`). Rules: omit anything that is not genuinely useful; never fabricate; visuals only for clear linear/sequential processes with 2–6 nodes.
- **Normalizer (`normalizer.ts`)** validates the optional fields with zod:
  - Requires a non-empty `summary` (its title is now **"Learn this concept"**).
  - Trims entries and caps lists at 6; proven-empty lists are omitted.
  - `visualRepresentation` → `visualLearning` only when ≥ 2 non-empty nodes survive; edges are index-validated (out-of-range / self edges dropped) and default to sequential when none remain; a missing title defaults to "How it works".
  - Any malformed provider JSON, wrong shape, or missing summary → `502 AI_RESPONSE_INVALID`.
  - `nextTopics` maps to `nextLearning` in the shared response.

## 6. API Behavior

The endpoint is unchanged — **no new endpoints** (`/learning`, `/lesson`, `/concepts` were intentionally not added):

`POST /ai/learn` (Bearer token)

| Case                                       | Status                                            |
| ------------------------------------------ | ------------------------------------------------- |
| Success                                    | `200` `{ success, data: LearningResponse, meta }` |
| Missing/invalid token                      | `401` `UNAUTHORIZED`                              |
| Invalid question                           | `400` `VALIDATION_ERROR`                          |
| Repeated identical **successful** question | `429` `RATE_LIMITED`                              |
| Per-user rate limit exceeded (20/10 min)   | `429` `RATE_LIMITED`                              |
| Provider not configured                    | `503` `AI_PROVIDER_NOT_CONFIGURED`                |
| Provider failure / malformed response      | `502` `AI_PROVIDER_ERROR` / `AI_RESPONSE_INVALID` |

Middleware chain unchanged: `authenticate → per-user rate limiter → validate(learningQuestionSchema) → success-only duplicate guard → learnController`. No new DB tables; learning stays stateless.

## 7. Web Changes

- `ai-tutor.tsx` rewritten into a four-state experience with **staged loading** copy: "Understanding your question…" → "Preparing your explanation…" (2.5s cadence).
- Top question form + a second **"Ask another question"** form rendered below a successful answer (the input is never left disabled after success).
- `LearningExperience` composes: question banner → core sections → visual → related → continue → follow-ups → disclaimer.
- Related concepts and continue-learning chips are links that navigate to `/learn?q=<topic>` (reuses the dashboard prefill pattern).
- Follow-up questions are buttons; pressing one fills the form and **auto-submits** through the existing AI flow (`onAskFollowUp` → `setQuestion(q)` + `submit(q)`) — no hardcoded answers anywhere.
- Errors render "Something went wrong while preparing your lesson" + **Try again** (replays the last question); provider internals are never shown.

## 8. Mobile Changes

- Same component set as web, built from the mobile UI kit (Cards, theme-aware surfaces, Ionicons).
- `ai-tutor.tsx` mirrors the web flow: staged loading, one top form, `LearningExperience`, a second "Ask another question" form, follow-up auto-submit, and Retry.
- Touch targets are ≥ 48pt on all follow-up/related/continue rows and buttons; rows use `accessibilityRole="button"` + descriptive labels.
- Same shared `aiApi.learn` contract; still stateless.

## 9. Loading & Error UX

- **Loading** (both platforms): two human, non-technical stages — no "calling the model", no human-review claims.
- **Error** (both platforms): `title: "Something went wrong while preparing your lesson"` with a Retry action that replays the last question (`lastQuestion`). No stack traces, no provider names, no keys.

## 10. Follow-Up Questions (Interactive Learning)

The model's `follow_ups` section is not printed as static text. `FollowUpQuestions` renders each suggestion as an accessible button; selecting one routes it back through the full `/ai/learn` flow automatically. This keeps answers honest (they come from the AI each time) and makes the learning surface interactive without any conversation-persistence machinery.

## 11. Visual Learning Foundation

- When the model identifies a clear sequential process, it returns `visualRepresentation`; the normalizer turns it into a `VisualLearning` and each client renders a **Visual Learning Foundation** card.
- `flow` renders left-to-right arrow-connected chips, `steps` renders numbered steps, `chain` renders linked nodes — all from structured data, no diagrams-as-images and no visualization libraries.
- The card is a _foundation_: it deliberately stops short of a full diagram engine; interactive/auto-generated diagrams are explicitly out of scope for this phase.

## 12. Related Concepts & Continue Learning

- `RelatedConcepts` and `ContinueLearning` list up to 6 topics as links; clicking one opens `/learn?q=<topic>` (web) / `/learn?q=<topic>` (mobile) so the student can start a new lesson on that topic.
- Data is only shown when the model produced it and the normalizer kept it; empty results are omitted.

## 13. Security Considerations

- All Phase 5 protections are unchanged and were re-verified (auth gate, per-user rate limit, success-only duplicate guard, 2–1000 char question bound, 700 max tokens, 30s timeout, secrets server-side, sanitized errors).
- No new client-trust surfaces: all enrichment data passes through server-side zod validation before it reaches a client.
- Rendering remains injection-safe (JSX/Native text nodes; no `dangerouslySetInnerHTML`).

## 14. Environment Variables & Configuration

**No new environment variables.** Phase 6 reuses `AI_PROVIDER`, `AI_API_KEY`, `AI_MODEL` unchanged.

## 15. Database & State Changes

**None.** No schema or migration changes; no conversation or learning-state persistence was added (stateless by design; persistence is explicitly out of scope).

## 16. Accessibility & Performance

- **Accessibility** (web): semantic headings per section, visible focus on interactive elements, keyboard-operable links/buttons, accessible button labels, WCAG-level contrast via existing theme tokens.
- **Accessibility** (mobile): `accessibilityRole`/`accessibilityLabel` on every interactive row, touch targets ≥ 44–48pt, RN Paper focus feedback.
- **Performance**: zero new dependencies; visuals render from plain markup (no D3/Canvas/RN-Skia); each page is statically generated under `next build`; the mobile bundle only grew with component code (no new fonts/libs).

## 17. Verification

Commands (all passed):

- `pnpm typecheck` → 7/7 packages, 0 errors
- `apps/api` → `pnpm exec tsc --noEmit` ✓
- `apps/api` → `pnpm exec eslint "src/**/*.{ts,tsx}" --max-warnings=0` → 0 errors, 1 pre-existing warning (`index.ts:118` intentional startup `console.log`)
- `apps/web` → `pnpm exec eslint "src/**/*.{ts,tsx}" --max-warnings=0` → clean
- `apps/mobile` → `pnpm exec eslint "src/**/*.{ts,tsx}" --max-warnings=0` → clean
- `pnpm exec prettier --write` then `--check` on all Phase 6 changed files → clean (default config; repo-wide web check still has 64 pre-existing Phase 1–4 stragglers)
- `apps/web` → `pnpm exec next build` → 12 routes; `/learn` 3.19 kB (13 kB larger than Phase 5 due to the learning-experience components)
- `apps/mobile` → `pnpm exec expo export --platform android` → Android bundle (4.52 MB) ✓

Normalizer unit checks (throwaway `tsx` script, run against `src/ai/normalizer.ts`, deleted afterwards) — **14/14 passed**:

- Full enrichment maps correctly (sections ≥ 6, "Learn this concept" summary title, `relatedConcepts`, `nextTopics → nextLearning`, 3-edge visual, disclaimer)
- Single-node visual → omitted
- All-invalid visual edges → defaulted to sequential
- Mixed edges → valid ones kept, invalid dropped
- Empty/whitespace related + next + visual → all omitted
- Missing summary / invalid JSON / wrong shape / unsupported visual type → `AI_RESPONSE_INVALID`

Live API tests (running dev server on `:3001`):

| Test                                           | Result                                                  |
| ---------------------------------------------- | ------------------------------------------------------- |
| `POST /ai/learn` no token                      | `401` ✓                                                 |
| `POST /ai/learn` valid (authed, no key)        | `503` AI_PROVIDER_NOT_CONFIGURED ✓                      |
| 20 consecutive unique questions (authed)       | `503`×20 (allowed) ✓                                    |
| 21st–22nd requests (authed)                    | `429` RATE_LIMITED ✓ — per-user limiter intact          |
| Identical question twice (fresh user)          | both `503`, NOT `429` ✓ — success-only dup guard intact |
| `POST /auth/signup` → `GET /auth/me`           | `201`/`200`, correct user ✓                             |
| `POST /auth/logout`                            | `200` ✓                                                 |
| `GET /auth/me` + `POST /ai/learn` after logout | `401` ✓                                                 |

## 18. Known Limitations, Warnings & Phase 7 Status

- **Success path still needs a real key**: with no `AI_API_KEY`, the live 200 (enrichment) path is code-reviewed, type-checked, and normalizer-tested via unit script, but the live model output requires provider credentials.
- **Visuals are a foundation**: only linear `flow`/`steps`/`chain` visuals from structured data; branching diagrams/auto-layout are out of scope.
- **Stateless**: refreshing loses the conversation; related/next navigation re-asks the AI (`?q=`), never cached or personalized — by design.
- **In-memory limits**: rate limit + duplicate guard reset on restart (unchanged from Phase 5).
- **Warnings**: the single pre-existing `no-console` in `apps/api/src/index.ts:118`; Next.js `MODULE_TYPELESS_PACKAGE_JSON` note for `design-tokens`; the "Next.js plugin not detected" ESLint notice; all informational/pre-existing, no new warnings introduced.

**Phase 7 has NOT been started.**
