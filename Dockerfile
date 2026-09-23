# syntax=docker/dockerfile:1

# Monorepo runtime: installs workspace dependencies and runs the API in
# production mode (plain `node apps/api/src/index.js`; the API runs directly
# from source, so no compile step is needed).
FROM node:24-bookworm-slim AS runner

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
ENV NODE_ENV=production

RUN corepack enable

WORKDIR /app

COPY . .

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
  pnpm install --frozen-lockfile

EXPOSE 3001

CMD ["node", "apps/api/src/index.js"]