# Prisma Schema Audit (backend/prisma/schema.prisma)

This audit describes the **existing** `backend/prisma/schema.prisma` as found in the repo.  
It does **not** rewrite or replace the schema. It identifies gaps, risks, and what must be preserved.

## 1) Prisma datasource provider

Current datasource:
- **Provider**: `postgresql`
- **URL**: `env("DATABASE_URL")`
- **directUrl**: `env("DIRECT_URL")`

Assessment:
- PostgreSQL is correctly selected.
- `DATABASE_URL` is required and used across the backend (`PrismaClient({ datasourceUrl: process.env.DATABASE_URL })`).
- `DIRECT_URL` is optional in many setups but **commonly used** when:
  - you use a pooler/transaction mode URL for `DATABASE_URL` (e.g., Supabase pooler),
  - and want migrations/introspection to run via a direct connection.

Actionable notes:
- Add `DIRECT_URL` to `backend/.env.example` (currently missing) because schema expects it.

## 2) Prisma generator

Current generator:
- `provider = "prisma-client-js"`
- `binaryTargets = ["native", "linux-musl-openssl-3.0.x"]`

Assessment:
- This is consistent with a Dockerized Node backend (`node:alpine` uses musl).
- Keeping the musl binary target is good for container dev/prod.

## 3) Existing enums

**No Prisma enums** exist in the current schema.

Impact:
- Many “status/type/method” fields are currently `String` and rely on application-level validation.
- Introducing enums later is possible but **migration-sensitive** (especially with existing data).

## 4) Existing models (what exists today)

The schema is strongly oriented around an e-commerce database with additional “AI recommendation”, “audit logs”, “loyalty”, “blog”, and “wishlist/cart” domains.

### Identity & Access
- `users`
  - PK: `user_id BigInt @id @default(autoincrement())`
  - Uniques: `email`, optional `google_id`, optional `facebook_id`, `user_id` implicit
  - Auth fields: `password` (must be treated as a **hash**), `reset_token`, `reset_token_expires`
  - Status flags: `is_active` boolean
  - Role: `role_id BigInt? @default(3)` with relation to `Role`
  - Relations: addresses, orders, carts, wishlists, sessions, reviews, notifications, etc.
  - Timestamps: `created_at`, `updated_at`, `last_login` (some nullable)
- `Role` (mapped to `roles`)
  - PK: `role_id BigInt`
  - Unique: `name`
  - Relations: `admin[]`, `users[]`
  - Timestamps mapped to `created_at` / `updated_at`
- `admin`
  - PK: `admin_id BigInt`
  - Unique: `email`
  - `password_hash` (good separation vs `users.password`)
  - Optional `role_id` to `Role`
  - Relations: audit logs
- `sessions`
  - PK: `session_id BigInt`
  - Unique: `session_token`
  - Relation to `users`

Key issue:
- The system currently uses **two identity tables**: `users` and `admin`.
  - This is workable but adds complexity (two login flows, two JWT token shapes).
  - CRM expansion tends to favor a unified “User + Role” model, but merging later is a high-risk migration.

### Customer data
- `addresses`
  - PK: `address_id BigInt`
  - FK: `user_id` → `users.user_id` (`onDelete: Cascade`)
  - Relations: `orders[]`

### Catalog
- `products`
  - PK: `product_id BigInt`
  - Money: `price Decimal(10,2)` (good), `compare_price Decimal?`
  - FK: `category_id`, `brand_id`
  - Status-ish flags: `is_active`, `is_bundle`, `prescription_ready`, `virtual_try_on`
  - Attributes: many are `String?` (e.g. `frame_shape`, `face_shape`, `gender`, `material`)
  - Relations: `brands`, `categories`, variants, reviews, cart items, order items, wishlist items, AI recs
  - Indexes: brand, category
- `product_variants`
  - PK: `variant_id BigInt`
  - Unique: `sku` (good)
  - `images String[]` (Postgres array)
  - Money: `price_adjustment Decimal?`
  - Inventory: `stock_quantity Int?`, `low_stock_alert Int?`
  - FK: `product_id`
  - Relations: cart items, order items, prescription inventory
- `brands`
  - PK: `brand_id BigInt`
  - No slug; `name` is not unique
- `categories`
  - PK: `category_id BigInt`
  - No slug; `name` is not unique

### Cart/Wishlist/Favorites
- `carts` (1:1 with users)
  - PK: `carts_id BigInt`
  - Unique: `user_id` (enforces one cart per user)
- `cart_items`
  - PK: `cart_item_id BigInt`
  - FK: `cart_id`, `product_id`, optional `variant_id`
  - Uniques: `@@unique([cart_id, product_id, variant_id])`
  - `prescription_data Json?`
- `wishlists` (1:1 with users)
- `wishlist_items`
  - Unique: `@@unique([wishlist_id, product_id])`

