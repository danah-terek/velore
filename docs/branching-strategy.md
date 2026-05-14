# Branching Strategy (Professional Team Workflow)

This repo should be managed like a multi-service product:
- `frontend/` (storefront + CRM UI)
- `backend/` (API + Prisma)
- `ai-service/` (FastAPI)
- root devops/docs

## Branches

### Long-lived branches

- `main`
  - **Purpose**: final stable, release-ready code only
  - **Rule**: only merge via PR, passing checks
- `dev`
  - **Purpose**: integration branch for the team
  - **Rule**: feature branches merge into `dev`; `dev` merges into `main` on releases

### Feature branches (required set)

#### `feature/docker-env-devops`
- **Purpose**: docker-compose, Postgres container, env examples, run instructions
- **Expected changes**: `docker-compose.yml`, root `README.md`, `.gitignore`, `backend/.env.example`, docs setup files
- **Should NOT change**: business logic, Prisma schema (beyond small wiring)
- **Checklist**:
  - Postgres service in compose
  - backend connects locally
  - `.env.example` complete
  - run instructions verified
- **Commit message examples**:
  - `devops: add postgres to docker compose`
  - `docs: add local environment setup`
- **Depends on**: none

#### `feature/db-prisma-postgres`
- **Purpose**: schema audit, targeted schema updates, migrations, seeds, DB docs
- **Expected changes**: `backend/prisma/schema.prisma`, `backend/prisma/migrations/*`, `backend/prisma/seed.js`, docs DB/ERD
- **Should NOT change**: frontend UI, AI service (unless required for schema)
- **Checklist**:
  - schema validated + formatted
  - migration files created and reviewed
  - seed script works
  - Prisma Studio verified
- **Commit message examples**:
  - `db: add migration for product slugs`
  - `db: standardize seed script`
- **Depends on**: `feature/docker-env-devops`

#### `feature/backend-core-api`
- **Purpose**: Express app setup, route mounting, controllers/services patterns, error handling
- **Expected changes**: `backend/src/app.js`, shared middleware/utilities, route mounting consistency
- **Should NOT change**: Prisma schema (except if unavoidable)
- **Checklist**:
  - centralized error handler
  - consistent response format
  - route registration complete (payments included)
- **Commit message examples**:
  - `api: mount payments routes`
  - `api: add centralized error handler`
- **Depends on**: `feature/docker-env-devops`, usually `feature/db-prisma-postgres`

#### `feature/backend-auth-security`
- **Purpose**: JWT auth, password hashing, role checks, protected endpoints
- **Expected changes**: auth middleware, auth services/controllers, admin RBAC improvements
- **Should NOT change**: frontend
- **Checklist**:
  - rate limiting for auth endpoints (planned)
  - consistent token claims
  - admin/customer separation documented
- **Depends on**: `feature/backend-core-api`

#### `feature/backend-catalog-orders`
- **Purpose**: products, categories, brands, variants, cart, favorites, orders
- **Expected changes**: `backend/src/features/products|categories|brand|cart|favorites|orders`
- **Checklist**:
  - fix duplicate product routes
  - BigInt serialization consistency
  - guest checkout behavior verified
- **Depends on**: `feature/backend-core-api`, `feature/db-prisma-postgres`

#### `feature/backend-crm-api`
- **Purpose**: CRM endpoints (customers, tasks, tickets, dashboards, audit logs)
- **Expected changes**: `backend/src/features/crm/*` (new), admin routes, services
- **Depends on**: `feature/backend-auth-security`, `feature/db-prisma-postgres`

#### `feature/frontend-api-contract`
- **Purpose**: standardize API client, response handling, auth/error handling
- **Expected changes**: `frontend/src/shared/services/apiClient.js`, all `*Service.js` modules
- **Checklist**:
  - one response shape everywhere
  - admin token routing consistent
- **Depends on**: `feature/backend-core-api` (contract decisions)

#### `feature/frontend-storefront`
- **Purpose**: customer pages (home, shop, product, cart, checkout, profile, favorites)
- **Expected changes**: `frontend/src/features/*` (storefront) and shared UI
- **Depends on**: `feature/frontend-api-contract`, `feature/backend-catalog-orders`

#### `feature/frontend-crm-dashboard`
- **Purpose**: CRM/admin dashboard pages
- **Expected changes**: `frontend/src/features/admin/*`, `frontend/src/components/admin/*`
- **Depends on**: `feature/frontend-api-contract`, `feature/backend-crm-api`

#### `feature/ai-service`
- **Purpose**: FastAPI endpoints for face analysis
- **Expected changes**: `ai-service/*`
- **Checklist**:
  - `/health`
  - `POST /classify-face-shape` (multipart)
  - validation + placeholder classifier (if needed)
- **Depends on**: none (but integration comes later)

#### `feature/ai-recommendations-integration`
- **Purpose**: backend-to-ai-service integration + frontend AI advisor flow
- **Expected changes**: backend AI routes + frontend AI UI
- **Depends on**: `feature/ai-service`, `feature/backend-core-api`, `feature/db-prisma-postgres`, `feature/frontend-api-contract`

#### `docs/senior-project`
- **Purpose**: report, diagrams, ERD explanation, API contract, setup/testing guides
- **Expected changes**: `docs/*`
- **Depends on**: all (docs must match reality)

## Recommended merge order

1. `feature/docker-env-devops`
2. `feature/db-prisma-postgres`
3. `feature/backend-core-api`
4. `feature/backend-auth-security`
5. `feature/backend-catalog-orders`
6. `feature/backend-crm-api`
7. `feature/frontend-api-contract`
8. `feature/frontend-storefront`
9. `feature/frontend-crm-dashboard`
10. `feature/ai-service`
11. `feature/ai-recommendations-integration`
12. `docs/senior-project`

## Exact Git commands (create branches from dev)

```bash
git checkout dev
git pull origin dev

git checkout -b feature/docker-env-devops
git checkout dev
git checkout -b feature/db-prisma-postgres
git checkout dev
git checkout -b feature/backend-core-api
git checkout dev
git checkout -b feature/backend-auth-security
git checkout dev
git checkout -b feature/backend-catalog-orders
git checkout dev
git checkout -b feature/backend-crm-api
git checkout dev
git checkout -b feature/frontend-api-contract
git checkout dev
git checkout -b feature/frontend-storefront
git checkout dev
git checkout -b feature/frontend-crm-dashboard
git checkout dev
git checkout -b feature/ai-service
git checkout dev
git checkout -b feature/ai-recommendations-integration
git checkout dev
git checkout -b docs/senior-project
```

