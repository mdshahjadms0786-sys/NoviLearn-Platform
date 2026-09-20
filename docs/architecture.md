# Architecture Overview

## Monorepo Structure

NoviLearn uses a pnpm workspace monorepo with the following structure:

```
NoviLearn/
├── apps/
│   ├── api/          # Backend API (Express + TypeScript)
│   ├── web/          # Web Application (Next.js + React)
│   └── mobile/       # Mobile Application (Expo + React Native)
├── packages/
│   ├── config/       # Shared tooling configurations
│   ├── types/        # Shared TypeScript type definitions
│   └── shared/       # Shared utilities and validation schemas
└── docs/             # Documentation
```

## Core Principles

1. **Single Source of Truth**: Shared types, validation, and configuration across all apps
2. **Type Safety**: End-to-end TypeScript with strict mode enabled
3. **Separation of Concerns**: Clear boundaries between apps and shared packages
4. **Scalability**: Architecture supports future growth (AI, auth, real-time, etc.)
5. **Developer Experience**: Consistent tooling, fast feedback loops

## Application Architecture

### API (apps/api)

- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Validation**: Zod schemas (shared via @novilearn/shared)
- **API Design**: RESTful with consistent response format
- **Authentication**: JWT bearer tokens (`/auth/signup`, `/auth/login`, `/auth/logout`, `/auth/me`)
- **Auth Revocation**: `tokenVersion` on User — logout increments it and invalidates issued JWTs
- **Security**: bcrypt hashing (cost 12), generic login errors, in-memory rate limiting
- **AI Tutor / Learning Experience**: authenticated `POST /ai/learn` → provider abstraction → normalized structured `LearningResponse` (summary, explanation, key points, example, analogy, plus optional visual learning, related concepts, and next topics); provider only configurable via env (`AI_PROVIDER`, `AI_API_KEY`, `AI_MODEL`); secrets stay server-side; per-user rate limit + duplicate-guard; stateless (no chat/learning-state persistence)
- **Practice / Assessment**: authenticated `POST /practice/generate`, `/practice/answer`, `/practice/complete` → ephemeral server-side sessions (in-memory, 60-min TTL, no DB persistence) → AI-generated questions (MCQ, true/false, short answer) → server-side evaluation → session result; correct answers never reach the client before submission; per-user rate limits; idempotent answering
- **CORS**: Restricted to the web app origin (`WEB_URL`)
- **Health Check**: `GET /health` endpoint

### Web (apps/web)

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS with CSS variables for theming
- **UI Components**: shadcn/ui (Radix UI primitives)
- **State Management**: TanStack Query (server) + Zustand (client)
- **Auth State**: Zustand store backed by `localStorage`, `useAuth` hook, `ProtectedRoute`
- **Auth UI**: `/login`, `/signup` pages (react-hook-form + shared zod schemas)
- **App Shell**: authenticated `(app)` route group with sticky header (brand, theme toggle, profile menu), responsive sidebar (desktop) and slide-over sheet (mobile)
- **Navigation**: Home, Learn, Practice, Progress, Profile — active state via `usePathname`
- **Student Home**: `/home` dashboard (welcome, learning entry, quick actions, continue learning, recent activity, recommended) with empty states only
- **Learn**: `/learn` learning-experience page (question input → staged loading → Learning Experience: question banner, concept summary, key points, examples, analogies, visual learning, related concepts, continue learning, and auto-submitting follow-up questions); prefills from the dashboard with `?q=`
- **Practice**: `/practice` practice session flow (config form → staged loading → per-question answering with instant feedback → results & breakdown); prefills a topic with `?topic=`
- **Progress**: `/progress` coming-soon page
- **Profile**: `/account` profile page inside the app shell (account info, learning profile, sign out)
- **Landing Redirect**: authenticated visitors to `/` are redirected to `/home`
- **Forms**: React Hook Form + Zod validation
- **Type Safety**: Shared types from @novilearn/types

### Mobile (apps/mobile)

