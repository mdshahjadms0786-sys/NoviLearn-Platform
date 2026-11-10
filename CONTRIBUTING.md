# Contributing to NoviLearn

Thank you for your interest in contributing to **NoviLearn**! NoviLearn is an open-source, AI-powered learning platform designed for students and developers worldwide. We welcome contributions of all kinds: bug fixes, new features, UI enhancements, documentation improvements, and AI model integrations.

---

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please treat all contributors with respect and kindness.

---

## Table of Contents

- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Monorepo Architecture](#monorepo-architecture)
- [Branching & Commit Guidelines](#branching--commit-guidelines)
- [Testing & Quality Checks](#testing--quality-checks)
- [Pull Request Process](#pull-request-process)
- [Reporting Security Issues](#reporting-security-issues)

---

## How Can I Contribute?

1. **Report Bugs**: Use our [Bug Report Template](.github/ISSUE_TEMPLATE/bug_report.md) to report reproducible defects.
2. **Suggest Features**: Submit an idea using our [Feature Request Template](.github/ISSUE_TEMPLATE/feature_request.md).
3. **Submit Code**: Pick an existing open issue or propose an improvement, create a branch, write clean code with tests, and open a PR.
4. **Improve Documentation**: Enhance guides, clarify setups, or add examples for self-hosters.
5. **Add AI Providers**: NoviLearn features a pluggable AI provider architecture (`apps/api/src/ai/providers`). You can integrate local LLMs (e.g., Ollama, vLLM) or other cloud model providers!

---

## Development Setup

### Prerequisites

- **Node.js**: `>= 22.0.0`
- **pnpm**: `>= 11.4.0`
- **PostgreSQL**: `>= 15.0` (or run via Docker)
- **Git**

### Step-by-Step Installation

1. **Fork and Clone the Repository**

   ```bash
   git clone https://github.com/mdshahjadms0786-sys/NoviLearn-Platform.git
   cd NoviLearn-Platform
   ```

2. **Install Dependencies**

   ```bash
   pnpm install
   ```

3. **Configure Environment Variables**

   ```bash
   cp .env.example .env
   ```

   Configure your PostgreSQL connection string and any AI provider keys (e.g. `GEMINI_API_KEY`, `OPENAI_API_KEY`). If no API key is provided, NoviLearn falls back to its built-in offline educational engine.

4. **Initialize Database**

   ```bash
   pnpm db:generate
   pnpm db:push
   ```

5. **Start Development Servers**
   ```bash
   # Start Web (:3000) and API (:3001) simultaneously
   pnpm dev:all

   # Or run individually:
   pnpm dev       # Express API
   pnpm dev:web   # Next.js Web App
   ```

---

## Monorepo Architecture

NoviLearn is structured as a pnpm workspace monorepo:

```text
NoviLearn/
├── apps/
│   ├── api/            # Express REST API (Node.js ESM, Prisma ORM)
│   ├── web/            # Next.js 15 Web Application (React 18, Tailwind, shadcn/ui)
│   └── mobile/         # React Native / Expo application
├── packages/
│   ├── config/         # Shared ESLint & Prettier configurations
│   ├── design-tokens/  # Brand styling tokens, typography, palettes
│   ├── shared/         # Shared validators (Zod) and business utilities
│   └── types/          # Shared runtime type guards and JSDoc specs
└── docs/               # Technical architecture and developer guides
```

---

## Branching & Commit Guidelines

### Branch Naming

Use descriptive branch names with appropriate prefixes:

- `feature/add-socratic-mode`
- `fix/learning-experience-crash`
- `docs/update-self-hosting-guide`
- `refactor/ai-provider-pipeline`

### Conventional Commits

We follow the [Conventional Commits specification](https://www.conventionalcommits.org/):

- `feat:` A new user-facing feature
- `fix:` A bug fix
- `docs:` Documentation-only changes
- `style:` Formatting, whitespace, semicolon changes (no production code change)
- `refactor:` Code restructuring without behavioral change
- `test:` Adding or updating tests
- `chore:` Dependency bumps, CI updates, configuration tweaks

_Example:_ `feat(ai): add streaming support for gemini 1.5 flash provider`

---

## Testing & Quality Checks

Before committing or opening a pull request, run all verification checks locally:

```bash
# 1. Format code with Prettier
pnpm run format

# 2. Check formatting compliance
pnpm run format:check

# 3. Lint all packages and apps
pnpm run lint

# 4. Run automated test suites
pnpm run test
```

---

## Pull Request Process

1. Ensure all CI checks (linting, formatting, test suites) pass locally.
2. Keep PRs focused on a single responsibility; split large overhauls into smaller, reviewable PRs.
3. Update relevant documentation in `docs/` or `README.md` if user-facing behavior or environment variables changed.
4. Fill out the [Pull Request Template](.github/PULL_REQUEST_TEMPLATE.md) completely with screenshots or test verification commands.
5. Maintainers will review your PR, offer constructive feedback, and merge once approved.

---

## Reporting Security Issues

Please **do not** open public GitHub issues for security vulnerabilities. Instead, refer to our [Security Policy](SECURITY.md) for instructions on confidential disclosure.