Note:
- Backend API exposes `/favorites` endpoints, but schema uses `wishlists`/`wishlist_items` rather than a dedicated `favorites` table. That’s fine if “favorites == wishlist”, but it must stay consistent.

### Orders & Payments
- `orders`
  - PK: `order_id BigInt`
  - FK: `user_id`, `address_id`
  - `status String? @default("pending")`
  - Loyalty-related: points redeemed, discount from points
  - Relations: `orders_items[]`, `payments?`, `reviews?`
- `orders_items`
  - PK: `order_item_id BigInt`
  - FK: `order_id`, `product_id`, optional `variant_id`
  - Money: unit/total price decimals
  - `prescription_data Json?`
- `payments`
  - PK: `payment_id BigInt`
  - Unique: `order_id` (enforces 1 payment record per order)
  - Money: `amount Decimal(10,2)`
  - Status: `status String? @default("pending")`
  - `gateway_response Json?`
  - `transaction_id BigInt?` (likely should be string/provider reference later)

### Reviews
- `reviews`
  - PK: `review_id BigInt`
  - Unique: `order_id` (enforces one review per order)
  - FK: `user_id`, optional `product_id`
  - `status String? @default("pending")`

### Blog/Content
- `blog_posts`
  - PK: `post_id BigInt`
  - Unique: `slug` (good)
  - Fields: title, excerpt, content, image, author, category, read_time, is_published
  - Timestamp fields exist

### CRM-ish / Ops / Analytics
- `audit_logs`
  - PK: `log_id BigInt`
  - FK: optional `admin_id`
  - `action`, `details`
- `contact_messages` (support/contact)
- `notifications` (user notifications)
- `reports` (JSON report_data)
- `feedback` (product feedback)

### AI-related
- `face_images`
  - stores `image_data Bytes` linked to `users`
- `ai_recommendations`
  - links `users` ↔ `products`, with `face_shape` and `confidence Decimal(3,2)`
- `embeddings`
  - `embedding Unsupported("vector")?` (requires Postgres extension `pgvector`)

### Loyalty
- `loyalty_transactions`
  - links to `users` and optionally `orders`

## 5) Relationship audit (what’s good vs risky)

What’s good:
- Most major relationships exist: user→orders, order→items, product→variants, carts/wishlists 1:1 with user.
- Many key uniques exist: user email, variant sku, blog slug, session_token.

Risks / unclear areas:
- **Cascade deletes** on customer-linked tables (e.g., addresses → users cascade) can be dangerous in real workflows.
  - Orders/payments/audit logs should generally **not** cascade delete.
- The `users.role_id @default(3)` implies “role 3 exists” (seed dependency).
- `brands.name` and `categories.name` are not unique; there are no slugs.
- `reviews.order_id @unique` means “one review per order”. That’s fine if intended, but it prevents per-item reviews.
- `payments.transaction_id BigInt?` is not a typical representation for a gateway reference (usually string).
- The presence of `embeddings.embedding Unsupported("vector")?` implies **DB extension requirement** and migration complexity.

## 6) Data type audit

Good:
- Money fields are mostly `Decimal(10,2)` (products, order items, payments).

Issues / improvement candidates:
- Many status/type fields are `String` (`orders.status`, `reviews.status`, `payments.status`, `loyalty_transactions.type`).
  - Enums would be safer long-term but are migration-sensitive.
- `products.details String?` likely should be `@db.Text` if it holds long content.
- `blog_posts.content String` likely should be `@db.Text`.
- `product_variants.images String[]` is fine, but a normalized `ProductImage` table is usually better for CRM workflows.

## 7) Constraint audit (missing/weak constraints)

Present:
- `users.email @unique`
- `product_variants.sku @unique`
- `blog_posts.slug @unique`
- `sessions.session_token @unique`
- cart/wishlist composite uniques

Missing / weak:
- No brand/category slugs or uniques on names.
- No product slug/SKU at product level (variants cover SKU).
- Many “status” strings have no check constraints/enums.

## 8) Security and privacy audit

High-signal findings:
- `users.password` is named “password” but is used as a hash in backend code. Still:
  - Naming is risky (developers might accidentally treat it as plaintext).
  - Consider renaming to `password_hash` later (high migration risk).
- Password reset tokens are stored on `users`:
  - Works, but a dedicated token table allows audit/history/multiple tokens and safer cleanup.
- `face_images.image_data Bytes` stores raw face images in DB:
  - Privacy risk (PII/biometric). You may prefer storing a file reference + encrypted storage instead.
- Payments table stores `gateway_response Json?`:
  - Ensure you never store card PAN/CVV (Stripe generally won’t return them; still be cautious).

## 9) Migration risk audit

Highest risks if you “modernize” directly:
- Switching primary keys from `BigInt` to UUID across all models is a **large breaking migration**.
- Merging `admin` and `users` would be a breaking migration.
- Converting string status fields to enums requires careful data cleanup and phased rollout.
- Adding slugs/uniques for brands/categories needs deduplication handling.
- Introducing/using `pgvector` requires enabling extension and ensuring hosting supports it.

