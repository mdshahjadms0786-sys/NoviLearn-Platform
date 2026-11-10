# NoviLearn 🎓⚡

> **An Open-Source, Extensible AI Learning Platform for Students and Developers.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D22.0.0-green.svg)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-%3E%3D11.4.0-orange.svg)](https://pnpm.io/)
[![CI Status](https://github.com/mdshahjadms0786-sys/NoviLearn-Platform/actions/workflows/ci.yml/badge.svg)](.github/workflows/ci.yml)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

NoviLearn is a modern, modular, self-hostable learning platform designed to help students master complex concepts through multi-modal AI explanations, interactive study sessions, and structured practice. Built with a production-grade monorepo architecture, NoviLearn empowers developers to customize learning pipelines, add custom AI providers, and deploy private learning hubs for schools, universities, and coding bootcamps.

---

## 🌟 Key Features

- 🧠 **Adaptive Multi-Mode AI Engine**:
  - **Simple**: High-level, jargon-free explanations for beginners.
  - **Detailed**: In-depth breakdowns, underlying scientific mechanisms, and technical formulations.
  - **Example**: Concrete real-world scenarios, case studies, and analogies.
  - **Visual**: Structured ASCII diagrams and process flowcharts.
  - **Exam Prep**: Key exam takeaways, scoring criteria, and high-frequency quiz questions.
  - **Hinglish**: Natural bilingual explanation mode tailored for South Asian students.
- 🔌 **Pluggable AI Architecture**: Freedom from vendor lock-in. Switch effortlessly between **Google Gemini (1.5 Flash)**, **OpenAI (GPT-4o)**, **Anthropic Claude**, or a built-in offline educational fallback engine.
- 📚 **Comprehensive Student Workspace**:
  - Multi-session history with automatic context preservation.
  - Intelligent follow-up recommendations to deepen understanding.
  - Notes, flashcards, diagnostic practice quizzes, and progress analytics.
- 🎨 **Unified Design System**: Built with `@novilearn/design-tokens`, Tailwind CSS, and Radix UI / shadcn patterns, featuring complete light and dark theme support.
- 🚀 **Frictionless Self-Hosting**: Run anywhere with Docker Compose, minimal dependencies, and clean environment variable configuration.

---

## 🏗️ Architecture & Monorepo Structure

```text
NoviLearn/
├── apps/
│   ├── api/             # Express REST API (Node.js ESM, Prisma ORM, AI Service)
│   ├── web/             # Next.js 15 Web Application (React 18, Tailwind, shadcn/ui)
│   └── mobile/          # React Native & Expo cross-platform mobile client
├── packages/
│   ├── config/          # Shared ESLint and Prettier configurations
│   ├── design-tokens/   # Design system tokens (colors, typography, spacing)
│   ├── shared/          # Shared validation schemas (Zod) and business helpers
│   └── types/           # Shared runtime type assertions and JSDoc types
├── docs/                # Comprehensive technical and architectural guides
├── .github/             # CI workflows, issue templates, and PR templates
├── docker-compose.yml   # Multi-service container orchestration
└── package.json         # Workspace orchestration scripts
```

```text
       [ Next.js 15 Web (:3000) ]       [ Expo Mobile App ]
                   \                         /
                    \                       /
                     ▼                     ▼
             [ Express REST Backend API (:3001) ]
                 |                       |
                 |                       +---> [ Pluggable AI Service ]
                 |                                 ├── Google Gemini (1.5 Flash)
                 |                                 ├── OpenAI (GPT-4o)
                 |                                 ├── Anthropic Claude
                 |                                 └── Offline Fallback Engine
                 ▼
       [ PostgreSQL Database (:5432) ]
              (via Prisma ORM)
```

---

## 🚀 Quickstart

### Prerequisites

- **Node.js**: `>= 22.0.0`
- **pnpm**: `>= 11.4.0`
- **PostgreSQL**: `>= 15.0` (or run via Docker)

### 1. Clone & Install

```bash
git clone https://github.com/mdshahjadms0786-sys/NoviLearn-Platform.git
cd NoviLearn
pnpm install
```

### 2. Configure Environment

Copy the example environment configuration:

```bash
cp .env.example .env
```

Set your database credentials and preferred AI provider in `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/novilearn?schema=public"
AI_PROVIDER="gemini"
GEMINI_API_KEY="your-gemini-api-key"
```

> **Note:** If no AI key is specified, NoviLearn automatically activates its **built-in offline educational engine**, allowing you to test and develop with zero cloud costs!

### 3. Initialize Database

```bash
# Generate Prisma Client
pnpm db:generate

# Push schema migrations to PostgreSQL
pnpm db:push
```

### 4. Run Development Servers

```bash
# Start Web and API concurrently:
pnpm dev:all

# Services will be available at:
# Web Client:  http://localhost:3000
# Backend API: http://localhost:3001/api/v1/health
```

---

## 🐳 Docker Deployment

To spin up NoviLearn and PostgreSQL using Docker:

```bash
docker compose up -d
```

The database container will start on port `5432`, and the backend and frontend services will link automatically.

---

## 🤖 Configuring AI Providers

NoviLearn's provider registry (`apps/api/src/ai/providers/`) makes adding or switching models effortless:

| Provider                      | Environment Variables                              | Supported Models                      |
| ----------------------------- | -------------------------------------------------- | ------------------------------------- |
| **Google Gemini** _(Default)_ | `AI_PROVIDER=gemini`<br>`GEMINI_API_KEY=...`       | `gemini-1.5-flash`, `gemini-1.5-pro`  |
| **OpenAI**                    | `AI_PROVIDER=openai`<br>`OPENAI_API_KEY=...`       | `gpt-4o`, `gpt-4o-mini`               |
| **Anthropic**                 | `AI_PROVIDER=anthropic`<br>`ANTHROPIC_API_KEY=...` | `claude-3-5-sonnet`                   |
| **Offline Fallback**          | `AI_PROVIDER=offline`                              | Built-in heuristic pedagogical engine |

---

## 🛠️ Developer Scripts

| Command             | Description                                   |
| ------------------- | --------------------------------------------- |
| `pnpm dev:all`      | Runs API (:3001) and Web (:3000) concurrently |
| `pnpm dev`          | Starts Express API development server         |
| `pnpm dev:web`      | Starts Next.js web application                |
| `pnpm dev:mobile`   | Starts Expo React Native bundler              |
| `pnpm build`        | Builds all applications and packages          |
| `pnpm lint`         | Runs ESLint across all workspaces             |
| `pnpm format`       | Formats the codebase using Prettier           |
| `pnpm format:check` | Verifies code formatting compliance in CI     |
| `pnpm db:generate`  | Regenerates Prisma Client                     |
| `pnpm db:push`      | Synchronizes Prisma schema with database      |
| `pnpm db:studio`    | Launches visual Prisma Studio interface       |

---

## 🧪 Testing & Code Quality

NoviLearn maintains strict quality standards backed by automated CI:

```bash
# Run linting
pnpm run lint

# Check code formatting
pnpm run format:check

# Run automated tests
pnpm run test
```

All pull requests trigger automated GitHub Actions checking linting, formatting, type definitions, and test suites across multiple Node.js environments.

---

## 🗺️ Roadmap & Future Horizons

See our full [ROADMAP.md](ROADMAP.md) for details on upcoming features:

- **Phase 3**: Socratic Questioning Mode & Multi-Modal Document RAG (PDF/Textbook ingestion).
- **Phase 4**: Spaced Repetition (FSRS/SM-2) Flashcard scheduling & Knowledge Graph.
- **Phase 5**: 1-Click Cloud Run / Railway deploy & local model support (Ollama / vLLM).

---

## 🤝 Contributing

We warmly welcome contributions from the community! Whether you are fixing a typo, adding a new AI provider, or creating UI components:

1. Read our [Contributing Guide](CONTRIBUTING.md).
2. Follow our [Code of Conduct](CODE_OF_CONDUCT.md).
3. Check open issues labeled `good first issue` or `help wanted`.

---

## 🔒 Security

For responsible vulnerability reporting, please review our [Security Policy](SECURITY.md).

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
