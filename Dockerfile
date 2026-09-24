# syntax=docker/dockerfile:1

# Monorepo runtime: installs workspace dependencies and runs the API in
# production mode (plain `node apps/api/src/index.js`; the API runs directly
# from source, so no compile step is needed).
FROM node:24-bookworm-slim AS runner

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

# Prisma's runtime engines need OpenSSL; bookworm-slim does not ship it.
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

RUN corepack enable

WORKDIR /app

COPY . .

# Install everything (NODE_ENV is NOT production here so workspace devDeps such
# as the `prisma` CLI are available for migrations), then bake a generated
# Prisma client into the image.
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
  pnpm install --frozen-lockfile

RUN pnpm --filter=@novilearn/api db:generate

ENV NODE_ENV=production

EXPOSE 3001

# Liveness check against the Node API (slim image has no curl/wget).
HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://localhost:3001/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "apps/api/src/index.js"]