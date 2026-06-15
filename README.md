# 👓 Velore

Velore is a complete eyewear e‑commerce solution that bridges the gap between online shopping and the in‑store experience. Customers can try on frames virtually using AI face tracking, order prescription lenses with per‑prescription inventory tracking, and manage everything through a modern admin dashboard.

**Built by:** Danah El Terek & Lea Mazmanian

---

## ✨ Key Features

### 🔍 Smart Search & Discovery
- Debounced search across product names, brands, categories, frame shapes, and materials
- Popular product recommendations when no search term is entered

### 👓 Prescription Lenses (Core Innovation)
- Full support for **SPH, CYL, Axis, BC, DIA** prescription fields
- Each lens prescription has its own **stock quantity** — different powers are tracked independently
- Customers select their exact prescription from a dynamic dropdown
- Cart and checkout display prescription details
- Admin panel for managing prescriptions per variant

### 🤖 AI Virtual Try‑On
- **468 facial landmark detection** for accurate frame placement
- Real‑time AR overlay using device camera
- Privacy‑first: images are **never stored**, processing happens on‑device
- Works on any device with a camera — no app download required

### 🛒 Smart Cart System
- Guest cart stored in `localStorage` — no account needed to start shopping
- Seamless merge when user logs in (no items lost)
- Optimistic UI updates — cart feels instant
- Free shipping progress bar, quantity controls, stock validation

### 📦 Advanced Variant Management
- Products support unlimited colors and sizes
- Each variant has its own images, stock, price adjustment
- For lenses: **nested prescriptions** (variant → multiple prescriptions)
- Variant switching updates images, price, and stock instantly — zero extra API calls

### 👤 Profile & Loyalty
- Order history with expandable details
- Loyalty points: **10 points per $100 spent**, redeemable for discounts
- Real‑time notifications for order updates
- Write reviews for delivered products

### 🛡️ Admin Dashboard (CRM)
- **Product management**: CRUD with variant + prescription support
- **Order management**: Update status (pending → processing → shipped → delivered)
- **User management**: View, enable/disable, delete customers
- **Role‑based access control**: Super Admin vs Staff Admin
- **Audit logging**: Every admin action is recorded
- **Banner management**: Dynamic scrolling announcements

### 💳 Payments
- Multiple payment methods: Cash on Delivery, Credit/Debit card, Whish Money simulation
- Discount codes and loyalty points applied at checkout

### 📱 Responsive Design
- Mobile‑first approach — works perfectly from 320px to 4K
- Horizontal scroll product rows, slide‑out cart, mobile‑optimized navigation

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Client (Browser)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  Storefront │  │  Admin CRM  │  │ AI Try‑On (Camera)  │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Express.js REST API (Node.js)                  │
│          • JWT Authentication  • RBAC  • File uploads       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  PostgreSQL + Prisma ORM                    │
│     • products → product_variants → variant_prescriptions   │
│     • users → orders → payments                             │
│     • carts, wishlists, reviews, notifications              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              AI Service (FastAPI - optional)                 │
│         • 468 facial landmark detection                     │
│         • Face shape classification                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Vite, Tailwind CSS, Framer Motion, Swiper.js |
| **State Management** | React Context (Cart, Favorites, Currency) |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL (Neon), Prisma ORM |
| **Authentication** | JWT (JSON Web Tokens) |
| **Payments** | Stripe Elements |
| **AI / Try‑On** | FastAPI (Python), MediaPipe, Device Camera API |
| **Image Storage** | Supabase Storage |
| **HTTP Client** | Axios |
| **Development** | Nodemon, Concurrently |

---

## 📁 Project Structure

```
velore/
├── frontend/                  # React + Vite storefront
│   ├── src/
│   │   ├── features/          # Shop, cart, checkout, product, admin
│   │   ├── shared/            # Contexts, hooks, components, utils
│   │   └── assets/            # Images, fonts, videos
│   └── package.json
│
├── backend/                   # Node.js + Express API
│   ├── src/
│   │   ├── features/          # Products, cart, orders, users, admin
│   │   ├── shared/            # Database, middleware, utils
│   │   └── server.js
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── seed.js
│   └── package.json
│
├── ai-service/                # FastAPI (optional)
├── docs/                      # Documentation
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 20 LTS**
- **npm** or **yarn**
- A **Neon** account (free) — [neon.tech](https://neon.tech)
- A **Supabase** account (free) — [supabase.com](https://supabase.com)

> No local PostgreSQL or Docker required. The project uses Neon (cloud-hosted PostgreSQL) for the database and Supabase for image storage.

### 1) Clone the repository

```bash
git clone https://github.com/danah-terek/velore.git
cd velore
git checkout crm
```

### 2) Backend setup

```bash
cd backend
cp .env.example .env
```

Add your Neon database URL and Supabase credentials to `backend/.env` — see [SETUP.md](SETUP.md) for a full walkthrough.

```bash
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Backend runs at: `http://localhost:3000`

### 3) Frontend setup

```bash
cd ../frontend
cp .env.example .env
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

### 4) AI Service (optional – for virtual try‑on)

```bash
cd ../ai-service
python -m venv venv
source venv/bin/activate      # Linux/macOS
# or: venv\Scripts\activate   # Windows

pip install -r requirements.txt
uvicorn app:app --reload --port 5001
```

> For a detailed setup guide including Neon and Supabase configuration, see [SETUP.md](SETUP.md).

---

## 🔐 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@velore.com | SuperAdmin!123Demo |
| Admin | admin@velore.local | Admin123!Demo |
| Customer | customer1@velore.local | Customer123!Demo |
| Customer | customer2@velore.local | Customer123!Demo |

---

## 📖 Documentation

Detailed documentation is available in the `docs/` folder:

| Document | Purpose |
|----------|---------|
| `SETUP.md` | Full environment setup guide |
| `api-contract.md` | API endpoint documentation |
| `schema-audit.md` | Database schema review |
| `branching-strategy.md` | Git workflow explanation |
| `git-workflow.md` | Commit conventions and PR process |
| `migration-guide.md` | Database migration instructions |

---

## 🧪 Testing

**Backend**
```bash
cd backend
npm test
npm run verify:images
```

**Frontend**
```bash
cd frontend
npm run lint
npm run build
```