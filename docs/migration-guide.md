# Prisma ↔ PostgreSQL Migration Guide

This guide is written for this repo’s current stack:
- `backend/` Node.js + Express
- Prisma schema at `backend/prisma/schema.prisma`
- PostgreSQL as the DB

It defines two safe paths:
- **CASE A**: Fresh local DB (no data to preserve)
- **CASE B**: Existing DB with data (must preserve)

## Golden rules (team + production safety)

- Do **not** commit `.env`
- Do commit `.env.example`
- Do commit Prisma migration files (`backend/prisma/migrations/*`)
- Do **not** use `prisma db push` for production
- Do **not** reset/drop production databases
- Review generated SQL before applying to important databases

## When to use which Prisma command

### `prisma migrate dev`
Use for:
- Local development
- Generating migrations + applying them to a dev DB

Avoid for:
- Production deployments

### `prisma migrate deploy`
Use for:
- Applying already-created migrations in CI/CD or production-like environments

### `prisma db push`
Use for:
- Prototyping only (no migration history)

Do not use for:
- Production
- Team workflows where schema history matters

### `prisma migrate reset`
Use for:
- Local dev only when you explicitly want to drop & recreate

Never use for:
- Production
- Any DB that matters

---

## CASE A — Fresh local database (no data)

### 1) Start PostgreSQL (Docker)

From repo root:

```bash
docker compose up -d postgres
```

### 2) Backend install

```bash
cd backend
npm install
```

### 3) Prisma validate/format/generate

```bash
npx prisma validate
npx prisma format
npx prisma generate
```

### 4) Create + apply migration

```bash
npx prisma migrate dev --name init
```

### 5) Seed database

This requires Prisma seed to be configured in `backend/package.json`.

Then:

```bash
npx prisma db seed
```

### 6) Inspect data

```bash
npx prisma studio
```

### 7) Run backend

```bash
npm run dev
```

---

## CASE B — Existing database with data (preserve)

### 0) Backup first (mandatory)

```bash
pg_dump --format=custom --file velore.backup.dump "$DATABASE_URL"
```

### 1) Create migration without applying (safe review)

```bash
cd backend
npx prisma migrate dev --create-only --name <meaningful_name>
```

### 2) Review SQL

Review files under:
- `backend/prisma/migrations/<timestamp>_<name>/migration.sql`

Look for:
- `DROP TABLE`
- `DROP COLUMN`
- type conversions
- constraint changes
- data-moving requirements (renames, merges)

### 3) Test on staging DB

Apply to a staging DB first:

```bash
npx prisma migrate deploy
```

### 4) Production deployment

In production pipelines/hosts:
- set `DATABASE_URL` / `DIRECT_URL` appropriately
- run:

```bash
npx prisma migrate deploy
```

### Optional: schema diff (advanced)

If you need to compare two schemas:

```bash
npx prisma migrate diff \
  --from-schema-datamodel prisma/schema.prisma \
  --to-url "$DATABASE_URL" \
  --script
```

---

## Important repo-specific risks

### BigInt primary keys
The current schema uses `BigInt` IDs extensively. Migrating to UUID later is possible but is a large project.

### `embeddings.embedding` uses pgvector
If you keep `embeddings`, ensure the DB supports `pgvector` extension.

