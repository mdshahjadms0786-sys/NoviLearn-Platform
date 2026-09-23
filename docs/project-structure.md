# Project Structure

## Root Level

```
NoviLearn/
├── apps/                    # Applications (deployable units)
├── packages/                # Shared packages (libraries)
├── docs/                    # Documentation
├── .env.example             # Environment variable template
├── .gitignore               # Git ignore rules
├── Dockerfile               # Production API container
├── docker-compose.yml       # Postgres 18 + API stack
├── package.json             # Root package.json with workspace scripts
├── pnpm-workspace.yaml      # pnpm workspace configuration
├── pnpm-lock.yaml           # Lockfile
└── README.md                # Project overview
```

## Applications

> This is a **pure JavaScript** monorepo — no TypeScript anywhere. All source
> files are `.js`/`.jsx`. The API and the shared packages run directly from
> `src` on Node.js ESM (no build/compile step); web/mobile are bundled at
> build time by Next.js/Expo (Metro).

### apps/api - Express Backend API

```
apps/api/
├── src/
│   ├── index.js             # Entry point, Express app setup, error handler, /auth + /ai + /practice + /progress router mounts
│   ├── config.js            # Environment-derived config (port, urls, jwt, ai)
│   ├── env.js               # .env loader + zod schema validation
│   ├── prisma.js            # Prisma Client singleton
│   ├── errors.js            # AppError class
│   ├── observability/
│   │   └── error-tracking.js # Sentry init + error capture (guarded, optional DSN)
│   ├── ai/
│   │   ├── ai.types.js      # Provider/LM shape docs + AI completion input
│   │   ├── ai.service.js    # AI orchestration (config guard → provider → normalize) + shared completion helper
│   │   ├── normalizer.js    # Provider JSON → shared LearningResponse normalization
│   │   ├── prompts/
│   │   │   ├── system.js    # System prompt + tutor message builder
│   │   │   └── practice.js  # Practice question generation prompt + message builder
│   │   ├── embeddings/
│   │   │   ├── service.js   # Embedding provider abstraction + backfill
│   │   │   ├── local.js     # Local deterministic embeddings (offline/safe default)
│   │   │   └── providers/openai.embeddings.js # OpenAI embeddings via fetch
│   │   └── providers/
│   │       ├── openai.provider.js # OpenAI chat-completions via fetch
│   │       ├── anthropic.provider.js # Anthropic messages API via fetch
│   │       └── index.js     # Provider registry/factory
│   ├── practice/
│   │   ├── practice.types.js    # Internal practice session shapes + payload mappers
│   │   ├── practice.service.js  # Generation, answer scoring, session completion
│   │   ├── practice.normalizer.js # Provider JSON → internal questions normalization
│   │   ├── evaluator.js     # Answer evaluation (mcq / true-false / short answer)
│   │   ├── session-store.js # In-memory ephemeral session store (60-min TTL, per-user cap)
│   │   └── text.js          # Answer/text normalization helpers
│   ├── progress/
│   │   ├── calculations.js  # Pure mastery + topic-progress computation
│   │   ├── personalization.js # Pure next-learning suggestion builder
│   │   ├── topics.js        # Topic normalization helpers
│   │   └── progress.service.js # DB aggregation, activity recording, history/summary/suggestions
│   ├── rag/
│   │   ├── chunking.js      # Text chunking + checksums
│   │   ├── vectors.js       # cosine similarity / vector helpers
│   │   ├── vector-store.js  # Prisma-backed vector store
│   │   ├── ingestion.js     # Knowledge import pipeline
│   │   ├── context.js       # Retrieval + grounding context builder
│   │   ├── personal-context.js # Owner-scoped context builder
│   │   ├── rag.service.js   # RAG orchestration (best-effort retrieval)
│   │   └── types.js         # KnowledgeSource shapes
│   ├── routes/
│   │   ├── auth.routes.js   # /auth routes
│   │   ├── ai.routes.js     # /ai routes (learn endpoint + protection middleware)
│   │   ├── practice.routes.js # /practice routes (generate/answer/complete + limits)
│   │   └── progress.routes.js # /progress routes (summary/history/topics/suggestions + limits)
│   ├── controllers/
│   │   ├── auth.controller.js  # Auth request handlers
│   │   ├── ai.controller.js    # AI request handlers (+ records learning activity)
│   │   ├── practice.controller.js # Practice request handlers
│   │   └── progress.controller.js # Progress request handlers
│   ├── services/
│   │   └── auth.service.js  # Business logic (signup, login, me, logout)
│   ├── middleware/
│   │   └── auth.js          # requireAuth (JWT verification + version check)
│   ├── validators/
│   │   ├── auth.js          # Zod request validators
│   │   └── practice.js      # Practice request validators
│   └── utils/
│       ├── async-handler.js # Async route wrapper
│       ├── rate-limit.js    # In-memory rate limiter (IP or custom key)
│       ├── dedupe.js        # Success-only duplicate-question guard
│       └── topic.js         # slugifyTopic helper
├── scripts/                 # Committed verification suites + CLI tools (run with plain node)
│   ├── phase8-unit-tests.js / phase8-integration-tests.js
│   ├── phase9-unit-tests.js / phase9-integration-tests.js
│   ├── phase10-unit-tests.js / phase10-integration-tests.js / phase10-restart-check.js / phase10-cleanup.js
│   └── ingest-knowledge.js  # RAG knowledge ingestion CLI
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── migrations/          # Version-controlled migrations
├── package.json
├── eslint.config.js
└── .env                     # Local env (gitignored)
```

