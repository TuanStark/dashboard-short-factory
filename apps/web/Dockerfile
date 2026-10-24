# syntax=docker/dockerfile:1

# ---------------------------------------------------------
# Builder stage: Build React SPA bundle
# ---------------------------------------------------------
FROM node:22-alpine AS builder
RUN apk add --no-cache libc6-compat
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Copy dependency specifications
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/contracts/package.json ./packages/contracts/
COPY packages/tsconfig/base.json ./packages/tsconfig/
COPY apps/web/package.json ./apps/web/

RUN pnpm install --frozen-lockfile

# Copy packages and web application code
COPY packages/ ./packages/
COPY apps/web/ ./apps/web/

# Build shared contracts
RUN pnpm --filter "@short-factory/contracts" build

# Build argument for frontend API target (can be overridden at build time)
ARG VITE_API_BASE_URL=""
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Build production bundle
RUN pnpm --filter "@short-factory/web" build

# ---------------------------------------------------------
# Production Runner stage: Nginx
# ---------------------------------------------------------
FROM nginx:alpine AS runner

# Copy custom Nginx configuration
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from builder
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
