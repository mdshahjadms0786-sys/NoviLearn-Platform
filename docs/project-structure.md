# Project Structure

## Root Level

```
NoviLearn/
├── apps/                    # Applications (deployable units)
├── packages/                # Shared packages (libraries)
├── docs/                    # Documentation
├── .env.example             # Environment variable template
├── .gitignore               # Git ignore rules
├── package.json             # Root package.json with workspace scripts
├── pnpm-workspace.yaml      # pnpm workspace configuration
├── pnpm-lock.yaml           # Lockfile
└── README.md                # Project overview
```

## Applications

### apps/api - Express Backend API

```
apps/api/
├── src/
│   ├── index.ts             # Entry point, Express app setup, error handler, /auth + /ai + /practice router mounts
│   ├── config.ts            # Environment-derived config (port, urls, jwt, ai)
│   ├── env.ts               # .env loader + zod schema validation
│   ├── prisma.ts            # Prisma Client singleton
│   ├── errors.ts            # AppError class
│   ├── ai/
│   │   ├── ai.types.ts      # Provider/LM interfaces + AI completion input types
│   │   ├── ai.service.ts    # AI orchestration (config guard → provider → normalize) + shared completion helper
│   │   ├── normalizer.ts    # Provider JSON → shared LearningResponse normalization
│   │   ├── prompts/
│   │   │   ├── system.ts    # System prompt + tutor message builder
│   │   │   └── practice.ts  # Practice question generation prompt + message builder
│   │   └── providers/
│   │       ├── openai.provider.ts # OpenAI chat-completions via fetch
│   │       └── index.ts     # Provider registry/factory
│   ├── practice/
│   │   ├── practice.types.ts    # Internal practice session types + payload mappers
│   │   ├── practice.service.ts  # Generation, answer scoring, session completion
│   │   ├── practice.normalizer.ts # Provider JSON → internal questions normalization
│   │   ├── evaluator.ts     # Answer evaluation (mcq / true-false / short answer)
│   │   ├── session-store.ts # In-memory ephemeral session store (60-min TTL, per-user cap)
│   │   └── text.ts          # Answer/text normalization helpers
│   ├── routes/
│   │   ├── auth.routes.ts   # /auth routes
│   │   ├── ai.routes.ts     # /ai routes (learn endpoint + protection middleware)
│   │   └── practice.routes.ts # /practice routes (generate/answer/complete + limits)
│   ├── controllers/
│   │   ├── auth.controller.ts  # Auth request handlers
│   │   ├── ai.controller.ts    # AI request handlers
│   │   └── practice.controller.ts # Practice request handlers
│   ├── services/
│   │   └── auth.service.ts  # Business logic (signup, login, me, logout)
│   ├── middleware/
│   │   └── auth.ts          # requireAuth (JWT verification + version check)
│   ├── validators/
│   │   └── auth.ts          # Zod request validators
│   └── utils/
│       ├── async-handler.ts # Async route wrapper
│       ├── rate-limit.ts    # In-memory rate limiter (IP or custom key)
│       └── dedupe.ts        # Success-only duplicate-question guard
├── prisma/
│   └── schema.prisma        # Database schema
├── dist/                    # Compiled output (gitignored)
├── package.json
├── tsconfig.json
├── eslint.config.js
└── .env                     # Local env (gitignored)
```

### apps/web - Next.js Web Application

```
apps/web/
├── src/
│   ├── app/                 # App Router pages
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Landing page (+ authenticated redirect to /home)
│   │   ├── globals.css      # Global styles + theme tokens
│   │   ├── design-system/   # Design system showcase
│   │   ├── login/           # Sign in page
│   │   ├── signup/          # Create account page
│   │   └── (app)/           # Authenticated app shell route group
│   │       ├── layout.tsx   # ProtectedRoute + AppShell wrapper
│       │       ├── home/        # Student Home dashboard
│       │       ├── learn/       # AI Tutor page
│       │       ├── practice/    # Practice session page (config → questions → results)
│       │       ├── progress/    # Progress placeholder
│       │       └── account/     # Profile page (inside the shell)
│   ├── components/
│   │   ├── ui/              # UI component library (shadcn/ui + Radix)
│   │   ├── auth/            # Auth-shell, auth-links, authenticated-redirect
│   │   ├── layout/          # AppShell, AppHeader, Sidebar, MobileNav, SignOutButton
│   │   ├── navigation/      # Nav config + shared nav list
│   │   ├── dashboard/       # Student Home sections
│   │   ├── ai/              # AiTutor, LearningExperience, learning sections (visual/related/continue/follow-ups), QuestionForm, PracticeCta, Markdown (markdown-lite)
│   │   ├── practice/        # PracticeTutor flow + setup/question/feedback/result views
│   │   ├── placeholder/     # ComingSoon
│   │   └── protected-route.tsx  # Auth-gated route wrapper
│   ├── lib/
│   │   ├── api.ts           # Typed API client (authApi, aiApi, practiceApi)
│   │   ├── auth-store.ts    # Zustand auth store (localStorage persistence)
│   │   ├── use-auth.ts      # useAuth hook
│   │   └── utils.ts         # Utility functions (cn, etc.)
│   ├── hooks/               # Custom React hooks (future)
│   ├── types/               # Web-specific types (future)
│   └── styles/              # Additional styles (future)
├── public/                  # Static assets
├── .next/                   # Build output (gitignored)
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── eslint.config.js
└── .env                     # Local env (gitignored)
```

