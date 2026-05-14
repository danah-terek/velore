# Database Setup (PostgreSQL + Prisma)

This repo is designed around:
- **PostgreSQL** as the primary database
- **Prisma** as the ORM (`backend/prisma/schema.prisma`)

## What currently exists

- Prisma schema: `backend/prisma/schema.prisma`
- Backend Prisma client initialization: `backend/src/shared/utils/database.js` uses `process.env.DATABASE_URL`
- Root docker compose includes a local Postgres service.

## Node.js version note (important)

For reliable Prisma CLI behavior, use **Node.js 20 LTS** for local development (this matches `backend/Dockerfile` using `node:20-alpine`).

## Required environment variables (backend)

Minimum for Prisma to connect:
- `DATABASE_URL`

Recommended (because schema declares it):
- `DIRECT_URL` (direct connection used for migrations in pooled environments)

Example (local Docker Postgres):
- `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/velore?schema=public`
- `DIRECT_URL=postgresql://postgres:postgres@localhost:5432/velore?schema=public`

## pgvector note (important)

The Prisma model `embeddings` includes:
- `embedding Unsupported("vector")?`

This implies the database may need the `pgvector` extension enabled:
- `CREATE EXTENSION IF NOT EXISTS vector;`

The provided `docker-compose.yml` uses `pgvector/pgvector:pg16` so local development supports the `vector` type.

## Seed note (important)

The repo currently contains multiple seed scripts:
- `backend/src/seed.js`
- `backend/backend/prisma/seed.js` (appears redundant / legacy)

For professional team usage, standardize to **one** seed entrypoint (recommended: `backend/prisma/seed.js`) and configure Prisma’s seed script in `backend/package.json`.

