# CRM Product Management Report (crm branch)

Date: 2026-05-08

## 1) Backend endpoint audit (used by CRM)

### Product endpoints

- **Admin list (read)**: `GET /api/v1/admin/products`
- **Product detail (read)**: `GET /api/v1/products/:id`
- **Create (write)**: `POST /api/v1/products` → requires admin JWT + `write:products`
- **Update (write)**: `PATCH /api/v1/products/:id` (PUT also exists) → requires admin JWT + `write:products`
- **Delete (super only)**: `DELETE /api/v1/products/:id` → requires admin JWT + `delete:products`

### Catalog endpoints for dropdowns

- **Categories**: `GET /api/v1/categories`
- **Brands**: `GET /api/v1/brands`

## 2) Product create/update payload shape

Required (backend validation):
- `name` (string)
- `price` (decimal string)
- `category_id` (int)
- `brand_id` (int)

Optional (supported by backend validation):
- `description` (string)
- `compare_price` (decimal string)
- `gender` (`male` | `female` | `unisex`)
- `material` (string)
- `frame_shape` (string)
- `face_shape` (string)
- `is_active` (boolean)

## 3) Variant / stock / images gap (intentional)

Variants, SKUs, stock quantities, and images are stored in `product_variants` and are now supported in CRM using real backend endpoints.

Implemented (CRM):

- Upload images: `POST /api/v1/admin/uploads/product-images`
- Admin product detail: `GET /api/v1/admin/products/:id`
- Variants:
  - `GET /api/v1/admin/products/:productId/variants`
  - `POST /api/v1/admin/products/:productId/variants`
  - `PATCH /api/v1/admin/variants/:variantId`
  - `DELETE /api/v1/admin/variants/:variantId` (super admin only)

## 4) Frontend implementation

### Files changed/added

- `frontend/src/features/admin/services/adminProductService.js`
  - Added: `get`, `create`, `update`, `delete`, `listCategories`, `listBrands`
- `frontend/src/features/admin/AdminApp.jsx`
  - Added routes:
    - `/admin/products/new`
    - `/admin/products/:id/edit`
- `frontend/src/features/admin/products/CRMProductEditor.jsx`
  - Route-based create/edit page
  - Loads categories/brands from real endpoints
  - Loads product detail for edit from `GET /products/:id`
  - Calls create/update using real backend APIs
- `frontend/src/features/admin/products/CRMProductForm.jsx`
  - Field-level validation
  - Loading/error states for dropdown options
  - Variants/stock/images unavailable section
  - Read-only image preview (first variant image if present)
- `frontend/src/features/admin/products/CRMProducts.jsx`
  - Add button → routes to `/admin/products/new`
  - Edit per-row → routes to `/admin/products/:id/edit`
  - Delete per-row **super admin only** with “click again to confirm”
  - Refreshes list after delete; shows success/error banner

## 5) Role behavior

- **Staff Admin / legacy admin**
  - Can **Add** and **Edit**
  - Cannot **Delete** (hidden/disabled in UI; backend also blocks)
- **Super Admin**
  - Can **Add**, **Edit**, **Delete**

## 6) Inventory status

- Inventory page now shows a **real product-level stock summary** using `GET /api/v1/admin/products` (no fake rows, no N+1 variant detail calls).
- Detailed per-variant stock is managed within the product edit page’s Variant Manager.

## 7) Testing results

- Frontend `npm run build`: (run after implementation)
- Frontend `npm run lint`: (run after implementation)
- Backend: not modified for product management UI

## 8) Remaining TODOs

- Optional: add pagination and richer per-variant inventory summary if needed.