### apps/mobile - Expo React Native Application

```
apps/mobile/
├── src/
│   ├── app/                 # Expo Router pages
│   │   ├── index.tsx        # Student Home dashboard (inside AppShell)
│   │   ├── login.tsx        # Sign in screen
│   │   ├── signup.tsx       # Create account screen
│   │   ├── account.tsx      # Profile screen (inside AppShell)
│   │   ├── learn.tsx        # AI Tutor screen (inside AppShell)
│   │   ├── practice.tsx     # Practice session screen (inside AppShell)
│   │   └── progress.tsx     # Progress placeholder (inside AppShell)
│   ├── components/
│   │   ├── ui/              # UI component library (RN primitives)
│   │   ├── auth/            # Auth-screen, form-field
│   │   ├── layout/          # AppShell, AppHeader, BottomNav
│   │   ├── dashboard/       # Student Home sections
│   │   ├── ai/              # AiTutor, LearningExperience, learning sections (visual/related/continue/follow-ups), QuestionForm, PracticeCta, MarkdownText (markdown-lite)
│   │   ├── practice/        # PracticeFlow + setup/question/feedback/result views
│   │   ├── placeholder/     # ComingSoon
│   │   ├── require-auth.tsx # Auth-gated wrapper
│   │   └── design-system-showcase.tsx  # Mobile component showcase
│   ├── lib/
│   │   ├── api.ts           # Typed API client (authApi, aiApi, practiceApi)
│   │   ├── auth-store.ts    # Zustand auth store (AsyncStorage persistence)
│   │   ├── config.ts        # Env-derived config (API_URL)
│   │   └── utils.ts         # Utility functions
│   ├── hooks/               # Custom hooks (future)
│   ├── providers.tsx        # Context providers
│   ├── theme-provider.tsx   # Theme context
│   └── types/               # Mobile-specific types (future)
├── assets/                  # Images, fonts
├── .expo/                   # Expo cache (gitignored)
├── dist/                    # Build output (gitignored)
├── package.json
├── tsconfig.json
├── app.json                 # Expo config
├── tailwind.config.js
├── global.css               # NativeWind styles
├── nativewind-env.d.ts
├── expo-env.d.ts
├── eslint.config.js
└── .env                     # Local env (gitignored)
```

## Shared Packages

### packages/config - Tooling Configuration

```
packages/config/
├── eslint/
│   ├── base.js              # Base ESLint config
│   ├── next.js              # Next.js specific config
│   └── react-native.js      # React Native specific config
├── prettier/
│   └── index.js             # Prettier config
├── typescript/
│   ├── base.json            # Base TypeScript config
│   ├── next.json            # Next.js TypeScript config
│   ├── react-native.json    # React Native TypeScript config
│   └── node.json            # Node.js TypeScript config
├── index.ts                 # Main export
├── package.json
└── tsconfig.json
```

### packages/types - Shared TypeScript Types

```
packages/types/
├── src/
│   └── index.ts             # All shared type definitions
├── dist/                    # Compiled output (gitignored)
├── package.json
└── tsconfig.json
```

**Key Types:**

