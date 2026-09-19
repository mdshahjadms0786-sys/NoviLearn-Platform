# Development Guide

## Getting Started

### Prerequisites

- Node.js >= 22.0.0
- pnpm >= 11.4.0
- PostgreSQL >= 15
- Git

### Initial Setup

```bash
# Clone and navigate
cd NoviLearn

# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env

# Edit .env with your local configuration
# Required: DATABASE_URL

# Generate Prisma client
pnpm db:generate

# Push database schema
pnpm db:push

# Start development servers
pnpm dev:all
```

## Daily Development Workflow

### Starting Development

```bash
# Option 1: All services at once
pnpm dev:all

# Option 2: Individual terminals
# Terminal 1 - API
pnpm dev

# Terminal 2 - Web
pnpm dev:web

# Terminal 3 - Mobile
pnpm dev:mobile
```

### Making Changes

#### Shared Types (@novilearn/types)

```bash
# Edit packages/types/src/index.ts
# Changes automatically available in all apps after rebuild
pnpm --filter=@novilearn/types typecheck
```

#### Shared Validation (@novilearn/shared)

```bash
# Edit packages/shared/src/validation.ts
# Changes automatically available in all apps
pnpm --filter=@novilearn/shared typecheck
pnpm --filter=@novilearn/shared lint
```

#### Configuration (@novilearn/config)

```bash
# Edit configs in packages/config/
# All apps inherit changes automatically
```

#### API (apps/api)

```bash
# Edit apps/api/src/
# Auto-reloads with tsx watch
pnpm --filter=@novilearn/api dev
```

#### Web (apps/web)

```bash
# Edit apps/web/src/
# Hot reload with Next.js
pnpm --filter=@novilearn/web dev
```

#### Mobile (apps/mobile)

```bash
# Edit apps/mobile/src/
# Fast refresh with Expo
pnpm --filter=@novilearn/mobile dev
```

## Code Quality

### Linting

```bash
# Lint all packages
pnpm lint

# Fix auto-fixable issues
pnpm lint:fix

# Lint specific package
pnpm --filter=@novilearn/web lint
```

### Type Checking

```bash
# Type check all packages
pnpm typecheck

# Type check specific package
pnpm --filter=@novilearn/api typecheck
```

### Formatting

```bash
# Format all files
pnpm format

# Check formatting
pnpm format:check
```

### Pre-commit Hooks

Husky runs on commit:

- Lint staged files
- Format staged files
- Type check (if configured)

## Database Management

### Schema Changes

```bash
# Edit apps/api/prisma/schema.prisma

# Generate Prisma client
pnpm db:generate

# Push changes to database (development)
pnpm db:push

# Create migration (production)
pnpm db:migrate
```

### Prisma Studio

```bash
# Open database GUI
pnpm db:studio
```

### Seeding (Future)

```bash
# pnpm db:seed
```

## Environment Variables

### Required for Development

| Variable            | Description                                | Example                                           |
| ------------------- | ------------------------------------------ | ------------------------------------------------- |
| DATABASE_URL        | PostgreSQL connection string               | `postgresql://user:pass@localhost:5432/novilearn` |
| JWT_SECRET          | JWT signing secret (min 32 chars)          | `your-super-secret-jwt-key-change-in-production`  |
| JWT_EXPIRES_IN      | JWT lifetime                               | `7d`                                              |
| PORT                | API server port                            | `3001`                                            |
| NODE_ENV            | Environment                                | `development`                                     |
| API_URL             | Public API base URL                        | `http://localhost:3001`                           |
| WEB_URL             | Web app origin (CORS allowlist)            | `http://localhost:3000`                           |
| NEXT_PUBLIC_API_URL | Web API base URL (browser)                 | `http://localhost:3001`                           |
| EXPO_PUBLIC_API_URL | Mobile API base URL (use LAN IP on device) | `http://localhost:3001`                           |

### Optional (Future Phases)

