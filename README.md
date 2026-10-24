# 🎬 AI Shorts Factory — Mission Control & REST API Control Plane

> **High-retention, multi-channel autonomous YouTube Shorts production & distribution management platform.**  
> Specification version: `2.0.0` | Architecture: **Modular Monolith (Clean Architecture)** | Package Manager: `pnpm`

---

## 🌟 System Architecture

```
                    ┌────────────────────────────────────────────────────────┐
                    │ Web Dashboard (apps/web - Port 5173)                   │
                    │ React 18, Vite, Tailwind CSS, TanStack Query, Zod       │
                    └─────────────────────────┬──────────────────────────────┘
                                              │ REST JSON / CORS
                                              ▼
┌────────────────────────────────────────────────────────────────────────────┐
│ NestJS Modular Monolith API (apps/api - Port 4000/4100)                     │
│                                                                            │
│  [ Presentation Layer ]                                                    │
│    • Controllers: Channels, Genres, Pipeline, Topics/Approval, Schedule   │
│    • DTOs with class-validator & Swagger OpenAPI                           │
│    • Centralized AllExceptionsFilter & LoggingInterceptor                  │
│                                                                            │
│  [ Application Layer ]                                                     │
│    • Orchestration Services: PipelineService, ChannelsService, Topics...  │
│                                                                            │
│  [ Domain & Security Layer ]                                               │
│    • AES-256-GCM Encryption Service for Google OAuth2 tokens at rest      │
│    • Zero-Local purge verification & Quality Control (QC) scoring engine   │
│                                                                            │
│  [ Infrastructure Layer ]                                                  │
│    • Prisma ORM 6.x                                                        │
└─────────────────────────────────────┬──────────────────────────────────────┘
                                      │
                                      ▼
             ┌──────────────────────────────────────────────────┐
             │ PostgreSQL 16 (Local via Docker Compose)         │
             └──────────────────────────────────────────────────┘
```

---

## 📦 Project Structure

```
dashboard-short-factory/
├── .github/workflows/ci.yml       # CI Quality Gate (lint, typecheck, unit, e2e, build)
├── apps/
│   ├── api/                       # NestJS 10 REST API backend
│   │   ├── src/
│   │   │   ├── app.module.ts
│   │   │   ├── main.ts
│   │   │   ├── common/            # Filters, Interceptors, AES-256 Encryption
│   │   │   ├── config/            # Strict startup environment validation
│   │   │   ├── infrastructure/    # Prisma database service, schema, and seed
│   │   │   └── modules/           # Channels, Genres, Pipeline, Topics, Schedule, Health
│   │   └── test/                  # E2E Supertest test suites
│   └── web/                       # React 18 + Vite frontend dashboard
│       └── src/
│           ├── app/               # Providers, React Router, App root
│           ├── components/        # Glassmorphic layout (Header, Sidebar, Shell) & UI primitives
│           ├── features/          # Dashboard, Channels, Studio (HITL review), Genres, Schedule
│           └── lib/               # Typed API client, utility helpers
├── packages/
│   ├── contracts/                 # Shared TypeScript models and Zod runtime validators
│   └── tsconfig/                  # Shared base tsconfig
├── docker-compose.yml             # PostgreSQL 16 Alpine container with healthchecks
├── pnpm-workspace.yaml            # pnpm monorepo workspace definition
├── API-CONTTRACT.md               # Upstream REST API specification v2.0
├── .env.example                   # Environment configuration template
└── README.md
```

---

## 🚀 Quickstart & Development

### 1. Prerequisites
- **Node.js**: `v20+` (tested on Node `v24.18.0`)
- **pnpm**: `v10+` (tested on pnpm `12.14.0`)
- **Docker & Docker Compose**

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
cp .env.example apps/api/.env
```

### 3. Start Database Container
```bash
docker compose up -d postgres
```

### 4. Install Dependencies & Build Shared Contracts
```bash
pnpm install
pnpm --filter "@short-factory/contracts" build
```

### 5. Initialize Database Schema & Seed Data
```bash
pnpm --filter "@short-factory/api" prisma db push
pnpm --filter "@short-factory/api" prisma:seed
```

### 6. Start Applications in Development Mode

* **Backend API (`apps/api`):**
  ```bash
  pnpm dev:api
  ```
  API is live at `http://localhost:4000`.  
  OpenAPI / Swagger interactive docs: `http://localhost:4000/api/docs`.

* **Frontend Dashboard (`apps/web`):**
  ```bash
  pnpm dev:web
  ```
  Vite dashboard is live at `http://localhost:5173`.

---

## 🧪 Testing & Verification Commands

All quality gates are deterministic and can be executed via pnpm:

```bash
# Type check all packages in monorepo
pnpm --filter "@short-factory/contracts" typecheck
pnpm --filter "@short-factory/api" typecheck
pnpm --filter "@short-factory/web" typecheck

# Backend Unit Tests (Jest)
pnpm --filter "@short-factory/api" test

# Backend End-to-End Tests (Supertest)
pnpm --filter "@short-factory/api" test:e2e

# Frontend Component Tests (Vitest + React Testing Library)
pnpm --filter "@short-factory/web" test

# Production Build
pnpm build
```

---

## 🔐 Security Architecture

1. **AES-256-GCM Credential Encryption**: Google OAuth tokens (`clientSecret`, `refreshToken`) are encrypted using Node's native `crypto` module before storage. The API never serializes plaintext credentials; responses project `has_credentials: boolean`.
2. **Zero-Local Purge**: Video rendering enforces a zero-local disk policy, immediately wiping ephemeral frame buffers and staging MP4s upon successful Cloudinary CDN offload.
3. **Strict Validation Pipeline**: Input DTOs are validated at HTTP boundaries with `whitelist: true` and `transform: true` using `class-validator` and `zod`.

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Infrastructure & storage readiness probe |
| `GET` | `/api/v2/channels` | Retrieve all configured YouTube channels |
| `POST` | `/api/v2/channels/configure` | Upsert channel metadata & OAuth credentials |
| `GET` | `/api/v2/genres` | List artistic Brand DNA profiles & prompts |
| `PUT` | `/api/v2/genres/:id` | Update director scriptwriting & visual prompts |
| `POST` | `/api/v2/pipeline/produce` | Single-shot video compositing pipeline |
| `POST` | `/api/v2/pipeline/batch` | Matrix batch production across multiple channels |
| `GET` | `/api/topics` | List viral topics with status & QC scores |
| `POST` | `/api/approval/callback` | HITL moderation callback (`APPROVE`, `REGENERATE`, `DISCARD`) |
| `GET` | `/api/schedule` | Cron schedule configuration & status |
| `POST` | `/api/v2/schedule/trigger` | Trigger rotational cron job immediately |