- `UUID` - Branded string type for IDs
- `ApiResponse<T>` - Standard API response
- `ApiError` - Standard API error
- `PaginatedResponse<T>` - Paginated API response
- `PaginationParams` - Query parameters for pagination
- `HealthCheckResponse` - Health endpoint response
- `User` - User domain model
- `AuthSession` - `{ user, token }` returned by signup/login
- `LoginInput`, `SignupInput` - Auth form input types
- `Environment` - Environment enum
- `LogEntry` - Logging structure
- `AppConfig` - App configuration shape (now includes `ai: AiConfig`)
- `AiProviderName`, `AiConfig` - AI provider/model configuration types
- `LearningQuestion`, `LearningResponse`, `LearningResponseSection`, `LearningSectionType` - AI Tutor request/response contract
- `VisualLearning`, `VisualLearningNode`, `VisualLearningEdge`, `VisualLearningType`, plus optional `visualLearning`/`relatedConcepts`/`nextLearning` on `LearningResponse` - Phase 6 learning-experience enrichment
- `PracticeQuestionType`, `PracticeDifficulty`, `PracticeQuestionMode`, `PracticeConfig`, `PracticeQuestion`, `PracticeSet`, `PracticeAnswerInput`, `PracticeEvaluation`, `PracticeQuestionResult`, `PracticeResult` - Phase 7 practice/quiz/assessment contract

### packages/design-tokens - Shared Design Tokens

```
packages/design-tokens/
├── src/
│   └── index.ts             # Design token definitions
├── dist/                    # Compiled output (gitignored)
├── package.json
└── tsconfig.json
```

**Key Exports:**

- `colors` - Light/dark color token sets (surfaces, text, brand, semantic)
- `spacing` - Spacing scale
- `borderRadius` - Corner radius tokens
- `shadows` - Elevation shadow tokens
- `typography` - Font families, weights, sizes, line heights
- `iconSizes`, `componentSizes`, `breakpoints`, `zIndex`, `transitions`

### packages/shared - Shared Utilities & Validation

```
packages/shared/
├── src/
│   ├── validation.ts        # Zod schemas & helpers
│   └── index.ts             # Main export
├── dist/                    # Compiled output (gitignored)
├── package.json
└── tsconfig.json
```

**Key Exports:**

- `uuidSchema` - UUID validation
- `paginationParamsSchema` - Pagination validation
- `emailSchema`, `passwordSchema`, `nameSchema` - Auth validation
- `loginSchema`, `signupSchema` - Signup/login form schemas (shared client + server)
- `learningQuestionSchema` - AI Tutor question validation (trim, 2-1000 chars)
- `practiceConfigSchema`, `practiceAnswerSchema`, `practiceCompleteSchema`, `practiceDifficultySchema`, `practiceQuestionTypeSchema`, `practiceQuestionModeSchema` - Practice/quiz request validation
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
└── project-structure.md     # This file
```

## Configuration Files

### Root Configuration

| File                  | Purpose                            |
| --------------------- | ---------------------------------- |
| `package.json`        | Workspace scripts, devDependencies |
| `pnpm-workspace.yaml` | Workspace package patterns         |
| `.env.example`        | Environment variable template      |
| `.gitignore`          | Git ignore patterns                |

### Per-Package Configuration

Each package has:

- `package.json` - Dependencies, scripts
- `tsconfig.json` - TypeScript configuration (extends @novilearn/config)
- `eslint.config.js` - ESLint configuration (extends @novilearn/config)

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

```typescript
// Web/Mobile - Absolute imports from src
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Shared packages - Workspace protocol
import type { ApiResponse, User } from "@novilearn/types";
import { createApiResponse, emailSchema } from "@novilearn/shared";
```

### Within Shared Packages

```typescript
// types -> no internal deps
// shared -> depends on types
import type { UUID, PaginationParams } from "@novilearn/types";
```

## File Naming Conventions

| Type            | Convention       | Example                      |
| --------------- | ---------------- | ---------------------------- |
| Components      | PascalCase       | `Button.tsx`, `UserCard.tsx` |
| Hooks           | camelCase + use  | `useAuth.ts`, `useQuery.ts`  |
| Utilities       | camelCase        | `utils.ts`, `dateHelpers.ts` |
| Types           | PascalCase       | `User.ts`, `ApiResponse.ts`  |
| Constants       | UPPER_SNAKE_CASE | `API_ENDPOINTS.ts`           |
| Pages (Next.js) | lowercase        | `page.tsx`, `layout.tsx`     |
| Routes (Expo)   | lowercase        | `index.tsx`, `settings.tsx`  |

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
- `*.tsbuildinfo`
- `.env*`
- `.DS_Store`, `*.log`
- `coverage/`
- `prisma/migrations/` (generated)