- **Framework**: Expo with React Native
- **Routing**: Expo Router (file-based)
- **Styling**: NativeWind (Tailwind for React Native)
- **UI Components**: React Native Paper (Material Design 3) primitives
- **Icons**: `@expo/vector-icons` (Ionicons)
- **State Management**: TanStack Query + Zustand
- **Auth State**: Zustand store backed by AsyncStorage, `RequireAuth` wrapper
- **Auth UI**: `/login`, `/signup` screens (react-hook-form + shared zod schemas)
- **App Shell**: persistent header (brand, theme toggle, avatar) and bottom tab bar wrapping every authenticated screen; safe-area insets respected
- **Navigation**: Home, Learn, Practice, Progress, Profile bottom tabs with active state via `usePathname`
- **Student Home**: `/` dashboard (welcome, learning entry, quick actions, continue learning, recent activity, recommended) with empty states only
- **Learn**: `/learn` learning-experience screen (question input → staged loading → Learning Experience with concept summary, key points, examples, analogies, visual learning, related concepts, continue learning, and follow-up questions), prefills from the dashboard with `?q=`
- **Practice**: `/practice` practice session screen (config form → staged loading → per-question answering with instant feedback → results & breakdown); prefills a topic with `?topic=`
- **Progress**: `/progress` coming-soon screen
- **Profile**: `/account` inside the shell (membership, learning profile, design system, sign out)
- **Forms**: React Hook Form + Zod validation
- **Theming**: Light/dark mode with React Native Paper theming

## Shared Packages

### @novilearn/config

Centralized configuration for:

- ESLint (base, Next.js, React Native variants)
- Prettier
- TypeScript (base, Next.js, React Native, Node variants)

### @novilearn/types

Core TypeScript types shared across all applications:

- API response types (ApiResponse, ApiError, PaginatedResponse)
- Domain types (User, UUID, Environment, HealthCheck)
- Utility types (PaginationParams, LogLevel, etc.)

### @novilearn/shared

Runtime utilities and validation:

- Zod schemas for shared validation
- API response helpers (createApiResponse, createApiError, createPaginatedResponse)
- Common validation schemas (email, password, pagination, etc.)

## Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Web App   │     │ Mobile App  │     │  Other      │
│  (Next.js)  │     │  (Expo)     │     │  Clients    │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       └───────────────────┼───────────────────┘
                           ▼
                    ┌─────────────┐
                    │   API       │
                    │  (Express)  │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  Database   │
                    │ (PostgreSQL)│
                    └─────────────┘
```

## API Contract

All API responses follow a consistent format:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ResponseMeta;
}

interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  statusCode: number;
}
```

## Database

- **ORM**: Prisma Client
- **Database**: PostgreSQL
- **Migrations**: Prisma Migrate
- **Schema**: Defined in `apps/api/prisma/schema.prisma`

Current models:

- User (id, email, name, password, role, tokenVersion, createdAt, updatedAt)

`tokenVersion` is an integer (default 0) included as a `version` claim in JWTs. When a user logs out, the counter is incremented, which invalidates every previously issued token for that user.

## Authentication Flow

```
Client                API                         Database
  │   POST /auth/signup  │                            │
  ├─────────────────────►│  validate + hash password  │
  │                      │───────────────────────────►│  create user (tokenVersion: 0)
  │                      │  sign JWT {sub, version}   │
  │◄── 201 {user, token}─┤                            │
  │                      │                            │
  │   GET /auth/me (Bearer token)                     │
  ├─────────────────────►│  verify JWT + version match│
  │                      │───────────────────────────►│  read user
  │◄── 200 {user}────────┤                            │
  │                      │                            │
  │   POST /auth/logout (Bearer token)                │
  ├─────────────────────►│  increment tokenVersion    │
  │                      │───────────────────────────►│  update user
  │◄── 200 {message}─────┤
```

- **Signup**: `POST /auth/signup` → `201` with `{ success, data: { user, token } }`
- **Login**: `POST /auth/login` → `200` with `{ success, data: { user, token } }`
- **Me**: `GET /auth/me` (Bearer token) → `200` with `{ success, data: user }`
- **Logout**: `POST /auth/logout` (Bearer token) → `200`; increments `tokenVersion`

## Student App (Phase 4)

### Main Navigation

Authenticated students land on a Student Home inside an app shell:

- **Web**: sticky top header (brand + theme toggle + profile dropdown) plus a fixed sidebar on `lg+` screens; on smaller screens the sidebar becomes a slide-over sheet opened from the header. Main content is a scrollable `max-w-5xl` column.
- **Mobile**: persistent header (brand, light/dark toggle, avatar) and a 5-item bottom tab bar (Home, Learn, Practice, Progress, Profile). Both header and tab bar respect safe-area insets.

The five destinations on both platforms are:
Home (`/home` web, `/` mobile), Learn (`/learn`), Practice (`/practice`), Progress (`/progress`), and Profile (`/account`).

### Student Home Sections

- **Welcome**: personalized greeting using the signed-in user's name from the auth store (no hardcoded user data)
- **Learning Entry**: free-text topic input that navigates to the AI Tutor with the question prefilled (`/learn?q=...` web, `/learn?q=...` mobile)
- **Quick Actions**: four shortcut cards into Learn, Practice, Progress, Profile
- **Continue Learning**: empty state (no fake data) — a future phase will surface in-progress learning paths
- **Recent Activity**: empty state — a future phase will surface completed work
- **Recommended Learning**: empty state — a future phase will power personalization

