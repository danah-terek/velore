# Velore – Setup Guide

## Table of Contents

- [Prerequisites](#prerequisites)
- [Branch Structure](#branch-structure)
- [External Services](#external-services)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [AI Service (Optional)](#ai-service-optional)
- [Demo Credentials](#demo-credentials)
- [Verification Checklist](#verification-checklist)
- [Port Reference](#port-reference)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| Node.js | 20 LTS | `node --version` |
| npm | 9+ | `npm --version` |
| Git | Any | `git --version` |

> No local PostgreSQL installation required. Velore uses **Neon** (cloud-hosted PostgreSQL) so the entire team shares one database automatically — no manual syncing needed.

---

## Branch Structure

| Branch | Contents | Use When |
|--------|---------|---------|
| `main` | Documentation only | Reading project overview |
| `backend` | API only | Developing the API independently |
| `frontend` | Storefront only | Working on UI only |
| `crm` | Full application — backend + frontend + admin | **Recommended for full setup** |

Clone the repository and switch to the `crm` branch:

```bash
git clone https://github.com/danah-terek/velore.git
cd velore
git checkout crm
```

---

## External Services

Velore relies on two external services, both with free tiers sufficient for development.

| Service | Purpose | Free Tier |
|---------|---------|-----------|
| [Neon](https://neon.tech) | Cloud PostgreSQL database | 0.5 GB storage |
| [Supabase](https://supabase.com) | Product image storage | 1 GB storage, 2 GB transfer |
| [Stripe](https://stripe.com) | Payment processing (optional) | Test mode only |

**Why cloud services instead of local?**

- **Neon**: A shared cloud database means both team members always work against the same data without any manual syncing.
- **Supabase**: Product images are stored in the cloud with public URLs. Images uploaded by one teammate are immediately visible to the other — no file sharing or path configuration needed.

---

### Neon – Cloud PostgreSQL

1. Sign up at [neon.tech](https://neon.tech) (free tier)
2. Create a new project and choose the region closest to you
3. Once created, go to **Connection Details** and copy your connection string

It will look like this:
```
postgresql://username:password@ep-xxxx.us-east-1.aws.neon.tech/neondb?sslmode=require
```

> **Important:** Always keep `?sslmode=require` at the end — Neon requires SSL connections.

---

### Supabase – Image Storage

1. Sign up at [supabase.com](https://supabase.com) (free tier)
2. Create a new project and wait for it to initialize (2–3 minutes)
3. In the dashboard, go to **Storage** → **Create bucket**
   - Name: `products`
   - Toggle **Public bucket** ON
   - Click **Create bucket**
4. Go to **Project Settings → API** and copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public key** (starts with `eyJ...`)

---

## Backend Setup

```bash
cd backend
cp .env.example .env
```

Open `backend/.env` and fill in your credentials:

```env
# Neon PostgreSQL
DATABASE_URL="postgresql://USER:PASS@ep-xxxx.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://USER:PASS@ep-xxxx.neon.tech/neondb?sslmode=require"

# Supabase Storage
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_KEY="your-anon-public-key"
SUPABASE_BUCKET="products"

# Auth
JWT_SECRET="your-secret-key"
ADMIN_JWT_SECRET="your-admin-secret-key"

# Optional
PORT=3000
FRONTEND_URL="http://localhost:5173"
```

Install dependencies, apply migrations, and seed the database:

```bash
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Verify the backend is running:
```
GET http://localhost:3000/health → { "status": "ok" }
```

---

## Frontend Setup

```bash
cd ../frontend
cp .env.example .env
```

Open `frontend/.env` and set the API URL:

```env
VITE_API_URL=http://localhost:3000/api/v1
```

```bash
npm install
npm run dev
```

- Storefront: `http://localhost:5173`
- Admin CRM: `http://localhost:5173/admin/login`

---

## AI Service (Optional)

Required only for the **Virtual Try-On** feature. Skip if you don't need it.

```bash
cd ../ai-service
python -m venv venv
source venv/bin/activate        # Linux/macOS
# or: venv\Scripts\activate     # Windows

pip install -r requirements.txt
uvicorn app:app --reload --port 5001
```

---

## Demo Credentials

Seeded automatically when you run `npx prisma db seed`.

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@velore.local | SuperAdmin!123Demo |
| Staff Admin | admin@velore.local | admin123!Demo |
| Customer | customer1@velore.local | Customer123!Demo |
| Customer | customer2@velore.local | Customer123!Demo |

> If login fails, re-run `npx prisma db seed` and verify the users exist in your Neon database.

---

## Verification Checklist

### Backend
- [ ] `http://localhost:3000/health` returns `{"status":"ok"}`
- [ ] `http://localhost:3000/api/v1/products` returns seeded products

### Frontend
- [ ] `http://localhost:5173` — homepage loads correctly
- [ ] Search returns results (try "sunglasses")
- [ ] Product images load from Supabase

### Admin CRM
- [ ] `http://localhost:5173/admin/login` — login page loads
- [ ] Login with `admin@velore.local` works
- [ ] Products list shows seeded data
- [ ] Uploading a product image saves to Supabase bucket

### Prescription Lenses (Core Feature)
- [ ] Find a product in the "Lenses" category
- [ ] Prescription dropdown appears on the product page
- [ ] Selecting a prescription updates stock
- [ ] Adding to cart shows prescription details in the cart

### Team Collaboration
- [ ] Image uploaded by one teammate appears for the other without any file sharing

---

## Port Reference

| Service | Port | URL |
|---------|------|-----|
| Backend API | 3000 | `http://localhost:3000` |
| Frontend | 5173 | `http://localhost:5173` |
| Admin CRM | 5173 | `http://localhost:5173/admin` |
| AI Service | 5001 | `http://localhost:5001` |
| Neon PostgreSQL | Cloud | No local port |
| Supabase Storage | Cloud | `https://[project].supabase.co/storage/v1/object/public/products/` |

---

## Troubleshooting

| Problem | Solution |
|---------|---------|
| Database connection fails | Verify `DATABASE_URL` includes `?sslmode=require` at the end |
| `Error: P1012` | Run `npx prisma generate` to regenerate the Prisma client |
| Images not loading | Confirm the Supabase `products` bucket is set to public |
| Image upload fails | Verify `SUPABASE_SERVICE_KEY` is the anon public key, not the service role key |
| Frontend shows blank page | Check `VITE_API_URL` in `frontend/.env` — must end with `/api/v1` |
| Admin login returns 401 | Re-run `npx prisma db seed` and confirm the user exists in Neon |
| Prescriptions not showing | The product's category must be set to `Lenses` in the database |
| Port 5173 already in use | Run `npm run dev -- --port 5174` |

---

### Test Your Neon Connection

```bash
cd backend
npx prisma db pull --force
# Success means your DATABASE_URL is correct
```

### Test Your Supabase Connection

Upload a test file to confirm your bucket and keys are configured correctly:

```bash
curl -X POST "https://[your-project].supabase.co/storage/v1/object/products/test.jpg" \
  -H "apikey: YOUR_ANON_KEY" \
  --data-binary @test.jpg
```