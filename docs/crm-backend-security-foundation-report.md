# CRM Backend Security Foundation Report (crm branch)

Date: 2026-05-08

## 1) Role strategy

- **Target CRM roles**: `super_admin`, `staff_admin`
- **Legacy roles found**: `super_admin`, `admin`, `customer`
- **Strategy implemented (safe, no migrations)**:
  - Added **`staff_admin`** role creation in `backend/prisma/seed.js` (idempotent upsert).
  - Kept existing `admin` role as **legacy staff-equivalent** to avoid breaking existing admin logins and seeded demo admin.
  - Updated RBAC to treat both `staff_admin` and legacy `admin` as operational-only.

## 2) RBAC permissions

RBAC lives at `backend/src/features/rbac/index.js`.

### Staff operational permissions (staff_admin / legacy admin)

- `read:dashboard_operational`
- `read:products`, `write:products`
- `read:inventory`, `write:inventory` (reserved; endpoints may be added later)
- `read:orders`, `write:orders`
- `read:customers`, `write:customers_status`
- `read:reviews`, `moderate:reviews`
- `read:blogs`, `write:blogs`
- `read:audit_logs`

### Super admin exclusive permissions (enforced by role)

- `read:analytics` (+ all via `*`)
- `delete:customers`
- `delete:products`
- `delete:reviews`
- Staff/settings permissions are reserved for future endpoints: `read:staff`, `write:staff`, `delete:staff`, `read:settings`, `write:settings`

### Compatibility mapping

To avoid breaking existing code during rollout, RBAC normalizes legacy permission names used by existing routes:

- `read:dashboard` → `read:dashboard_operational`
- `read:users` → `read:customers`
- `update:users` → `write:customers_status`
- `delete:users` → `delete:customers`
- `create/update:products` → `write:products`
- `update:orders` → `write:orders`
- `create/update/delete:brands` → `write:brands`
- `create/update/delete:categories` → `write:categories`

## 3) Routes protected (unsafe write routes fixed)

### Products (storefront module)

- **Protected**:
  - `POST /api/v1/products` → admin JWT + `write:products`
  - `PUT/PATCH /api/v1/products/:id` → admin JWT + `write:products`
  - `DELETE /api/v1/products/:id` → admin JWT + `delete:products` (super admin only)
- **Public reads unchanged**:
  - `GET /api/v1/products`, `GET /api/v1/products/:id`, etc.

### Categories (storefront module)

- **Protected**:
  - `POST/PUT/PATCH/DELETE /api/v1/categories...` → admin JWT + `write:categories`
- **Public reads unchanged**:
  - `GET /api/v1/categories...`

### Brands (storefront module)

- **Protected**:
  - `POST/PUT/PATCH/DELETE /api/v1/brands...` → admin JWT + `write:brands`
- **Public reads unchanged**

### Reviews

- **Protected**:
  - `GET /api/v1/reviews/pending` → admin JWT + `read:reviews`
  - `PUT /api/v1/reviews/:id/approve|reject` → admin JWT + `moderate:reviews`
  - `DELETE /api/v1/reviews/:id` → admin JWT + `delete:reviews` (super admin only)
- **Review create safety**:
  - `POST /api/v1/reviews` now requires **customer auth** and derives `user_id` from the token (`req.user.userId`) instead of trusting `user_id` from the request body.
- **Public reads unchanged**:
  - `GET /api/v1/reviews/approved`, `GET /api/v1/reviews/product/:productId`

## 4) Dashboard / revenue separation

- `GET /api/v1/admin/dashboard` now returns **operational data for staff_admin/admin**.
- Revenue is returned **only when `req.admin.role === 'super_admin'`**.
- Added `GET /api/v1/admin/analytics`:
  - **Super Admin only** (`read:analytics` + `requireSuperAdmin`)
  - Uses real aggregations over `payments`, `orders`, `products`, `users` (no fake data).

## 5) Staff management access

- `GET /api/v1/admin/admins` and `POST /api/v1/admin/admins` remain **Super Admin only**.
- Not implemented (requires DB/schema support):
  - freeze/disable staff admin accounts (missing `admin.is_active`)
  - reset password endpoints
  - delete staff endpoints

## 6) Tests added

File: `backend/tests/integration/crm-security-foundation.test.js`

Coverage:
- Rejects product/category/brand writes without token.
- Rejects review delete without token.
- Ensures `staff_admin` cannot access staff management.
- Ensures `staff_admin` cannot access analytics.
- Ensures `super_admin` is not blocked by auth/RBAC for analytics (test tolerates 200/500 when DB isn’t present).

## 7) Verification results

- Prisma validate: **(run after implementation)**
- Prisma migrate status: **(run after implementation)**
- npm test: **(run after implementation)**
- verify:images: **(run after implementation)**

## 8) Remaining backend gaps (known)

- No dedicated CRM variant/inventory endpoints yet (DB supports variants + stock fields).
- No admin order-detail endpoint yet.
- No admin list-all blogs (including unpublished) endpoint yet.
- No admin “all reviews” endpoint (beyond pending + public approved).
- Staff disable/reset/delete requires DB fields (e.g., `admin.is_active`) → schema change deferred.

