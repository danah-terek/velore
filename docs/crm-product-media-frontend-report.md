# CRM Product Media / Variants Frontend Report (crm branch)

Date: 2026-05-08

## 1) Overview

This implementation wires the CRM UI to **real backend endpoints** for:

- Product image uploads (returns `/uploads/...` paths)
- Variant CRUD (list/create/update/delete with RBAC)
- Admin product detail (for edit page)
- Admin product list additive fields (`thumbnail`, `total_stock`)

No Prisma schema changes, no migrations, no `db push`, no database reset.

## 2) Backend endpoints used (real)

- Upload: `POST /api/v1/admin/uploads/product-images`
- Variants:
  - `GET /api/v1/admin/products/:productId/variants`
  - `POST /api/v1/admin/products/:productId/variants`
  - `PATCH /api/v1/admin/variants/:variantId`
  - `DELETE /api/v1/admin/variants/:variantId` (super admin only)
- Admin product detail: `GET /api/v1/admin/products/:id`
- Admin product list (includes `thumbnail`, `total_stock`): `GET /api/v1/admin/products`

All calls are made via `adminApiClient` (admin token only).

## 3) Product create with optional default variant

Implemented behavior:

- Product fields are validated first.
- If image files are selected:
  - Files are validated client-side for allowed types and max 5MB per file
  - Upload happens through the real upload endpoint
  - **SKU becomes required** (blocked with: "SKU is required when creating a variant with images.")
- Product is created via `POST /api/v1/products`
- If the default variant section has values and/or uploaded images, a default variant is created via:
  - `POST /api/v1/admin/products/:productId/variants`
- If product creation succeeds but variant creation fails:
  - UI shows a clear **partial-success message**
  - Redirects to `/admin/products/:id/edit` so the admin can fix the variant

No fake upload success and no fake image paths.

## 4) Image upload UI

Implemented in product create:

- Multi-file picker (`accept` includes jpeg/png/webp/svg)
- Local previews using object URLs (revoked on remove/replace)
- Shows backend-returned image paths and previews using `resolveImageUrl()`
- Allows removing:
  - selected local image prior to save
  - uploaded image path prior to save (so it won't be saved to the variant)
- Upload errors are shown using backend error messages (preserved from envelope)

Note: variant image management on edit is handled in the Variant Manager.

## 5) Variant Manager (edit page)

On `/admin/products/:id/edit`:

- Loads variants using `GET /api/v1/admin/products/:productId/variants`
- Lists variants with editable fields:
  - `sku`, `stock_quantity`, `low_stock_alert`, `color_name`, `color_hex`, `size`, `price_adjustment`
- Update variant via `PATCH /api/v1/admin/variants/:variantId`
- Upload additional images via `POST /api/v1/admin/uploads/product-images`, then merges returned `/uploads/...` paths into the variant draft
- Remove image paths from a variant draft prior to saving
- Delete variant:
  - **Super Admin only** (UI disabled for staff and enforced by backend)
  - Inline click-again confirmation (no `alert()` / `confirm()`)

Duplicate SKU and validation errors are displayed from backend messages.

## 6) Products table: thumbnail + total stock

`/admin/products` list now shows:

- Thumbnail preview using `resolveImageUrl(thumbnail)` (falls back to icon if missing)
- Total stock column from `total_stock`
- Low-stock badge when \(0 < total\_stock \le 5\)

No N+1 detail calls are used.

## 7) Inventory page: real data (safe)

`/admin/inventory` is now enabled with a **product-level stock summary** using:

- `GET /api/v1/admin/products` (single call)

Displays:

- product name
- thumbnail (if available)
- total stock
- status
- action: "Manage variants" → product edit page

Detailed per-variant inventory is intentionally managed in the product edit page to avoid aggressive N+1 fetching.

## 8) Role behavior (UI + backend)

- Staff Admin / legacy admin:
  - Can create product
  - Can edit product
  - Can upload images
  - Can create/update variants
  - Cannot delete variant (disabled) and backend blocks (403)
  - Cannot delete product (existing behavior)
- Super Admin:
  - Can create/edit/delete products (existing behavior)
  - Can upload images
  - Can create/update/delete variants

## 9) Error handling

Handled UI scenarios:

- invalid file type / too large (client-side message)
- upload failure (backend message)
- duplicate SKU (backend 409 message)
- negative stock (backend message)
- variant create/update failure (backend message)
- product create success but variant failure (partial-success message + redirect)
- expired admin token (handled by existing admin auth flow via `adminApiClient` behavior)

## 10) Files changed (frontend)

- `frontend/src/features/admin/services/adminProductService.js`
- `frontend/src/features/admin/products/CRMProductEditor.jsx`
- `frontend/src/features/admin/products/CRMProductForm.jsx`
- `frontend/src/features/admin/products/CRMProducts.jsx`
- `frontend/src/features/admin/inventory/CRMInventory.jsx`
- `frontend/src/features/admin/shared/CRMSectionCard.jsx` (new)

## 11) Remaining gaps / follow-ups

- Optional: add nicer per-variant image grid and per-image delete persistence if desired (current behavior is remove path + save variant)
- Optional: add drag/drop (kept minimal and safe for now)
- Optional: paginate inventory summary beyond first 100 products if needed