### apps/web - Next.js Web Application

```
apps/web/
├── src/
│   ├── app/                 # App Router pages
│   │   ├── layout.jsx       # Root layout
│   │   ├── page.jsx         # Landing page (+ authenticated redirect to /home)
│   │   ├── globals.css      # Global styles + theme tokens
│   │   ├── design-system/   # Design system showcase
│   │   ├── login/           # Sign in page
│   │   ├── signup/          # Create account page
│   │   └── (app)/           # Authenticated app shell route group
│   │       ├── layout.jsx   # ProtectedRoute + AppShell wrapper
│   │       ├── home/        # Student Home dashboard
│   │       ├── learn/       # AI Tutor page
│   │       ├── practice/    # Practice session page (config → questions → results)
│   │       ├── progress/    # Progress dashboard (stats, activity, topics, history, suggestions)
│   │       └── account/     # Profile page (inside the shell)
│   ├── components/
│   │   ├── ui/              # UI component library (shadcn/ui + Radix)
│   │   ├── auth/            # Auth-shell, auth-links, authenticated-redirect
│   │   ├── layout/          # AppShell, AppHeader, Sidebar, MobileNav, SignOutButton
│   │   ├── navigation/      # Nav config + shared nav list
│   │   ├── dashboard/       # Student Home sections
│   │   ├── ai/              # AiTutor, LearningExperience, learning sections (visual/related/continue/follow-ups), QuestionForm, PracticeCta, Markdown (markdown-lite)
│   │   ├── practice/        # PracticeTutor flow + setup/question/feedback/result views
│   │   ├── progress/        # ProgressDashboard + stats/activity/topics/history/suggestion views
│   │   ├── placeholder/     # ComingSoon
│   │   ├── theme-toggle.jsx # Light/dark theme toggle
│   │   └── protected-route.jsx  # Auth-gated route wrapper
│   ├── lib/
│   │   ├── api.js           # API client (authApi, aiApi, practiceApi, progressApi)
│   │   ├── auth-store.js    # Zustand auth store (localStorage persistence)
│   │   ├── auth-events.js   # Cross-tab auth event bus
│   │   ├── use-auth.js      # useAuth hook
│   │   └── utils.js         # Utility functions (cn, etc.)
│   └── hooks/               # Custom React hooks (future)
├── public/                  # Static assets
├── .next/                   # Build output (gitignored)
├── package.json
├── jsconfig.json            # "@/*" → "./src/*" path alias (JS replacement for tsconfig paths)
├── next.config.js           # CJS Next.js config (transpilePackages, outputFileTracingRoot)
├── tailwind.config.js       # CJS Tailwind config (loads @novilearn/design-tokens)
├── postcss.config.js
├── eslint.config.js
└── .env                     # Local env (gitignored)
```

