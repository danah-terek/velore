# API Contract (Backend ↔ Frontend ↔ CRM)

This project uses a **single backend REST API** as the contract boundary.
- Frontend Storefront → Backend API
- Frontend CRM/Admin Dashboard → Backend API (role-protected)
- AI service is called **by the backend**, not directly by the frontend (preferred)

Base path:
- `/api/v1`

## Standard success response

All endpoints should return:

```json
{
  "success": true,
  "message": "Optional message",
  "data": {}
}
```

Notes:
- `data` can be an object, array, or `null` depending on endpoint.
- `message` is optional and used for UX-friendly feedback.

## Standard error response

All errors should return:

```json
{
  "success": false,
  "message": "Human readable error",
  "errors": []
}
```

Notes:
- `message` is the primary message for UI.
- `errors` is optional structured detail (e.g. validation errors).

## Authentication

Header:
- `Authorization: Bearer <jwt>`

Customer auth domain:
- `/api/v1/auth/*`

Admin/CRM auth domain:
- `/api/v1/admin/login` (current code)
- CRM endpoints will be mounted under `/api/v1/crm/*` (planned)

## API domains (required structure)

Customer storefront domains:
- `/api/v1/auth`
- `/api/v1/products`
- `/api/v1/categories`
- `/api/v1/brands`
- `/api/v1/cart`
- `/api/v1/favorites` (currently backed by `wishlists`/`wishlist_items`)
- `/api/v1/orders`
- `/api/v1/payments`
- `/api/v1/reviews`
- `/api/v1/blogs`
- `/api/v1/contact`

CRM/admin domains (planned expansion):
- `/api/v1/crm/customers`
- `/api/v1/crm/tasks`
- `/api/v1/crm/tickets`
- `/api/v1/crm/dashboard`
- `/api/v1/crm/audit-logs`

AI domains (planned expansion):
- `/api/v1/ai/analyze-face`
- `/api/v1/ai/recommendations`

## Current contract mismatch to fix (important)

Frontend `frontend/src/shared/services/apiClient.js` currently unwraps Axios responses:
- It returns `response.data` from Axios.

That means frontend call sites must treat the returned value as the **JSON body**, not an Axios response object.

Chosen standard (runtime stabilization):
- **Keep unwrapping** in `apiClient` and update all call sites to use `{ success, message, data }` directly.

This decision is enforced for the storefront flows (auth/products/cart/favorites/checkout) and should be kept consistent for CRM/admin calls too.

