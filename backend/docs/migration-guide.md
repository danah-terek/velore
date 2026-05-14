# Velore Backend — Prisma Migration Guide

## Rules used in this repo

- Use **PostgreSQL** (`provider = "postgresql"`).
- Use **Prisma migrations** (`prisma migrate dev`) — **do not** use `prisma db push`.
- Do **not** reset the database unless explicitly approved.

## Common commands

```bash
npm run db:validate
npm run db:format
npm run db:generate

# Apply migrations (dev)
npm run db:migrate

# Run seed
npm run db:seed

# Prisma Studio
npm run db:studio
```

## First-time setup (new machine)

1. Copy `.env.example` → `.env` (local only; never commit `.env`).
2. Ensure Postgres is running (Docker or local install).
3. Run:

```bash
npm install
npm run db:validate
npm run db:generate
npm run db:migrate
npm run db:seed
```

## Notes about pgvector

`prisma/schema.prisma` contains an `Unsupported("vector")` column (`embeddings.embedding`), which requires the pgvector extension in the DB.

The Docker compose uses `pgvector/pgvector:pg16` so the extension is available.

## Fix: `ERROR: type "vector" does not exist`

If the first migration creates a `vector` column, Postgres must have the extension enabled **before** any `CREATE TABLE` that uses it.

This repo’s init migration should begin with:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

If you hit this error again, ensure that line exists at the very top of the first migration SQL file.

## Fix: Windows Prisma `EPERM` on generate

If `npx prisma generate` fails with an `EPERM` file-lock error:

```powershell
taskkill /F /IM node.exe
Remove-Item -Recurse -Force .\node_modules\.prisma
npx prisma generate
```