### apps/mobile - Expo React Native Application

```
apps/mobile/
├── src/
│   ├── app/                 # Expo Router pages
│   │   ├── index.jsx        # Student Home dashboard (inside AppShell)
│   │   ├── login.jsx        # Sign in screen
│   │   ├── signup.jsx       # Create account screen
│   │   ├── account.jsx      # Profile screen (inside AppShell)
│   │   ├── learn.jsx        # AI Tutor screen (inside AppShell)
│   │   ├── practice.jsx     # Practice session screen (inside AppShell)
│   │   ├── progress.jsx     # Progress dashboard screen (inside AppShell)
│   │   └── _layout.jsx      # Root layout (theme provider, safe areas)
│   ├── components/
│   │   ├── ui/              # UI component library (RN primitives)
│   │   ├── auth/            # Auth-screen, form-field
│   │   ├── layout/          # AppShell, AppHeader, BottomNav
│   │   ├── dashboard/       # Student Home sections
│   │   ├── ai/              # AiTutor, LearningExperience, learning sections (visual/related/continue/follow-ups), QuestionForm, PracticeCta, MarkdownText (markdown-lite)
│   │   ├── practice/        # PracticeFlow + setup/question/feedback/result views
│   │   ├── progress/        # ProgressDashboard + stats/activity/topics/history/suggestion views
│   │   ├── placeholder/     # ComingSoon
│   │   ├── require-auth.jsx # Auth-gated wrapper
│   │   └── design-system-showcase.jsx  # Mobile component showcase
│   ├── lib/
│   │   ├── api.js           # API client (authApi, aiApi, practiceApi, progressApi)
│   │   ├── auth-store.js    # Zustand auth store (AsyncStorage persistence)
│   │   ├── auth-events.js   # Auth event bus
│   │   ├── config.js        # Env-derived config (API_URL)
│   │   └── utils.js         # Utility functions
│   ├── providers.jsx        # Context providers
│   ├── theme-provider.jsx   # Theme context (react-native-paper + design tokens)
│   └── hooks/               # Custom hooks (future)
├── assets/                  # Images, fonts
├── .expo/                   # Expo cache (gitignored)
├── package.json
├── app.json                 # Expo config
├── babel.config.js          # babel-preset-expo + nativewind
├── metro.config.js          # Monorepo watchFolders + nodeModulesPaths
├── tailwind.config.js       # NativeWind config
├── global.css               # NativeWind styles
├── eslint.config.js
└── .env                     # Local env (gitignored)
```

## Shared Packages

### packages/config - Tooling Configuration

```
packages/config/
├── eslint/
│   ├── base.js              # Shared flat config (ESLint 9, JSX, Node globals, import/order)
│   ├── next.js              # Next.js Web-specific additions
│   └── react-native.js      # React Native-specific additions
├── prettier/
│   └── index.js             # Prettier config
├── index.js                 # Main export (CommonJS)
└── package.json
```

### packages/types - Shared Type Helpers

```
packages/types/
├── src/
│   └── index.js             # JSDoc-annotated runtime type helpers (ESM)
└── package.json
```

**Key Exports (JSDoc-annotated shape documentation):**