## 10) CRM readiness audit (as-is)

Already supports:
- Admin accounts (`admin`) + audit logs (`audit_logs`)
- Customer list (`users`) + activity hints (`sessions`, `orders`, `payments`)
- Product catalog + variants + stock quantity fields
- Blog posts
- Contact messages
- Loyalty transactions
- Basic AI recommendation storage (`ai_recommendations`)

Missing for a “professional CRM”:
- Staff profiles / staff permissions as data (RBAC exists in code, but not enforced via DB-driven permissions)
- Customer notes, tasks, task comments
- Support tickets with status lifecycle
- Inventory stock movements/history (you only have current `stock_quantity`, no movement ledger)
- Order status history, shipments, refunds as separate entities
- System settings table

## 11) Frontend/backend connection readiness (schema support)

Supported by schema:
- Product listing/detail (products + variants)
- Cart for logged-in users (carts + cart_items)
- Wishlist/favorites concept (wishlists + wishlist_items)
- Checkout/order creation (orders + orders_items + addresses + payments)
- Reviews (reviews)
- Blog (blog_posts)
- Admin dashboard/audit logs (admin + audit_logs)

Likely mismatches:
- Frontend expects certain response shapes and IDs; DB uses BigInt but frontend may treat IDs as number/string inconsistently.
- Backend controllers sometimes serialize BigInt to string; frontend should treat IDs as strings.

---

## Keep / Modify / Merge / Delete (per model)

This is a **planning classification** only (no code changes yet).

| Model | Keep / Modify / Merge / Delete | Reason | Risk | Needed Change |
|-------|-------------------------------|--------|------|--------------|
| Role | Keep (Modify later) | Core access control | Medium | Consider enum/DB-driven permissions later |
| users | Keep (Modify later) | Core customer identity | High | Rename `password`→`password_hash` later (migration); add soft delete; reconsider reset token storage |
| admin | Keep (Modify later) | Admin identity separated today | High | Decide whether to unify with `users` or keep separate; add explicit role/permissions strategy |
| sessions | Keep | Supports auth sessions/activity | Low | Add indexes on expiry if needed |
| addresses | Keep (Modify) | Required for orders | Medium | Remove unsafe cascades; add normalized address fields/validation later |
| brands | Keep (Modify) | Catalog dimension | Low | Add unique slug; consider unique name |
| categories | Keep (Modify) | Catalog dimension | Low | Add unique slug; consider unique name |
| products | Keep (Modify) | Core catalog | Medium | Add slug; normalize long text; formal product status enum later |
| product_variants | Keep (Modify) | SKU + inventory | Medium | Normalize images; add stock movement history models |
| prescription_inventory | Keep (Modify) | Rx stock dimension | Medium | Validate uniqueness strategy; might become inventory ledger-driven |
| carts | Keep | Cart root | Low | Consider guest cart persistence strategy (optional) |
| cart_items | Keep | Cart lines | Low | Ensure variant/product modeling is consistent; index tuning |
| wishlists | Keep | Wishlist root | Low | Align naming with “favorites” in API/docs |
| wishlist_items | Keep | Wishlist lines | Low | Possibly add timestamps/soft delete |
| orders | Keep (Modify) | Core commerce | High | Add status history + shipment tables; avoid unsafe cascades |
| orders_items | Keep | Order lines | Medium | Consider per-item review support |
| payments | Keep (Modify) | Payment tracking | High | Replace `transaction_id BigInt?` with provider reference string; add transactions table |
| reviews | Keep (Modify) | Reviews moderation/status | Medium | Consider product-only reviews vs order review constraints |
| blog_posts | Keep (Modify) | Content system | Low | Add blog categories table; `content @db.Text` |
| contact_messages | Keep | Support/contact | Low | Upgrade to ticket system later |
| audit_logs | Keep (Modify) | Governance | Medium | Add actor metadata; avoid cascade deletes |
| notifications | Keep (Modify) | User notifications | Low | Add read/seen timestamps; type enum later |
| reports | Keep (Modify) | Analytics placeholder | Medium | Define report types/ownership |
| feedback | Keep (Modify) | Feedback links | Low | Clarify overlap with reviews |
| ai_recommendations | Keep (Modify) | AI output storage | Medium | Add analysis/run metadata; provenance; model version |
| face_images | Modify | Biometric storage | High | Prefer file references/encryption; retention policy |
| embeddings | Modify (or Defer) | Vector search readiness | High | Requires pgvector extension + operational plan |
| loyalty_transactions | Keep (Modify) | Loyalty ledger | Medium | Constrain `type` values; add refs |
| migrations | Delete/Ignore (Prisma) | Looks like app-level tracking table | Medium | Confirm if used; Prisma typically manages `_prisma_migrations` separately |

