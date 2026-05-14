# CRM Frontend Foundation Report (crm branch)

Date: 2026-05-08

## Summary

This change introduces a **single, premium CRM/admin dashboard** under `/admin/*` with:

- Strict **admin token separation** (`admin_token` only)
- A dedicated **admin API client** that never uses the customer token
- Role-aware navigation + route guards:
  - `super_admin` full CRM
  - `staff_admin` + legacy `admin` operational only
- Real API wiring only (no fake rows, no fake charts, no fake revenue)

## Files changed (high level)

### Auth / routing

- `frontend/src/App.jsx` (routes `/admin/*` → CRM app)
- `frontend/src/shared/services/apiClient.js` (storefront client no longer reads/sends `admin_token`)
- `frontend/src/features/admin/AdminApp.jsx`
- `frontend/src/features/admin/auth/AdminAuthContext.jsx`
- `frontend/src/features/admin/auth/AdminLogin.jsx`
- `frontend/src/features/admin/auth/AdminProtectedRoute.jsx`
- `frontend/src/features/admin/auth/AdminRoleGuard.jsx`

### Admin service layer (admin_token only)

- `frontend/src/features/admin/services/adminApiClient.js`
- `frontend/src/features/admin/services/adminAuthService.js`
- `frontend/src/features/admin/services/adminDashboardService.js`
- `frontend/src/features/admin/services/adminProductService.js`
- `frontend/src/features/admin/services/adminOrderService.js`
- `frontend/src/features/admin/services/adminCustomerService.js`
- `frontend/src/features/admin/services/adminReviewService.js`
- `frontend/src/features/admin/services/adminBlogService.js`
- `frontend/src/features/admin/services/adminStaffService.js`
- `frontend/src/features/admin/services/adminAnalyticsService.js`
- `frontend/src/features/admin/services/adminInventoryService.js` (explicit unavailable placeholder)

### Layout + shared UI system

- `frontend/src/features/admin/layout/CRMLayout.jsx`
- `frontend/src/features/admin/layout/CRMSidebar.jsx`
- `frontend/src/features/admin/layout/CRMTopbar.jsx`
- `frontend/src/features/admin/shared/*` (page header, cards, table, states, buttons, skeletons)

### Pages implemented

- `frontend/src/features/admin/dashboard/CRMDashboard.jsx` → `GET /api/v1/admin/dashboard`
- `frontend/src/features/admin/products/CRMProducts.jsx` → `GET /api/v1/admin/products`
- `frontend/src/features/admin/orders/CRMOrders.jsx` → `GET /api/v1/admin/orders` + `PATCH /api/v1/admin/orders/:id/status`
- `frontend/src/features/admin/customers/CRMCustomers.jsx` → `GET /api/v1/admin/users` + toggle status + super delete
- `frontend/src/features/admin/reviews/CRMReviews.jsx` → `GET /api/v1/reviews/pending`, approve/reject, (super) delete, approved list
- `frontend/src/features/admin/blogs/CRMBlogs.jsx` → `GET /api/v1/blogs` (published only; gap documented)
- `frontend/src/features/admin/analytics/CRMAnalytics.jsx` (super only) → `GET /api/v1/admin/analytics`
- `frontend/src/features/admin/staff/CRMStaff.jsx` (super only) → `GET/POST /api/v1/admin/admins`
- `frontend/src/features/admin/settings/CRMSettings.jsx` (super only) → unavailable (gap documented)
- `frontend/src/features/admin/inventory/CRMInventory.jsx` → unavailable (gap documented)

## Admin auth + token behavior

- **Token key**: `admin_token` (localStorage)
- **Admin profile key**: `velore_admin_user` (localStorage)
- **Customer token key** remains **unchanged**: `token`
- Storefront API client (`shared/services/apiClient.js`) **never reads/sends** `admin_token`.
- Admin API client (`features/admin/services/adminApiClient.js`) **only** reads/sends `admin_token`.
- Invalid/expired admin token: admin client clears `admin_token` and redirects to `/admin/login`.

## Role-based visibility & guards

- Sidebar hides restricted items for staff.
- Route guard enforces restrictions:
  - Super Admin only: `/admin/analytics`, `/admin/staff`, `/admin/settings`
  - Staff/legacy admin get **AccessDenied** on direct navigation

Legacy `admin` role is treated as **staff-equivalent** in the frontend guards and sidebar.

## Real APIs used (no fake data)

- Dashboard: `GET /api/v1/admin/dashboard`
- Analytics: `GET /api/v1/admin/analytics` (super only)
- Products: `GET /api/v1/admin/products`
- Orders: `GET /api/v1/admin/orders`, `PATCH /api/v1/admin/orders/:id/status`
- Customers: `GET /api/v1/admin/users`, `PATCH /api/v1/admin/users/:id/toggle-status`, `DELETE /api/v1/admin/users/:id` (super)
- Reviews: `GET /api/v1/reviews/pending`, `PUT /api/v1/reviews/:id/approve|reject`, `DELETE /api/v1/reviews/:id` (super), `GET /api/v1/reviews/approved`
- Blogs: `GET /api/v1/blogs` (published only)
- Staff: `GET/POST /api/v1/admin/admins` (super)

## Missing backend endpoint gaps (handled via Unavailable states)

- Inventory: no admin inventory endpoint; admin products listing doesn’t include variants/stock
- Settings: no admin settings endpoint
- Blogs: no admin list-all blogs endpoint (drafts/unpublished cannot be managed)
- Charts: Recharts not installed; analytics currently shown as KPI cards only

## Storefront regression protection

- `/admin/*` routes are isolated and do not render storefront `Navbar`/`Footer`.
- Storefront routing remains under `PublicLayout`.
- `resolveImageUrl` left intact and reused for blog images.
- Shared storefront token behavior (`token`) is untouched.

## Tools/libraries used

- React: Yes
- Tailwind CSS: Yes
- lucide-react: Yes
- Everything else: Not used / not installed

## Verification

- Frontend `npm run build`: (run after implementation)
- Frontend `npm run lint`: (run after implementation)
- Backend: not touched in this step

## Remaining TODOs

- Add inventory endpoints or extend admin products endpoint to include variant stock for an inventory table.
- Add admin blogs list-all endpoint for drafts/unpublished management.
- Add admin settings API for real settings management.
- Replace “coming soon” buttons with real forms once endpoints are ready (without mocking).

