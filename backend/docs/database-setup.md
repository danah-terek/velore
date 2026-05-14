# Velore Backend — Database Setup (Postgres + pgAdmin)

## Docker (recommended)

This repo includes `docker-compose.yml` with:

- `postgres`: `pgvector/pgvector:pg16` (Postgres 16 + pgvector extension available)
- `pgadmin`: `dpage/pgadmin4`

Start services (from the backend repo root that contains `docker-compose.yml`):

```bash
docker compose up -d postgres pgadmin
docker compose ps
docker compose logs postgres
docker compose logs pgadmin
```

## pgAdmin login

- **URL**: `http://localhost:5050`
- **Email**: `admin@velore.local`
- **Password**: `admin`

## Register the Postgres server in pgAdmin

Inside pgAdmin (which runs in Docker), use the Docker service name as the host:

- **Name**: `Velore Local Postgres`
- **Host**: `postgres`
- **Port**: `5432`
- **Maintenance database**: `velore_db`
- **Username**: `postgres`
- **Password**: `postgres`

Notes:

- From **Windows/Prisma**, the host is `localhost` and the port is **5433** (compose maps `5433 → 5432`).
- From **pgAdmin in Docker**, the host should be `postgres` (service name).

## Local Postgres (alternative)

If you use a locally installed Postgres, ensure your `.env` `DATABASE_URL` points to the correct credentials and DB name.