- `uuid(value)` - Identity helper so API contracts expose an explicit UUID field
- `ApiResponse`, `ApiError`, `PaginatedResponse` - Standard API response/error/pagination shapes (documented in JSDoc)
- `PaginationParams`, `HealthCheckResponse`, `User`, `AuthSession` shapes
- `LoginInput`, `SignupInput`, `Environment`, `LogEntry`, `AppConfig` shapes
- `AiProviderName`, `AiConfig` - AI provider/model configuration shapes
- `LearningQuestion`, `LearningResponse`, `LearningResponseSection`, `LearningSectionType` - AI Tutor request/response contract
- `VisualLearning`, `VisualLearningNode`, `VisualLearningEdge`, `VisualLearningType`, plus optional `visualLearning`/`relatedConcepts`/`nextLearning` on `LearningResponse` - Phase 6 learning-experience enrichment
- `PracticeQuestionType`, `PracticeDifficulty`, `PracticeQuestionMode`, `PracticeConfig`, `PracticeQuestion`, `PracticeSet`, `PracticeAnswerInput`, `PracticeEvaluation`, `PracticeQuestionResult`, `PracticeResult` - Phase 7 practice/quiz/assessment contract
- `LearningActivity`, `ActivitySource`, `RecentActivityItem`, `ProgressSummary`, `MasteryState`, `TopicProgress`, `SuggestionKind`, `NextLearningSuggestion`, `PracticeSessionSummary`, `PracticeHistoryResultRow`, `PracticeSessionDetail` - Phase 8 progress/mastery/personalization contract

### packages/design-tokens - Shared Design Tokens

```
packages/design-tokens/
├── src/
│   └── index.js             # Design token definitions (CommonJS, loaded by Tailwind via require)
└── package.json
```

**Key Exports:**

- `colors` - Light/dark color token sets (surfaces, text, brand, semantic)
- `spacing` - Spacing scale
- `borderRadius` - Corner radius tokens
- `shadows` - Elevation shadow tokens
- `typography` - Font families, weights, sizes, line heights
- `iconSizes`, `componentSizes`, `breakpoints`, `zIndex`, `transitions`
- `designTokens` - Aggregated token bundle

### packages/shared - Shared Utilities & Validation

```
packages/shared/
├── src/
│   ├── validation.js        # Zod schemas & helpers
│   └── index.js             # Main export (ESM)
└── package.json
```

**Key Exports:**

- `uuidSchema` - UUID validation
- `paginationParamsSchema` - Pagination validation
- `emailSchema`, `passwordSchema`, `nameSchema` - Auth validation
- `loginSchema`, `signupSchema` - Signup/login form schemas (shared client + server)
- `learningQuestionSchema` - AI Tutor question validation (trim, 2-1000 chars)
- `environmentSchema`, `logLevelSchema` - Runtime env/log validation
- `practiceConfigSchema`, `practiceAnswerSchema`, `practiceCompleteSchema`, `practiceDifficultySchema`, `practiceQuestionTypeSchema`, `practiceQuestionModeSchema` - Practice/quiz request validation
- `progressHistoryLimitSchema`, `practiceSessionIdParamSchema` - Progress history query/path validation
- `createApiResponse()` - Success response helper
- `createApiError()` - Error response helper
- `createPaginatedResponse()` - Pagination helper
- `cn()` - Class name utility (re-exported in apps)

## Documentation

```
docs/
├── architecture.md          # System architecture
├── development-guide.md     # Development workflows
├── phase-3-final-report.md  # Phase 3 (Authentication) delivery report
├── phase-4-final-report.md  # Phase 4 (Student Home & Navigation) delivery report
├── phase-5-final-report.md  # Phase 5 (AI Tutor / Learning Intelligence) delivery report
├── phase-6-final-report.md  # Phase 6 (Learning Experience & Interactive Learning) delivery report
├── phase-7-final-report.md  # Phase 7 (Practice, Quiz & Assessment Foundation) delivery report
├── phase-8-final-report.md  # Phase 8 (Progress, Mastery & Personalization) delivery report
├── phase-9-final-report.md  # Phase 9 (Observability, Reliability & Security) delivery report
├── phase-10-final-report.md # Phase 10 (Production Readiness, RAG & Personalization) delivery report
├── phase-11-final-report.md # Phase 11 (TypeScript → JavaScript migration) delivery report
└── project-structure.md     # This file
```

## Configuration Files

### Root Configuration

