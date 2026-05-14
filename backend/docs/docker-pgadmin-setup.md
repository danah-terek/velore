# Velore Backend — Docker Postgres + pgAdmin Setup

## Services

This backend includes `docker-compose.yml` with:

- **Postgres**: `pgvector/pgvector:pg16`
  - Host port **5433** → container port **5432**
- **pgAdmin**: `dpage/pgadmin4`
  - Host port **5050** → container port **80**

## Start / stop

From the backend folder (where `docker-compose.yml` exists):

```bash
docker compose up -d postgres pgadmin
docker compose ps
docker compose logs postgres
docker compose logs pgadmin
```

## Safe local reset (destructive)

This deletes only the **local Docker volumes** (your local dev DB data):

```bash
docker compose down -v
docker compose up -d postgres pgadmin
docker compose ps
```

## pgAdmin login

- URL: `http://localhost:5050`
- Email: `admin@velore.local`
- Password: `admin`

Note: pgAdmin rejects `.local` emails by default; compose sets:

- `PGADMIN_CONFIG_ALLOW_SPECIAL_EMAIL_DOMAINS="['local']"`

so `admin@velore.local` is accepted.

## Register the database server in pgAdmin

General tab:

- Name: `Velore Docker Postgres`

Connection tab:

- Host name/address: `postgres`
- Port: `5432`
- Maintenance database: `velore_db`
- Username: `postgres`
- Password: `postgres`

Important:

- **Inside pgAdmin (Docker)** → host is `postgres`, port is `5432`.
- **From Windows/Prisma** → host is `localhost`, port is `5433`.

## Where to see tables in pgAdmin

Servers → Velore Docker Postgres → Databases → velore_db → Schemas → public → Tables