### Auth Gating & Redirects

All app-shell screens are wrapped in the existing `ProtectedRoute`/`RequireAuth` — unauthenticated visitors are redirected to `/login`. When an already-authenticated visitor opens the public landing page (`/` web), an `AuthenticatedRedirect` moves them to the Student Home (`/home`).

### Placeholder Screens

Progress is a first-class route with a shared `ComingSoon` placeholder so navigation and layout stay functional before its engine arrives. Practice shipped a full practice engine in Phase 7.

## AI Tutor (Phase 5)

NoviLearn's first learning surface. Students ask a question and receive a structured, beginner-friendly answer.

### Endpoint

`POST /ai/learn` (Bearer token):

```
Body: { "question": "string (2-1000 chars)" }
200  { success, data: LearningResponse }
400  VALIDATION_ERROR    (invalid question)
401  UNAUTHORIZED         (missing/invalid token)
429  RATE_LIMITED         (per-user window or repeated same successful question)
503  AI_PROVIDER_NOT_CONFIGURED (no provider/api key configured)
500  INTERNAL_SERVER_ERROR       (unexpected failure)
```

Middleware chain: `authenticate → per-user rate limiter → validate(learningQuestionSchema) → duplicate guard → learnController`.

### Provider Abstraction (`apps/api/src/ai`)

