# CRM Inventory / Stock Control Report (crm branch)

Date: 2026-05-08

## 1) Summary

Problem: storefront and backend allowed ordering quantities above `product_variants.stock_quantity`, causing overselling risk and inaccurate inventory.

Fix: inventory is now enforced by the backend (source of truth) in:

- Cart add (`POST /api/v1/cart/add`)
- Cart quantity update (`PUT /api/v1/cart/update`)
- Order checkout (`POST /api/v1/orders/checkout`)

Stock is deducted **exactly once** during order creation using a Prisma transaction with guarded decrements to prevent negative stock.

Frontend adds UX caps/messaging but does not replace backend enforcement.

## 2) Cart stock validation (backend)

File: `backend/src/features/cart/cart.service.js`

### Add to cart

- Resolves the effective variant:
  - If `variant_id` is provided → validates that variant belongs to product.
  - If missing → selects a default variant (oldest created) as a compatibility fallback.
- Computes `totalRequested = existing.quantity + incoming.quantity` for the same cart/product/variant.
- Rejects if `totalRequested > stock_quantity`.
- Error message:
  - `Only X units available for [Product Name].`

### Update quantity

- Validates `newQuantity <= stock_quantity` for the resolved variant.
- Allows decreasing quantity anytime; rejects increases beyond stock.
- Error message is the same as add-to-cart.

## 3) Cart response stock data (backend → frontend UX)

File: `backend/src/features/cart/cart.service.js`

`GET /api/v1/cart` now includes, per cart item:

- `available_stock` (from the item variant’s `stock_quantity`)
- `sku` (variant SKU when available)
- `images` (variant images when available)

This supports storefront UX like disabling “+” and warning when cart quantities exceed stock.

## 4) Checkout/order stock validation + deduction (backend)

File: `backend/src/features/orders/order.service.js`

### Stock validation

Inside a single Prisma transaction:

- Resolves each order item to a variant in the database.
- Re-checks `quantity <= current stock_quantity`.
- If any item is insufficient, the entire checkout fails and no order is created.

### Stock deduction strategy (chosen)

Because the current payment controller does not reliably create/finalize orders, stock is deducted at **order creation time**:

- For each item, performs a guarded decrement:
  - `updateMany(where: stock_quantity >= quantity, data: decrement)`
- If any decrement fails, the transaction throws and rolls back the entire order.
- This prevents stock going below 0.

### Guest checkout variant handling (limitation)

- If guest payload includes `variant_id`, it is used and validated.
- If missing:
  - If the product has exactly 1 variant → it’s used.
  - If the product has multiple variants → checkout is rejected with:
    - `Please select a product variant before checkout.`

### Price trust

- Guest item prices are **not trusted**. Unit price is computed from DB product price + variant adjustment.

## 5) Transaction / race-condition handling

- Uses `prisma.$transaction()` to ensure:
  - stock validation
  - stock decrement
  - order creation
  - payment record creation
  - cart clearing (logged-in)
  are atomic.
- Guarded `updateMany` prevents negative stock and reduces oversell risk.
- Remaining risk (documented): in extremely high contention scenarios, row-level locking behavior depends on Postgres and timing; guarded decrement inside a transaction is the safest available pattern without adding reservation tables/migrations.

## 6) Storefront UX changes (frontend)

### Product detail

File: `frontend/src/features/product/ProductDetail.jsx`

- Quantity selector “+” is capped at `selectedVariant.stock_quantity`.
- Shows:
  - “Out of stock” (and disables add-to-cart) when stock is 0
  - “Only X left” when stock is low
- If backend rejects add-to-cart, shows the backend message in-page (no silent failure).

### Guest cart variant handling

Files:

- `frontend/src/features/product/ProductDetail.jsx`
- `frontend/src/shared/components/eyewear/EyewearCard.jsx`

Guest cart entries now store:

- `variantId` (when known)
- `availableStock` (when known)

Quantities are clamped for UX when stock is known, but backend remains final authority.

### Cart sidebar

File: `frontend/src/features/cart/CartSidebar.jsx`

- Uses `available_stock` / `product_variants.stock_quantity` when available.
- Disables “+” when quantity reaches available stock.
- If quantity exceeds available stock (admin reduced inventory):
  - shows warning
  - blocks checkout until user reduces quantity
- Backend errors are displayed in the UI (not console-only).

### Checkout

File: `frontend/src/features/checkout/Checkout.jsx`

- Disables confirm button if known cart quantities exceed available stock.
- If backend rejects checkout due to stock, displays backend message and does not proceed.
- Keeps the existing empty-cart totals fix (subtotal/shipping/discount/total = 0).

## 7) Tests added

File: `backend/tests/unit/stock-control.test.js`

Coverage:

- cart add rejects cumulative quantity > stock
- cart update rejects quantity > stock
- guest checkout rejects quantity > stock
- successful checkout decrements stock (guarded decrement invoked)
- guarded decrement prevents negative stock

## 8) Verification results

Backend:

- `npx prisma validate`: PASS
- `npx prisma migrate status`: PASS
- `npm test`: PASS
- `npm run verify:images`: PASS

Frontend:

- `npm run build`: PASS
- `npm run lint`: PASS (known existing warnings only)

## 9) Remaining gaps / follow-ups

- Implement a full Stripe confirm flow that updates `payments.status` and (if desired) moves stock deduction to payment confirmation. Ensure no double-deduct.
- Consider adding explicit “inventory reservation” (requires schema/workflow changes) for payment methods that can fail after order creation.
- Ensure all entry points that can add to cart supply `variant_id` (guest + quick-add cards) for multi-variant products.

