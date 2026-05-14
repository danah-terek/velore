# ERD Explanation (Current Schema + Target Direction)

This repo currently ships with an existing Prisma schema (`backend/prisma/schema.prisma`).
The schema uses **BigInt autoincrement** IDs and already contains many e-commerce domains.

This doc explains the current ERD at a high level so you can defend it in a senior project.

## Core domains (current)

### Identity
- `users` ↔ `Role` (many users per role)
- `admin` ↔ `Role` (many admins per role)
- `sessions` ↔ `users` (many sessions per user)

### Catalog
- `products` → `categories` (many products per category)
- `products` → `brands` (many products per brand)
- `products` → `product_variants` (one-to-many)

### Cart & Wishlist
- `users` ↔ `carts` (1:1)
- `carts` ↔ `cart_items` (1:many)
- `users` ↔ `wishlists` (1:1)
- `wishlists` ↔ `wishlist_items` (1:many)

### Orders & Payments
- `users` ↔ `orders` (1:many)
- `orders` ↔ `orders_items` (1:many)
- `orders` ↔ `payments` (1:1)

### Reviews
- `users` ↔ `reviews` (1:many)
- `products` ↔ `reviews` (1:many; product_id optional today)
- `orders` ↔ `reviews` (1:1 via `order_id @unique`)

### Blog/Content
- `blog_posts` is standalone (not linked to users/admins in the schema today)

### CRM/Ops
- `audit_logs` ↔ `admin` (many logs per admin)
- `contact_messages` is standalone (support intake)
- `loyalty_transactions` ↔ `users` (and optional `orders`)

### AI
- `ai_recommendations` links `users` ↔ `products`
- `face_images` stores image bytes linked to `users`
- `embeddings` implies optional vector search support (pgvector)

## Target direction (without rewriting blindly)

After stabilizing the current schema, a senior-project “v2” typically adds:
- CRM tasks/tickets/notes
- inventory movement ledger
- order status history + shipment tracking
- content categories and author relations
- stronger enums/constraints (phased)

