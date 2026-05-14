# Velore (Eyewear E‑Commerce + CRM + AI)

Monorepo structure:
- `frontend/`: React + Vite storefront (and admin UI components)
- `backend/`: Node.js + Express REST API + Prisma
- `ai-service/`: FastAPI microservice (planned face-shape analysis)

## Quick start (local dev)

Prereqs:
- Docker Desktop running (for PostgreSQL)
- Node.js **20 LTS** (recommended)

### 1) Start PostgreSQL

```bash
docker compose up -d postgres
```

### 2) Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Backend:
- `http://localhost:3000/health`

### 3) Frontend

```bash
cd ../frontend
cp .env.example .env
npm install
npm run dev
```

Frontend:
- `http://localhost:5173`

### 4) AI service (optional)

```bash
cd ../ai-service
python -m venv venv
```

Windows:

```bash
venv\Scripts\activate
```

Run:

```bash
pip install -r requirements.txt
uvicorn app:app --reload --port 5001
```

## Documentation

See `docs/`:
- `docs/current-project-diagnosis.md`
- `docs/schema-audit.md`
- `docs/api-contract.md`
- `docs/branching-strategy.md`
- `docs/git-workflow.md`
- `docs/migration-guide.md`
- `docs/team-setup.md`