| Variable       | Description                      |
| -------------- | -------------------------------- |
| OPENAI_API_KEY | OpenAI API key                   |
| AWS_*          | AWS credentials for file storage |

### Testing Authentication

```bash
# Create an account
curl -X POST http://localhost:3001/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Ada\",\"email\":\"ada@example.com\",\"password\":\"supersecret1\",\"confirmPassword\":\"supersecret1\"}"

# Sign in (returns user + token)
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"ada@example.com\",\"password\":\"supersecret1\"}"

# Fetch the current user with a Bearer token
curl http://localhost:3001/auth/me \
  -H "Authorization: Bearer <token>"

# Log out (invalidates the token)
curl -X POST http://localhost:3001/auth/logout \
  -H "Authorization: Bearer <token>"
```

## Testing (Future)

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Coverage
pnpm test:coverage
```

## Building for Production

```bash
# Build all apps
pnpm build

# Build specific app
pnpm build:web
pnpm build:api
pnpm build:mobile
```

## Debugging

### API Debugging

- API runs on `http://localhost:3001`
- Health check: `http://localhost:3001/health`
- Logs output to console with morgan

### Web Debugging

- Web runs on `http://localhost:3000`
- React DevTools supported
- Next.js debugging in VS Code

### Mobile Debugging

- Expo DevTools at `http://localhost:8081`
- React Native Debugger supported
- Flipper for advanced debugging

## Common Issues

### Port Conflicts

```bash
# Check what's using ports
lsof -i :3000  # Web
lsof -i :3001  # API
lsof -i :8081  # Expo
```

### Database Connection

```bash
# Verify PostgreSQL is running
pg_isready

# Check connection
psql $DATABASE_URL -c "SELECT 1"
```

### Dependency Issues

```bash
# Clean install
pnpm clean
pnpm install

# Clear Turbo cache
rm -rf .turbo
```

### Type Errors After Shared Package Changes

```bash
# Rebuild shared packages
pnpm --filter=@novilearn/types build
pnpm --filter=@novilearn/shared build
pnpm --filter=@novilearn/config build

# Restart TypeScript server in IDE
# VS Code: Cmd+Shift+P -> "TypeScript: Restart TS Server"
```

## Git Workflow

### Branching

- `main` - Production ready
- `develop` - Integration branch
- `feature/*` - Feature branches
- `fix/*` - Bug fixes
- `chore/*` - Maintenance

### Commits

Follow conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code restructuring
- `test:` Tests
- `chore:` Maintenance

### Pre-push

```bash
# Run before pushing
pnpm lint
pnpm typecheck
pnpm format:check
```

## Adding New Packages

### Shared Package

```bash
# Create directory
mkdir -p packages/new-package/src

# Create package.json with workspace dependencies
# Add to pnpm-workspace.yaml if needed
# Import in apps via @novilearn/new-package
```

### App Package

```bash
# Create under apps/
# Follow existing patterns
# Add to pnpm-workspace.yaml
```

## VS Code Configuration

Recommended extensions:

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Prisma
- Expo Tools
- TypeScript Hero

Settings (`.vscode/settings.json`):

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## Performance Tips

- Use `pnpm dev:all` for concurrent development
- Enable Turbo caching: `turbo run build --cache-dir=.turbo`
- Use `--filter` to run commands on specific packages
- Share node_modules via pnpm workspace hoisting

## Troubleshooting

### "Cannot find module @novilearn/..."

```bash
# Ensure packages are built
pnpm --filter=@novilearn/types build
pnpm --filter=@novilearn/shared build
pnpm --filter=@novilearn/config build

# Restart TS server in IDE
```

### Prisma Client Out of Sync

```bash
pnpm db:generate
pnpm db:push
```

### Expo Cache Issues

```bash
pnpm --filter=@novilearn/mobile clean
pnpm --filter=@novilearn/mobile dev --clear
```

### Next.js Cache Issues

```bash
pnpm --filter=@novilearn/web clean
pnpm --filter=@novilearn/web dev
```
