# syntax=docker/dockerfile:1

# ---------------------------------------------------------
# Base stage: Node.js 22 & pnpm setup
# ---------------------------------------------------------
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat openssl
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# ---------------------------------------------------------
# Dependencies stage: fetch & install workspace dependencies
# ---------------------------------------------------------
FROM base AS deps
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/contracts/package.json ./packages/contracts/
COPY packages/tsconfig/base.json ./packages/tsconfig/
COPY apps/api/package.json ./apps/api/

RUN pnpm install --frozen-lockfile

# ---------------------------------------------------------
# Builder stage: compile contracts, prisma client, and NestJS API
# ---------------------------------------------------------
FROM deps AS builder
WORKDIR /app

COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

# Build shared contracts
RUN pnpm --filter "@short-factory/contracts" build

# Generate Prisma Client (musl engine on Alpine)
RUN pnpm --filter "@short-factory/api" prisma generate

# Build NestJS API
RUN pnpm --filter "@short-factory/api" build

# Prune devDependencies to keep image lean
RUN pnpm prune --prod

# ---------------------------------------------------------
# Production Runner stage
# ---------------------------------------------------------
FROM node:22-alpine AS runner
RUN apk add --no-cache libc6-compat openssl dumb-init

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

USER node

# Copy production node_modules and built packages
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/package.json ./package.json
COPY --chown=node:node --from=builder /app/packages ./packages
COPY --chown=node:node --from=builder /app/apps/api ./apps/api

EXPOSE 4000

CMD ["dumb-init", "node", "apps/api/dist/src/main.js"]
