# Current Project Diagnosis (as-is scan)

This document is generated from an **on-disk scan** of the repository at `Velore/` on **2026-05-06**.  
It is intentionally factual: it describes what exists now, what is missing, and what is risky.

## 1) Existing folders and services

### Root
- `frontend/`: React + Vite storefront + admin UI components
- `backend/`: Node.js + Express REST API (Prisma + Postgres)
- `ai-service/`: FastAPI microservice stub (planned face-shape analysis)
- `docker-compose.yml`: currently defines backend + ai-service only
- `docs/`: **does not exist yet** in the repo (created by this documentation work)

### Prisma
- `backend/prisma/schema.prisma`: Prisma schema (PostgreSQL) with many models already present
- Additional seed-related files exist in more than one location (see backend scan)

## 2) Existing backend structure

Backend root: `backend/`
- `src/server.js`: server entrypoint (listens on `PORT` default 3000)
- `src/app.js`: Express app, middleware, and route mounting
- `src/shared/`
  - `middleware/middleware.js`: `authMiddleware`, `optionalAuth`, `adminAuthMiddleware` (JWT-based)
  - `utils/database.js`: PrismaClient with `datasourceUrl: process.env.DATABASE_URL`
- `src/features/` (feature modules; each typically has `*.routes.js`, `*.controller.js`, `*.service.js`)
  - `auth/`: register/login/forgot/reset/profile
  - `admin/`: admin login, dashboard stats, admin-only CRUD and audit logs, RBAC gating
  - `rbac/index.js`: permission map + middleware
  - `products/`: listing, filtering, searching, CRUD (but routes contain duplicates; see risks)
  - `categories/`, `brand/`
  - `cart/`: authenticated cart API (guest cart exists only in frontend localStorage)
  - `orders/`: guest+auth checkout supported (via `optionalAuth`)
  - `payments/`: Stripe PaymentIntent creation + confirm endpoints exist, but **not mounted** in `src/app.js` currently
  - `favorites/`, `reviews/`, `users/`, `contact/`, `loyalty/`, `blog/`
- Other backend directories:
  - `prisma/` (schema)
  - `tests/` (exists; contents not analyzed in depth yet)
  - `uploads/` (exists; implies file handling)
  - `logs/` (exists)
  - `backend/.env.example` exists (but needs improvement for team use)
  - `backend/.gitignore` exists
  - `backend/README.md` exists but is empty

### Backend route mounting (current)
Mounted in `backend/src/app.js` under `/api/v1/*`:
- `/categories`, `/brands`, `/products`, `/reviews`, `/auth`, `/favorites`, `/users`, `/contact`, `/loyalty`, `/admin`, `/blogs`, `/cart`, `/orders`

Not mounted (but exists as code):
- `/payments` (feature exists in `src/features/payments`, but `app.js` does not `app.use('/api/v1/payments', ...)`)

## 3) Existing frontend structure

Frontend root: `frontend/`
- Vite app with feature-based folder structure
- `src/shared/services/apiClient.js`: Axios client with request/response interceptors
  - **Important**: response interceptor returns `response.data` (unwrapped)
  - Multiple frontend modules still treat the returned value as an Axios response object, causing runtime shape mismatches.

Key customer routes in `src/App.jsx`:
- `/`: home
- `/shop`
- `/product/:id`
- `/login`, `/signup`, `/forgot-password`, `/reset-password`
- `/checkout`, `/payment-success`
- `/favorite`, `/profile`
- `/blogs`, `/blogs/:id`
- `/ai-advisor` (currently a static marketing/FAQ page)

Admin/CRM UI presence:
- Routes: `/admin/login`, `/admin`, `/admin/*`
- UI module: `src/features/admin/VeloreAdminUI.jsx`
- Components under `src/components/admin/*` (dashboard overview, users, orders, products, blog manager/editor, analytics, audit logs, etc.)
  - These are **UI-level** components; backend “CRM-grade” endpoints are only partially present.

Auth handling:
- Tokens stored in localStorage/sessionStorage
- `apiClient.js` attaches `Authorization: Bearer <token>` automatically
- Separate notion of `admin_token` vs customer `token` in the client

Env setup:
- `frontend/.env.example` exists but is empty (needs real placeholders like `VITE_API_URL`, `VITE_STRIPE_PUBLISHABLE_KEY`)

## 4) Existing ai-service structure

