# Velore Project Setup Guide

This repository is organized **by Git branches**. Each branch carries a different slice of the Velore eyewear e‑commerce project:

| Branch | Purpose |
|--------|---------|
| **main** | Landing / documentation branch only — **not** used to run the full application |
| **backend** | Backend API only (`backend/`) |
| **frontend** | Customer storefront only (`frontend/`) |
| **crm** | Full CRM-ready prototype: `backend/`, `frontend/` (storefront + `/admin`), `docs/`, optional `ai-service/`, `docker-compose.yml`, etc. |

**Important:** After cloning, **checkout the branch that matches what you want to run.** Files visible at the repo root change between branches (see [Branch layout verification](#branch-layout-verification)).

---

## Prerequisites

Install or have access to:

| Tool | Notes |
|------|--------|
| **Git** | Required |
| **Node.js** | **Node.js 20 LTS** is recommended (matches root `README.md` on `main`). **Node.js 18+ or 20+** is acceptable if no `engines` field conflicts |
| **npm** | Comes with Node |
| **PostgreSQL** | Required for API + Prisma (local install or container) |
| **Prisma CLI** | Used via `npx prisma …` from `backend/` (no global install required) |
| **Modern browser** | Chrome, Firefox, Edge, or Safari |
| **Docker Desktop** | *Optional* — useful if you use `docker-compose.yml` on the **crm** branch for Postgres |
| **VS Code / Cursor** | *Optional* — recommended for editing |

---

## Clone the repository

```bash
git clone https://github.com/01samber/velore.git
cd velore
```

### List remote branches

```bash
git branch -a
```

### Checkout a branch

```bash
git checkout main
git checkout backend
git checkout frontend
git checkout crm
```

---

## Main branch setup

The **main** branch is a **clean landing/documentation** branch. Use it to read project overview and setup instructions; **do not expect `backend/` or `frontend/` folders here.**

```bash
git checkout main
```

On **Windows** (PowerShell or CMD):

```bat
dir
```

On **macOS / Linux**:

```bash
ls
```

**Typical files after this guide is merged:**

- `README.md`
- `SETUP.md`
- `.gitignore`

---

## Backend branch setup

Use this when you only need the REST API and database layer.

```bash
git checkout backend
cd backend
npm install
```

### Environment variables

1. **Prefer the checked-in template:** copy `backend/.env.example` to `backend/.env` when present:

   ```bash
   cp .env.example .env
   ```

   On Windows (PowerShell), if `cp` is unavailable:

   ```powershell
   Copy-Item .env.example .env
   ```

2. **Align values with your Postgres install.** The Velore example often uses a Docker-mapped port (for example **5433**) and user/password from compose — your machine may use **`localhost:5432`**.

**Illustrative placeholders** (adjust user, password, host, port, and database name):

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/velore_db"
JWT_SECRET="replace-with-secure-secret"
ADMIN_JWT_SECRET="replace-with-secure-admin-secret"
PORT=3000
```

> **Always verify** `backend/.env.example` on your checked-out branch for exact keys. The Velore templates commonly use **`JWT_SECRET`** (and may not define a separate `ADMIN_JWT_SECRET`). The **crm** example also includes **`DIRECT_URL`**, **`FRONTEND_URL`**, **`JWT_EXPIRES_IN`**, and optional Stripe/email fields — copy those lines from `.env.example` rather than guessing.

### Database setup

1. Create an empty PostgreSQL database (e.g. `velore_db`).
2. From `backend/`:

```bash
npx prisma validate
npx prisma migrate status
```

Apply migrations for **local development**:

```bash
npx prisma migrate dev
```

> **Guidance:** Prefer `prisma migrate dev` so your schema stays aligned with migration history. Avoid `prisma db push` unless you intentionally bypass migrations (not recommended for team workflows).

Optional but common before running:

```bash
npx prisma generate
```

Seed demo data (if configured on your branch):

```bash
npx prisma db seed
```

### Start the backend

```bash
npm run dev
```

**Expected:** API listens on **port 3000** unless `PORT` in `.env` says otherwise.

### Health checks

- `http://localhost:3000/health`
- `http://localhost:3000/api/v1/test-db`

### Tests and image verification

```bash
npm test
npm run verify:images
```

---

## Frontend branch setup

Use this for the **customer storefront** only. It expects the **backend API** to be running separately for live data.

```bash
git checkout frontend
cd frontend
npm install
```

### Environment variables

Create `frontend/.env` if needed (copy from `frontend/.env.example` when available):

```env
VITE_API_URL=http://localhost:3000/api/v1
```

The frontend branch **does not** include the backend — start **backend** on another checkout/terminal or another clone.

### Run the dev server

```bash
npm run dev
```

Open **http://localhost:5173**

### Build and lint

```bash
npm run build
npm run lint
```

**Note:** `npm run lint` may report existing React Hook dependency **warnings** (for example in checkout/shop/product screens). **Errors** should be resolved before submitting changes; warnings may remain per project policy.

---

## CRM branch setup

The **crm** branch is the **full working prototype**: backend, storefront, admin CRM (`/admin`), product CRUD, uploads, variants, stock enforcement, documentation, optional `ai-service/`, and often **`docker-compose.yml`** for Postgres.

```bash
git checkout crm
```

### Terminal 1 — Backend

```bash
cd backend
npm install
```

Create **`backend/.env`** from **`backend/.env.example`** and edit `DATABASE_URL` / `DIRECT_URL` for your Postgres instance.

Example shape (adjust to match `.env.example`):

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/velore_db"
JWT_SECRET="replace-with-secure-secret"
ADMIN_JWT_SECRET="replace-with-secure-admin-secret"
PORT=3000
```

Then:

```bash
npx prisma validate
npx prisma migrate status
npx prisma migrate dev
npx prisma db seed
npm run verify:images
npm test
npm run dev
```

### Terminal 2 — Frontend

```bash
cd frontend
npm install
```

Create **`frontend/.env`** if needed:

```env
VITE_API_URL=http://localhost:3000/api/v1
```

```bash
npm run dev
```

### URLs

| Surface | URL |
|---------|-----|
| Storefront | http://localhost:5173 |
| CRM login | http://localhost:5173/admin/login |

---

## Demo credentials

These match typical **seed** data but **may differ by branch or seed edits.**

### Admin / CRM

| Field | Value |
|-------|--------|
| Email | `admin@velore.local` |
| Password | `Admin123!Demo` |

### Customers (if seeded)

| Email | Password |
|-------|----------|
| `customer1@velore.local` | `Customer123!Demo` |
| `customer2@velore.local` | `Customer123!Demo` |
| `customer3@velore.local` | `Customer123!Demo` |

> **If login fails:** Inspect `backend/prisma/seed.js` (or equivalent) and the `users` / admin tables in PostgreSQL. Seed scripts and roles can vary between branches.

---

## CRM and storefront — manual test checklist

### CRM (`/admin`)

- [ ] Log in at `/admin/login`
- [ ] Open dashboard
- [ ] Open products list
- [ ] Add a product
- [ ] Upload one or more product images
- [ ] Create or edit a **variant** (SKU, stock, images)
- [ ] Set **stock quantity** / low-stock threshold as applicable
- [ ] Open **inventory** and confirm stock summary updates
- [ ] Confirm **staff vs super admin** restrictions if multiple accounts exist

### Storefront

- [ ] Open a product detail page
- [ ] Add to cart
- [ ] Attempt quantity **greater than available stock** — UI should limit or backend should reject
- [ ] Checkout a **valid** quantity — order should succeed when stock allows
- [ ] Confirm stock decreases after successful checkout
- [ ] Attempt another purchase when stock is insufficient — should fail or show out-of-stock behavior

### Stock scenario (example)

If **stock = 5**:

1. Quantity **6** → blocked or rejected  
2. Checkout **5** → succeeds  
3. Stock becomes **0**  
4. Further orders → rejected / out of stock  

---

## Branch layout verification

Current organization (high level):

| Branch | Typical root contents |
|--------|----------------------|
| **main** | `README.md`, `SETUP.md`, `.gitignore` |
| **backend** | `backend/`, `.gitignore` |
| **frontend** | `frontend/`, `.gitignore` |
| **crm** | `backend/`, `frontend/`, `docs/`, `docker-compose.yml`, optional `ai-service/`, `README.md`, `.gitignore`, etc. |

Useful Git commands:

```bash
git branch -vv
git ls-tree --name-only origin/main
git ls-tree --name-only origin/backend
git ls-tree --name-only origin/frontend
git ls-tree --name-only origin/crm
```

**Expected names only** (exact list may gain files over time):

**main**

- `.gitignore`
- `README.md`
- `SETUP.md`

**backend**

- `.gitignore`
- `backend`

**frontend**

- `.gitignore`
- `frontend`

**crm**

- `.gitignore`
- `README.md` (when present)
- `ai-service` (when present)
- `backend`
- `docker-compose.yml` (when present)
- `docs`
- `frontend`

---

## Common problems

### 1. Backend cannot connect to the database

- Confirm PostgreSQL is running  
- Verify `DATABASE_URL` (and `DIRECT_URL` if present) host, port, user, password, database name  
- Create the database if it does not exist  
- Run `npx prisma validate` from `backend/`

### 2. Prisma migration issues

- Run `npx prisma migrate status`  
- Prefer `npx prisma migrate dev` locally  
- Avoid `prisma db push` unless you mean to skip migrations  

### 3. Frontend cannot reach the backend

- Ensure backend is running (`/health`)  
- Check `VITE_API_URL` matches API base (e.g. `http://localhost:3000/api/v1`)  
- Confirm CORS / `FRONTEND_URL` on backend if requests are blocked  

### 4. Images not loading

- Confirm backend serves uploaded files (e.g. under `/uploads`)  
- Run `npm run verify:images` in `backend/`  
- Check stored paths (often under `/uploads/products/…`)

### 5. CRM login fails

- Confirm seed ran and admin user exists  
- Check admin login API responses (network tab)  
- Verify separate admin token handling vs customer JWT as implemented on your branch  

### 6. Stock does not update

- Use the **crm** branch for the full stock workflow  
- Confirm variants have `stock_quantity` (or equivalent) set  
- Complete a real checkout and re-fetch inventory  
- Run backend tests: `npm test`  

### 7. “Missing” folders after clone

Each branch only contains **its** tree. If `backend/` or `frontend/` is missing, you are not on **crm** (or **backend** / **frontend**). Run:

```bash
git checkout crm
```

(or `backend` / `frontend` as needed).

---

## Summary

- Clone once, then **`git checkout`** the branch you need.  
- **main** → read docs only.  
- **backend** / **frontend** → run API or UI in isolation.  
- **crm** → full demo including admin CRM and stock-aware flows.  

For API contracts and deeper architecture, see files under `docs/` on branches that include documentation (especially **crm**).
