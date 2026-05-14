# Team Setup (Clone + Run)

This doc explains how a partner/dev can clone and run the project locally.

## 1) Clone and checkout `dev`

```bash
git clone <repo-url>
cd <project-name>
git checkout dev
```

## 2) Start PostgreSQL (Docker)

From repo root:

```bash
docker compose up -d postgres
docker compose ps
```

If Docker commands fail, ensure **Docker Desktop is running** (Windows) and that the engine is available.

## 3) Backend setup

```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Notes:
- Use **Node.js 20 LTS** locally (Prisma CLI is most stable with supported Node versions).
- Do not commit `backend/.env`.

Backend URLs:
- Health: `http://localhost:3000/health`
- API base: `http://localhost:3000/api/v1`

## 4) Frontend setup

```bash
cd ../frontend
cp .env.example .env
npm install
npm run dev
```

Frontend URL:
- `http://localhost:5173`

## 5) AI service setup (FastAPI)

```bash
cd ../ai-service
python -m venv venv
```

Windows:

```bash
venv\Scripts\activate
```

Mac/Linux:

```bash
source venv/bin/activate
```

Install and run:

```bash
pip install -r requirements.txt
uvicorn app:app --reload --port 5001
```

AI service URL:
- Health: `http://localhost:5001/health`

## Partner workflow (feature branch → PR)

```bash
git checkout dev
git pull origin dev
git checkout -b feature/name-of-task
```

After changes:

```bash
git add .
git commit -m "scope: clear message"
git push -u origin feature/name-of-task
```

Then open a Pull Request into `dev`.