AI service root: `ai-service/`
- `app.py`: FastAPI app
  - `GET /health` returns `{status:"healthy"}`
  - `GET /` returns `{message:"Velore AI Service Running"}`
  - Runs uvicorn on port 5001 when invoked as `python app.py`
- `requirements.txt`: includes `fastapi`, `uvicorn`, `mediapipe`, `opencv-python`, `numpy`, `python-multipart`
- `shape_classifier.py`: exists but is empty
- `face_detection.py`: exists but is empty
- `ai-service/.env`: exists but is empty
- `ai-service/README.md`: exists but is empty

Current limitation:
- No upload endpoint (multipart image), no face landmark detection pipeline, no classification, no recommendation output.
- Backend env includes `AI_SERVICE_URL`, but current backend codebase does not clearly use it yet.

## 5) Existing Docker setup

Root `docker-compose.yml` currently defines:
- `postgres`:
  - image: `pgvector/pgvector:pg16` (to support the existing Prisma `vector` column type)
  - exposes `5432:5432`
- `backend`:
  - build `./backend`
  - exposes `3000:3000`
  - uses `./backend/.env` (expected, but file not committed)
  - sets `AI_SERVICE_URL=http://ai-service:5001`
  - `command: npm run dev`
  - depends on `postgres` (healthy) and `ai-service`
- `ai-service`:
  - build `./ai-service`
  - exposes `5001:5001`

Missing from compose:
- `frontend` service (must be run manually)

Connectivity status:
- Backend ↔ AI service: compose networking is correct (service name `ai-service` reachable).
- Backend ↔ Postgres: provided by compose (but backend `.env` must point at it).
- Frontend ↔ Backend: frontend defaults to `http://localhost:3000/api/v1` in `apiClient.js`, which matches backend port mapping.

## 6) Existing environment setup

### Backend env (exists)
`backend/.env.example` currently includes:
- `PORT`, `NODE_ENV`
- `DATABASE_URL` (currently shows a Supabase pooler example)
- `JWT_SECRET`, `JWT_EXPIRES_IN`
- `AI_SERVICE_URL`
- `FRONTEND_URL`

Missing in backend example (but used in code):
- `STRIPE_SECRET_KEY` (used by `src/features/payments/payment.controller.js`)
- Gmail-related variables (used by auth forgot/reset):
  - `GMAIL_USER`
  - `GMAIL_APP_PASSWORD`

### Frontend env (exists but empty)
`frontend/.env.example` exists but is empty. Frontend expects:
- `VITE_API_URL` (used by `apiClient.js` and `ContactModal.jsx`)
- `VITE_STRIPE_PUBLISHABLE_KEY` (used by `StripeCheckout.jsx`)

### AI service env
`ai-service/.env` exists but is empty; no current env usage in `app.py`.

### Unsafe hardcoded secrets
- No obvious hardcoded production secrets were found in source files during the scan.
- However, `backend/.env.example` contains a **real-looking external host** template (Supabase pooler). This is not a secret by itself, but should be replaced with a neutral local example to avoid confusion.

---

## Current Project Diagnosis (summary table)

| Area | Current status | Problem | Risk level | Recommended action |
|------|----------------|---------|------------|--------------------|
| Docker/dev environment | Partial | No Postgres service; frontend not in compose | High | Add Postgres service + standard local `DATABASE_URL`; optionally add frontend service |
| Prisma/Postgres | Present | Schema is large and BigInt-based; migrations/seeding story unclear | High | Audit schema + align seed/migrate workflow; document safe migration paths |
| Backend API | Substantial | Payments routes exist but not mounted; product routes have duplicates | High | Mount payments; fix route duplication; add consistent error/response patterns |
| Frontend ↔ API contract | Inconsistent | Axios interceptor unwraps responses; many modules still use `response.data.*` | High | Standardize response contract and client behavior; update service modules accordingly |
| Auth/security | Basic | JWT ok; password reset relies on Gmail env; reset token stored on `users` | Medium | Document env, improve token/reset model (later), add rate limiting/logging (later) |
| Admin/CRM | Partial | Admin RBAC exists, admin UI components exist, but CRM domain models (tasks, tickets, notes) not present | Medium | Add CRM API + models in a planned, incremental migration after schema audit |
| AI service | Stub | Only health/root endpoints; classifier files empty | Medium | Implement `/classify` endpoint (multipart), validation, and integration path via backend |
| Documentation | Minimal | No root README/docs; backend README empty; env examples incomplete | High | Add `docs/` suite, root README, team setup, api contract, migration guide |

