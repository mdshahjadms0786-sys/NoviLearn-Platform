# syntax=docker/dockerfile:1

# Monorepo runtime: builds the workspace packages and runs the API in production
# mode (compiled apps/api/dist, executed through tsx so the workspace libs that
# resolve to their src entry points keep working).
FROM node:24-bookworm-slim AS runner

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
ENV NODE_ENV=production

RUN corepack enable

WORKDIR /app

COPY . .

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
  pnpm install --frozen-lockfile

RUN pnpm --filter=@novilearn/types build \
  && pnpm --filter=@novilearn/shared build \
  && pnpm --filter=@novilearn/api build

EXPOSE 3001

# workspaces resolve to src entry points, so compile-then-run needs the tsx loader
CMD ["node", "--import", "tsx", "apps/api/dist/index.js"]