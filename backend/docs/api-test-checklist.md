# Velore Backend — API Test Checklist (curl)

## Response shape contract

Success:

```json
{
  "success": true,
  "message": "Optional message",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Human readable error",
  "errors": []
}
```

## Base URL

- Default: `http://localhost:3000`
- If port `3000` is busy locally, use the port you started the server on (example: `http://localhost:3001`)

---

## 1) Health test

- **method**: GET
- **url**: `/health`
- **curl**

```bash
curl -s http://localhost:3000/health
```

## 2) Auth register/login test

### Register

- **method**: POST
- **url**: `/api/v1/auth/register`
- **headers**: `Content-Type: application/json`
- **body** (example)

```bash
curl -s -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test1@velore.local\",\"password\":\"Test12345!\",\"name\":\"Test User\"}"
```

### Login

- **method**: POST
- **url**: `/api/v1/auth/login`
- **headers**: `Content-Type: application/json`

```bash
curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test1@velore.local\",\"password\":\"Test12345!\"}"
```

Expected: success + token (and/or user data) in `data`.

## 3) Product list test

- **method**: GET
- **url**: `/api/v1/products`

```bash
curl -s "http://localhost:3000/api/v1/products"
```

## 4) Product search test

- **method**: GET
- **url**: `/api/v1/products/search?q=...`

```bash
curl -s "http://localhost:3000/api/v1/products/search?q=ray"
```

## 5) Category list test

- **method**: GET
- **url**: `/api/v1/categories`

```bash
curl -s "http://localhost:3000/api/v1/categories"
```

## 6) Brand list test

- **method**: GET
- **url**: `/api/v1/brands`

```bash
curl -s "http://localhost:3000/api/v1/brands"
```

## 7) Cart test

- **method**: GET
- **url**: `/api/v1/cart`
- **headers**: `Authorization: Bearer <token>`

```bash
curl -s "http://localhost:3000/api/v1/cart" \
  -H "Authorization: Bearer <token>"
```

## 8) Favorites test

- **method**: GET
- **url**: `/api/v1/favorites`
- **headers**: `Authorization: Bearer <token>`

```bash
curl -s "http://localhost:3000/api/v1/favorites" \
  -H "Authorization: Bearer <token>"
```

## 9) Order test

- **method**: GET
- **url**: `/api/v1/orders`
- **headers**: `Authorization: Bearer <token>`

```bash
curl -s "http://localhost:3000/api/v1/orders" \
  -H "Authorization: Bearer <token>"
```

## 10) Payment not-configured test

This should return **501** if `STRIPE_SECRET_KEY` is empty.

- **method**: POST
- **url**: `/api/v1/payments/create-intent`
- **headers**: `Content-Type: application/json`

```bash
curl -s -X POST http://localhost:3000/api/v1/payments/create-intent \
  -H "Content-Type: application/json" \
  -d "{\"amount\":10,\"currency\":\"usd\"}"
```

## 11) Contact form test

- **method**: POST
- **url**: `/api/v1/contact`
- **headers**: `Content-Type: application/json`

```bash
curl -s -X POST http://localhost:3000/api/v1/contact \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test\",\"email\":\"test@velore.local\",\"subject\":\"Hello\",\"message\":\"Test message\"}"
```

## 12) Error response test

### 404 unknown route

```bash
curl -s -i http://localhost:3000/__does_not_exist__
```

Expected: `success=false`, `errors=[]`, message like `Route not found`.

---

## 13) Loyalty (protected)

All loyalty endpoints are protected (no public endpoints).

### View my points (requires customer JWT)

- **method**: GET
- **url**: `/api/v1/loyalty/points`
- **headers**: `Authorization: Bearer <token>`

```bash
curl -s "http://localhost:3000/api/v1/loyalty/points" \
  -H "Authorization: Bearer <token>"
```

### Redeem points (requires customer JWT)

- **method**: POST
- **url**: `/api/v1/loyalty/redeem`
- **headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
- **body**: `{ "orderId": "...", "pointsToRedeem": 50 }`

```bash
curl -s -X POST "http://localhost:3000/api/v1/loyalty/redeem" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d "{\"orderId\":\"1\",\"pointsToRedeem\":50}"
```

### Award points (admin-only)

- **method**: POST
- **url**: `/api/v1/loyalty/award`
- **headers**: `Authorization: Bearer <admin-token>`, `Content-Type: application/json`

```bash
curl -s -X POST "http://localhost:3000/api/v1/loyalty/award" \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"1\",\"orderId\":\"1\"}"
```

