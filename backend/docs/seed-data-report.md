# Velore Backend — Demo Seed Data Report

## Canonical seed file

- Prisma runs: `prisma/seed.js` (configured in `package.json` → `prisma.seed`)

## What gets seeded (idempotent)

- **Roles**: `super_admin`, `admin`, `customer`
- **Admin** (demo): `admin@velore.local`
- **Customers** (demo): 3 accounts
- **Categories**: 5 eyewear categories
- **Brands**: 5 premium brands
- **Products**: 12 demo products (created/updated by name+brand+category)
- **Variants**: 1–2 per product (upserted by unique `sku`)
- **Images**: local placeholder paths under `/uploads/products/demo/*.jpg`
- **Blogs**: 4 published posts (upserted by unique `slug`)
- **Orders/Payments/Reviews**: creates 1–2 demo orders *only if the demo users have zero orders* (to avoid duplicates)
  - Seeds an **approved** review for newly created demo orders only
- **Feedback**: a few records (some review reads use `feedback` in code)

## Demo credentials (LOCAL/DEMO ONLY)

Admin:
- Email: `admin@velore.local`
- Password: `Admin123!Demo`

Customers:
- `customer1@velore.local` / `Customer123!Demo`
- `customer2@velore.local` / `Customer123!Demo`
- `customer3@velore.local` / `Customer123!Demo`

These are for local demos only. Do not reuse in production.

## Image path strategy

The schema stores variant images as an array: `product_variants.images: String[]`.

Seeded example paths:
- `/uploads/products/demo/noir-classic-01.svg`
- `/uploads/products/demo/aurelia-gold-round-01.svg`
- `/uploads/blogs/demo/blue-light-guide.svg`

Note: this repo currently contains only `uploads/.gitkeep`, so these images are **placeholders**. Add real demo images later under:

- `backend/uploads/products/demo/`
- `backend/uploads/blogs/demo/`

## How to run seed

```bash
npx prisma db seed
```

## How to verify

### API

- `GET /api/v1/test-db` (now includes counts for products/categories/brands/blogs/reviews)
- `GET /api/v1/products`
- `GET /api/v1/products/search?q=sun`
- `GET /api/v1/categories`
- `GET /api/v1/brands`
- `GET /api/v1/reviews/approved`
- `GET /api/v1/blogs`

### pgAdmin

Servers → velore_db → Schemas → public → Tables

Recommended tables to inspect:
- `products`, `product_variants`
- `categories`, `brands`
- `blog_posts`
- `users`
- `reviews`, `feedback`

## Notes

- The seed is designed to be safe to run multiple times using **upsert** where possible and “find-or-create” for non-unique entities.
- Orders/reviews are only created if the demo users have no orders yet (prevents duplicate demo orders each run).

## Serving demo images locally

The backend serves uploads statically:

- `/uploads/*` → `backend/uploads/*`

Verify from the backend host:

- `http://localhost:3000/uploads/products/demo/noir-classic-01.svg`
- `http://localhost:3000/uploads/blogs/demo/blue-light-guide.svg`

## Frontend integration note (important)

The API returns **relative** image paths like:

- `/uploads/products/demo/noir-classic-01.svg`
- `/uploads/blogs/demo/blue-light-guide.svg`

If the frontend is running on a different origin (ex: `http://localhost:5173`), it must either:

- prepend the backend origin (ex: `http://localhost:3000`), or
- proxy `/uploads` to the backend in dev.

