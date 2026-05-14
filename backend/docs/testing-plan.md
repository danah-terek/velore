# Velore Backend — Testing Plan

## Current automated tests

This backend uses **Jest + Supertest**.

Run:

```bash
npm test
npm run test:watch
```

## What is covered (minimal smoke tests)

- `GET /health` returns the expected JSON shape.
- Unknown route returns a consistent JSON 404.
- Payments endpoint returns **501** when Stripe is not configured.
- Products list endpoint responds without crashing (even if DB is not ready).
- Loyalty endpoints are protected (no token → 401/403).

## Next recommended tests

- Auth: register/login + JWT-protected route access.
- Validation middleware: invalid IDs, missing required fields.
- Products: pagination/filtering behavior, BigInt/Decimal serialization.
- Orders/cart flows: create order, add/remove cart items (requires DB).
- Prisma integration tests with a dedicated test database.

## Optional DB-backed tests

Some tests can be enabled only when Docker Postgres is running:

```bash
# Windows PowerShell
$env:RUN_DB_TESTS="1"; npm test
```