| File                  | Purpose                                                 |
| --------------------- | ------------------------------------------------------- |
| `package.json`        | Workspace scripts, devDependencies                      |
| `pnpm-workspace.yaml` | Workspace package patterns                              |
| `.env.example`        | Environment variable template                           |
| `.gitignore`          | Git ignore patterns                                     |
| `Dockerfile`          | Production API container (`node apps/api/src/index.js`) |
| `docker-compose.yml`  | Postgres 18 (host port 5433) + API (3001)               |

### Per-Package Configuration

Each package has:

- `package.json` - Dependencies, scripts (`api`, `shared`, `types`, `design-tokens` are `"type": "module"`; `config` is CommonJS)
- No `tsconfig.json` anywhere - this is a JavaScript-only repository
- `eslint.config.js` - ESLint flat configuration (extends @novilearn/config)

## Dependency Graph

```
                    ┌─────────────────┐
                    │  @novilearn/config  │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│ @novilearn/   │    │ @novilearn/   │    │ @novilearn/   │
│ types         │    │ shared        │    │ design-tokens │
└───────┬───────┘    └───────┬───────┘    └───────┬───────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             ▼
                    ┌─────────────────┐
                    │  apps/*         │
                    │ (api, web,      │
                    │  mobile)        │
                    └─────────────────┘
```

## Import Patterns

### Within Apps

```js
// Web - absolute imports via jsconfig paths ("@/" → "./src")
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Mobile - relative imports only (Metro resolves extensionless)

// Shared packages - workspace protocol
import { uuid } from "@novilearn/types";
import { createApiResponse, emailSchema } from "@novilearn/shared";
```

### Within Shared / API Packages (Node ESM)

```js
// Node ESM requires explicit file extensions for relative imports:
import { config } from "../config.js";
import { AppError } from "../../errors.js";

// shared -> zod + types
import { emailSchema } from "./validation.js";
```

## File Naming Conventions

| Type            | Convention       | Example                                |
| --------------- | ---------------- | -------------------------------------- |
| Components      | PascalCase       | `Button.jsx`, `UserCard.jsx`           |
| Hooks           | camelCase + use  | `useAuth.js`, `useQuery.js`            |
| Utilities       | camelCase        | `utils.js`, `dateHelpers.js`           |
| Constants       | UPPER_SNAKE_CASE | `API_ENDPOINTS.js`                     |
| Pages (Next.js) | lowercase        | `page.jsx`, `layout.jsx`               |
| Routes (Expo)   | lowercase        | `index.jsx`, `settings.jsx`            |
| API modules     | dot-suffix       | `auth.routes.js`, `auth.controller.js` |

## Future Expansion

### Planned Directories

```
apps/api/src/
├── routes/              # API route handlers
├── middleware/          # Auth, validation, error handling
├── services/            # Business logic layer
├── repositories/        # Data access layer
├── validators/          # Request validation
└── types/               # API-specific types

apps/web/src/
├── app/(auth)/          # Auth route group
├── app/(dashboard)/     # Dashboard route group
├── app/api/             # API routes (if needed)
├── components/features/ # Feature-specific components
├── hooks/               # Custom hooks
├── stores/              # Zustand stores
└── types/               # Web-specific types

apps/mobile/src/
├── app/(tabs)/          # Tab navigation
├── app/(auth)/          # Auth screens
├── components/          # Shared components
├── hooks/               # Custom hooks
├── stores/              # Zustand stores
└── types/               # Mobile-specific types

packages/
├── ui/                  # Shared UI components (future)
├── api-client/          # Generated API client (future)
└── testing/             # Test utilities (future)
```

## Git Ignore Patterns

Key ignores:

- `node_modules/`
- `dist/`, `build/`, `.next/`, `.expo/`
- `.turbo/`
- `next-env.d.ts`, `expo-env.d.ts`, `nativewind-env.d.ts` (generated stubs)
- `.env*`
- `.DS_Store`, `*.log`
- `coverage/`
- `prisma/migrations/` (version-controlled behind negation rule)
