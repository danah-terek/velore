# CRM/Admin Module Plan (Incremental, schema-aware)

This plan is written against the **current schema** and backend structure.
It avoids proposing destructive schema rewrites before migrations are planned.

## What exists today

Backend:
- Admin auth: `backend/src/features/admin/*`
- Admin JWT middleware: `backend/src/shared/middleware/middleware.js` (`adminAuthMiddleware`)
- RBAC gating: `backend/src/features/rbac/index.js` (hardcoded permission map)
- Admin audit logs table exists in Prisma: `audit_logs`
- Admin users table exists: `admin`

Frontend:
- Admin routes in `frontend/src/App.jsx`:
  - `/admin/login`, `/admin`, `/admin/*`
- Admin UI shell and components exist under:
  - `frontend/src/features/admin/*`
  - `frontend/src/components/admin/*`

## Immediate CRM targets (API-first)

### 1) CRM Customers
Goal: a real CRM view over `users`, `orders`, `payments`, `sessions`.

Planned endpoints:
- `GET /api/v1/crm/customers`
- `GET /api/v1/crm/customers/:id`
- `PATCH /api/v1/crm/customers/:id/status`

Schema impact (later):
- Add `customer_notes`
- Add `customer_activity` (or derive from `sessions/orders/audit_logs`)

### 2) CRM Tasks
Goal: internal tasks & follow-ups (this does not exist in schema yet).

Planned endpoints:
- `POST /api/v1/crm/tasks`
- `GET /api/v1/crm/tasks`
- `PATCH /api/v1/crm/tasks/:id`
- `POST /api/v1/crm/tasks/:id/comments`

Schema impact (later):
- Add `crm_tasks`, `crm_task_comments`

### 3) CRM Tickets / Support
Goal: move beyond basic `contact_messages`.

Planned endpoints:
- `GET /api/v1/crm/tickets`
- `POST /api/v1/crm/tickets`
- `PATCH /api/v1/crm/tickets/:id/status`

Schema impact (later):
- Either evolve `contact_messages` into tickets, or add new `support_tickets` and map contact → ticket.

### 4) CRM Inventory Operations
Goal: inventory history and auditability. Today you only have `product_variants.stock_quantity`.

Planned endpoints:
- `POST /api/v1/crm/inventory/adjust`
- `GET /api/v1/crm/inventory/movements`

Schema impact (later):
- Add `stock_movements` ledger table (recommended)

## RBAC evolution (code → data)

Current RBAC is hardcoded in `backend/src/features/rbac/index.js`.  
For a senior project, plan to evolve to:
- DB-driven roles/permissions (tables), or
- strict enums + permission mapping with tests

Keep short-term:
- Current `Role` model exists and is used
- Ensure admin JWT includes `role` and `isAdmin`

