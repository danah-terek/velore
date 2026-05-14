# CRM Product Media / Variants Backend Report (crm branch)

Date: 2026-05-08

## 1) Schema audit summary

- `product_variants` exists and is linked to `products` via `product_id`.
- SKU is required and unique (`product_variants.sku @unique`).
- Stock exists (`stock_quantity`, `low_stock_alert`).
- Images exist (`images String[]`).
- Variant-level active status does **not** exist (no `is_active` on variants).
- `multer` is installed and `/uploads` is already served statically.

## 2) DB migration needed?

**No.** Existing Prisma schema already supports SKU, stock, and multiple images.

## 3) Upload endpoint implemented

### POST `/api/v1/admin/uploads/product-images`

- Requires: `adminAuthMiddleware` + `write:products`
- Field name: `files` (multiple)
- Storage: `backend/uploads/products/admin/` (created if missing)
- Allowed MIME types:
  - `image/jpeg`
  - `image/png`
  - `image/webp`
  - `image/svg+xml`
- Limits: 5MB per file
- Returns: public relative paths only:
  - `/uploads/products/admin/<filename>`

## 4) Variant endpoints implemented

- `GET /api/v1/admin/products/:productId/variants`
  - Requires: admin auth + `read:products`
- `POST /api/v1/admin/products/:productId/variants`
  - Requires: admin auth + `write:products`
  - Validates: `sku` required, stock >= 0, images must be `["/uploads/products/..."]`
  - Rejects external URLs
  - Returns 409 on duplicate SKU
- `PATCH /api/v1/admin/variants/:variantId`
  - Requires: admin auth + `write:products`
  - Validates updates (including image path rules)
  - Returns 409 on duplicate SKU
- `DELETE /api/v1/admin/variants/:variantId`
  - Requires: admin auth + **super admin only**

## 5) Admin product detail endpoint implemented

- `GET /api/v1/admin/products/:id`
  - Requires: admin auth + `read:products`
  - Returns full product detail including variants with:
    - `variant_id`, `sku`, `color_name`, `color_hex`, `size`
    - `price_adjustment`, `stock_quantity`, `low_stock_alert`, `images[]`

Public storefront `GET /api/v1/products/:id` was **not changed**.

## 6) Admin product list improvements

`GET /api/v1/admin/products` now includes additive, backward-compatible fields:
- `total_stock` (sum of variant stock quantities)
- `thumbnail` (first available variant image path, if present)

No existing fields were removed.

## 7) RBAC behavior

- Upload + variant create/update: requires `write:products`
- Variant list + admin product detail: requires `read:products`
- Variant delete: **super admin only**
- Customer tokens cannot access `/api/v1/admin/*` routes due to `adminAuthMiddleware`.

## 8) Validation rules (high level)

- `sku`: required on create, cannot be empty
- `stock_quantity`: integer >= 0
- `low_stock_alert`: integer >= 0 (if provided)
- `price_adjustment`: numeric (if provided)
- `images`: array of strings, each must start with `/uploads/products/`
- Reject `http://` / `https://` external image URLs
- Product must exist before creating a variant
- Variant must exist before updating/deleting
- SKU conflicts return **409**

## 9) Tests added

File: `backend/tests/integration/admin-product-media.test.js`

Coverage:
- Upload without admin token rejected (401)
- Variant list/create without token rejected (401)
- Negative stock rejected (400)
- External image URL rejected (400)
- Invalid update image path rejected (400)
- Staff cannot delete variant (403)
- Public product list still responds (200/500)

## 10) Verification results

- `npx prisma validate`: PASS
- `npx prisma migrate status`: PASS
- `npm test`: PASS
- `npm run verify:images`: PASS

## 11) Remaining gaps / next steps

- Variant disable requires a schema field (e.g., `product_variants.is_active`) → deferred
- If you want staff to update stock without full product write access, introduce `write:inventory` enforcement on stock-only updates (optional future refinement)

Frontend integration is implemented in:

- `docs/crm-product-media-frontend-report.md`

