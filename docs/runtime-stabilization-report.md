# Runtime Stabilization Report (Track A)

Goal: make **frontend + backend + PostgreSQL** runnable locally with a clean developer setup.

## 1) What was broken

- **No Git repository** in this folder (no `.git/`), so branching workflow could not be used yet.
- `docker-compose.yml`:
  - initially missing Postgres
  - later had a YAML `depends_on` syntax issue (mix of list + mapping)
- Backend:
  - `/api/v1/payments` routes existed but were **not mounted** in `backend/src/app.js`
  - `products` routes had **duplicate/conflicting definitions** (`/`, `/search`)
  - `/health` response shape did not match the required contract
  - many controllers returned `{ success:false, error: ... }` instead of `{ success:false, message, errors }`
- Frontend:
  - Axios client unwraps responses, but multiple files still used `response.data.*` or destructured `{ data }` from API calls.
- Local tooling:
  - Docker engine was not available on this machine during verification (`docker compose` could not connect).
  - Prisma CLI commands appeared to hang in this environment; the repo should use **Node 20 LTS** for best Prisma compatibility.
  - Frontend build initially failed on Windows with the default Vite version; pinning to a stable Vite 6.x line fixed `npm run build`.

## 2) What was fixed

### Backend
- Mounted payments routes:
  - `app.use('/api/v1/payments', paymentRoutes)`
- Stabilized products routing:
  - `GET /api/v1/products` → list/filter
  - `GET /api/v1/products/search` → search
  - `GET /api/v1/products/:id` → detail
  - removed duplicate/conflicting route registrations
- Health check standardized:
  - `GET /health` now returns:
    - `{ "success": true, "message": "Backend is running", "data": { "timestamp": ... } }`
- Response contract improvements applied to critical storefront paths:
  - auth, cart, favorites, orders, contact, payments, products
- Stripe safety:
  - if `STRIPE_SECRET_KEY` is missing, `/api/v1/payments/*` returns:
    - `{ success:false, message:"Card payments are not configured yet.", errors:[] }` with HTTP 501

### Frontend
- Kept Axios interceptor behavior (API calls return the JSON body)
- Updated storefront call sites to treat results as already-unwrapped:
  - auth login/register
  - navbar search (`/products/search`)
  - favorites context
  - product detail
  - home page data loads (products/reviews/blogs)
  - checkout cart load + error handling
  - StripeCheckout now reads `intentResult.data.clientSecret` and handles non-configured responses cleanly

Tooling stabilization:
- Pinned frontend build toolchain to:
  - `vite@6.4.2`
  - `@vitejs/plugin-react@^4.3.0`
  so `npm run build` succeeds reliably on Windows.

### Docker/Postgres
- Added `postgres` service and switched to `pgvector/pgvector:pg16` to support existing `vector` type.
- Fixed `depends_on` YAML structure to a valid mapping.

## 3) Commands to run (developer verification)

### Docker (PostgreSQL)

```bash
docker compose up -d postgres
docker compose ps
docker compose logs postgres
```

### Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma validate
npx prisma format
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run build
npm run dev
```

## 4) What still remains TODO

- Create initial Prisma migration and verify it applies cleanly against the local Postgres container.
  - If it fails, address root cause (commonly: missing extension setup, unsupported Node version, or schema constraints).
- Finish standardizing response format across **all** backend controllers (some non-storefront routes still use legacy fields).
- Decide final Stripe implementation path (PaymentIntent/Elements vs hosted Payment Links) and align frontend accordingly.
- Add a proper Git repo (`git init`) and push to GitHub to enable the branch workflow.

## 5) How a partner can verify locally

1) Ensure Docker Desktop is running
2) Start Postgres via compose
3) Use Node 20 LTS
4) Run backend Prisma commands + start backend
5) Run frontend build + dev
6) Verify:
   - `GET http://localhost:3000/health`
   - Storefront loads `http://localhost:5173`
   - Navbar search returns results (requires seeded products or existing DB content)

