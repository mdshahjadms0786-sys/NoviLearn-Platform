# NoviLearn

AI-powered learning platform for students.

## Overview

NoviLearn is a scalable learning platform built with a modern tech stack:

- **Web**: Next.js 15, React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Mobile**: Expo, React Native, NativeWind, React Native Paper
- **API**: Express, TypeScript, Prisma ORM, PostgreSQL
- **Shared**: Types, validation schemas, utilities

## Project Structure

```
NoviLearn/
├── apps/
│   ├── api/          # Express backend API
│   ├── web/          # Next.js web application
│   └── mobile/       # Expo React Native application
├── packages/
│   ├── config/       # Shared ESLint, Prettier, TypeScript configs
│   ├── types/        # Shared TypeScript types
│   ├── shared/       # Shared utilities, validation (Zod)
│   └── design-tokens # Shared design tokens (colors, spacing, typography)
├── docs/
│   ├── architecture.md
│   ├── development-guide.md
│   └── project-structure.md
├── .env.example
├── .gitignore
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

## Getting Started

### Prerequisites

- Node.js >= 22.0.0
- pnpm >= 11.4.0
- PostgreSQL >= 15

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Generate Prisma client
pnpm db:generate

# Push database schema
pnpm db:push
```

### Development

```bash
# Start all services
pnpm dev:all

# Or start individually:
pnpm dev        # API (port 3001)
pnpm dev:web    # Web (port 3000)
pnpm dev:mobile # Mobile (Expo)
```

### Commands

| Command | Description |
|---------|-------------|
| `pnpm install` | Install all dependencies |
| `pnpm dev` | Start API server |
| `pnpm dev:web` | Start web dev server |
| `pnpm dev:mobile` | Start Expo dev server |
| `pnpm dev:all` | Start all dev servers |
| `pnpm build` | Build all apps |
| `pnpm lint` | Lint all packages |
| `pnpm lint:fix` | Fix lint issues |
| `pnpm typecheck` | Type check all packages |
| `pnpm format` | Format code with Prettier |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:push` | Push schema to database |
| `pnpm db:studio` | Open Prisma Studio |

## Design System

A shared design system powers both the web and mobile apps:

- **Design tokens**: `@novilearn/design-tokens` package (colors, spacing, typography, shadows, component sizes, breakpoints, z-index, transitions)
- **Web components**: Radix UI + shadcn/ui patterns in `apps/web/src/components/ui/` (Button, Input, Card, Dialog, Select, Tabs, Accordion, Toast, DropdownMenu, Avatar, Tooltip, badges, alerts, progress, states, navigation, etc.)
- **Mobile components**: React Native primitives in `apps/mobile/src/components/ui/` (Button, Input, Card, Modal, Badge, Progress, Skeleton, states, layout containers, etc.)
- **Showcase**: Browse web components at `http://localhost:3000/design-system`; the mobile home screen renders the mobile showcase

## Architecture

See [docs/architecture.md](docs/architecture.md) for detailed architecture documentation.

## Development Guide

See [docs/development-guide.md](docs/development-guide.md) for development workflows and conventions.

## Project Structure

See [docs/project-structure.md](docs/project-structure.md) for detailed project structure.

## Tech Stack

### Web
- Next.js 15 (App Router)
- React 18
- TypeScript 5
- Tailwind CSS 3
- shadcn/ui (Radix UI primitives)
- TanStack Query 5
- Zustand 5
- React Hook Form 7 + Zod

### Mobile
- Expo 52
- React Native 0.76
- NativeWind 4 (Tailwind for React Native)
- React Native Paper 5
- Expo Router 4
- TanStack Query 5
- Zustand 5
- React Hook Form 7 + Zod

### API
- Express 4
- TypeScript 5
- Prisma ORM 5
- PostgreSQL
- Zod validation

### Shared
- TypeScript 5
- Zod 3
- Shared types & validation

## License

MIT