- `ai.types.ts` — `LanguageModelMessage`, `LanguageModelConfig`, `AiProvider`, `AiCompletionInput`, `ProviderRawContent`
- `prompts/system.ts` — system prompt (JSON-only output, no fabricated citations, beginner-friendly, does not claim the student's level) + `buildTutorMessages(question)`
- `providers/openai.provider.ts` — OpenAI chat-completions via native `fetch` (no SDK dependency), `response_format: json_object`, 30s timeout, non-fatal provider errors sanitized into a 502 `AI_PROVIDER_ERROR`
- `providers/index.ts` — `createProvider(name)` factory (503 if the provider is not registered)
- `normalizer.ts` — validates/normalizes provider JSON into a shared `LearningResponse`; requires a non-empty `summary`
- `ai.service.ts` — resolves `config.ai` (503 when provider/key missing), calls the provider, normalizes

The normalized `LearningResponse` contains fixed-titled sections in order: Learn this concept (summary), Simple explanation, Key points, Example, Analogy, Follow-up questions — only sections the model produced are present, plus optional `visualLearning`, `relatedConcepts`, and `nextLearning`, and an accuracy disclaimer.

### Learning Experience Enrichment (Phase 6)

- **Optional enrichment fields** on `LearningResponse`: `visualLearning` (a `flow`/`steps`/`chain` diagram with 2–6 labeled nodes and validated edges), `relatedConcepts` (up to 6 topics), and `nextLearning` (up to 6 topics). All are optional; the response is a valid Phase 5-format answer even when none are present.
- **Prompt rules**: the model produces `relatedConcepts`/`nextTopics` nested under a single optional `visualRepresentation` object only when genuinely useful — no fabricated or decorative data; visuals only for clear linear/sequential processes.
- **Normalizer rules**: requires a non-empty `summary`; trims/caps list items; omits empty or single-node visuals; validates edge indices (drops out-of-range/self edges, defaults to sequential); any malformed shape → `502 AI_RESPONSE_INVALID`.
- **Client rendering**: every platform renders the same component set (`LearningSection`, `VisualLearning`, `RelatedConcepts`, `ContinueLearning`, `FollowUpQuestions`) wrapped in a `LearningExperience`; follow-ups are real buttons that auto-submit the question through the existing `/ai/learn` flow (no hardcoded answers), and related/next links reuse the `?q=` prefill pattern.
- **Loading UX**: staged copy ("Understanding your question…", "Preparing your explanation…") replaces a bare spinner; errors show "Something went wrong while preparing your lesson" + Retry, never provider internals.

### Protection & Cost Controls

- `AI_PROVIDER`/`AI_API_KEY`/`AI_MODEL` are read from env at runtime; an unconfigured service returns 503 instead of crashing
- Per-user in-memory rate limit (20 requests / 10 minutes, keyed by user id) on `/ai/learn`
- Duplicate guard blocks repeats of an identical question within 10 seconds **only when the previous identical request succeeded** (failed calls are never blocked, so retries still work)
- `maxTokens` 700, `temperature` 0.4, 30s timeout per completion
- Secrets never leave the server; sanitized errors only

### Client Rendering

Web and mobile render responses without `dangerouslySetInnerHTML`. A tiny markdown-lite renderer supports `**bold**`, `` `code` ``, and `-`/`1.` lists (web: JSX; mobile: nested `Text`). Both apps treat the conversation as stateless — no chat history is stored.

## Practice & Assessment (Phase 7)

A practice session engine layered on the same AI pipeline. Students configure a topic, question count (5 or 10), difficulty (easy/medium/hard), and question type (mixed, MCQ, true/false, short answer); the server generates a question set, scores each answer server-side, and returns a session result.

### Endpoints

`POST /practice/generate` (Bearer token):

```
Body: { "topic": "string (2-100 chars)", "questionCount": 5 | 10, "difficulty": "easy" | "medium" | "hard", "questionType": "mixed" | "mcq" | "true_false" | "short_answer" }
200  { success, data: PracticeSet { sessionId, topic, config, questions[] } }
400  VALIDATION_ERROR
401  UNAUTHORIZED
429  RATE_LIMITED            (per-user window)
503  AI_PROVIDER_NOT_CONFIGURED
502  AI_RESPONSE_INVALID      (malformed/unsafe generated questions)
500  INTERNAL_SERVER_ERROR
```

`POST /practice/answer` (Bearer token):

```
Body: { "sessionId", "questionId", "answer" }
200  { success, data: PracticeEvaluation { questionId, correct, explanation, correctAnswer } }
400  VALIDATION_ERROR
401  UNAUTHORIZED
404  PRACTICE_SESSION_NOT_FOUND / PRACTICE_QUESTION_NOT_FOUND
```

`POST /practice/complete` (Bearer token):

```
Body: { "sessionId" }
200  { success, data: PracticeResult { sessionId, topic, totalQuestions, correctAnswers, incorrectAnswers, accuracy, score, results[] } }
400/401/404 as above
```

Middleware chain: `authenticate → per-user rate limiter → validate(schema) → handler`.

### Session Model

- Practice sessions are **stateless server-side**: kept in an in-memory map keyed by an opaque `sessionId` (`randomUUID`), 60-minute TTL, max 12 concurrent sessions per user. Nothing is written to the database in Phase 7.
- The `PracticeSet` returned to the client contains questions **without** correct answers, so a student can never read correct answers from app state, network, or DevTools.
- `/practice/answer` is idempotent: re-submitting an already-answered question returns the recorded evaluation without changing the session score.

### Generation & Evaluation (`apps/api/src/practice`)

- The practice prompt (`apps/api/src/ai/prompts/practice.ts`) follows the AI Tutor's strict JSON-output / beginner-friendly / no-fabrication rules and requests exactly `questionCount` questions of the configured type and difficulty.
- `practice.normalizer.ts` normalizes provider JSON into `InternalPracticeQuestion[]`, refusing unsafe output (missing/undefined answer, wrong option count, balanced true/false options, duplicate text, too few/many questions) with `502 AI_RESPONSE_INVALID`.
- `evaluator.ts` scores answers server-side. MCQ/true-false use exact option matching; short answer uses normalized text comparison (trim, lowercase, whitespace collapse, trailing punctuation strip) — a documented Phase 7 limitation (no semantic grading).
- Client rendering: web (`practice-tutor.tsx`) and mobile (`practice-flow.tsx`) share the same state machine (setup → staged loading → question → feedback → result) and reuse the `?topic=` (into Practice) and `/learn?q=` (back into Learn) navigation patterns.

### Protection & Cost Controls

- Providers/keys read from env at runtime (503 when unconfigured) — same rules as `/ai/learn`
- Per-user in-memory rate limits: 20 generate requests / 10 minutes and 200 answer+complete actions / 10 minutes
- `maxTokens` 2500, `temperature` 0.4, 30s timeout per completion
- Secrets never leave the server; sanitized errors only

## Future Extensibility

The architecture is designed to support:

- **AI Services**: Vercel AI SDK, LangChain, pgvector for embeddings
- **Real-time**: WebSockets for live features
- **File Storage**: S3-compatible storage
- **Background Jobs**: Queue system for async processing
- **Monitoring**: Structured logging, error tracking, metrics

## Development Workflow

1. **Type Changes**: Modify @novilearn/types → rebuild shared → apps auto-update
2. **Validation Changes**: Modify @novilearn/shared → apps auto-update
3. **Config Changes**: Modify @novilearn/config → all apps inherit
4. **Database Changes**: Modify Prisma schema → `pnpm db:generate` → `pnpm db:push`

## Code Quality

- **TypeScript**: Strict mode, noUncheckedIndexedAccess, exactOptionalPropertyTypes
- **ESLint**: Shared configs with React, TypeScript, import ordering rules
- **Prettier**: Consistent formatting across all packages
- **Husky**: Pre-commit hooks for linting and formatting
