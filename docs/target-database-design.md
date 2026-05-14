# Target Database Design (Senior-Project-Ready) — Proposal

This is a **proposal** for the final schema after the audit in `docs/schema-audit.md`.

Important:
- The current schema uses **BigInt autoincrement IDs** across nearly all tables.
- This proposal uses **UUID primary keys** per your requirement.
- Therefore, adopting this fully is a **major migration project** (plan it deliberately).

## Guiding principles (aligned to your rules)

- UUID primary keys on all main models
- `createdAt`, `updatedAt` everywhere; `deletedAt` where soft delete is useful
- `Decimal` for all money amounts
- normalized relationships for CRM and operations (tasks/tickets/stock ledger)
- avoid unsafe cascades on orders/payments/audit logs
- store only payment provider references; never card data

## Required enums (Prisma)

```prisma
enum UserRole {
  CUSTOMER
  CRM_AGENT
  CRM_MANAGER
  ADMIN
  SUPER_ADMIN
}

enum UserStatus {
  ACTIVE
  BLOCKED
  DELETED
}

enum ProductStatus {
  DRAFT
  ACTIVE
  ARCHIVED
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
  REFUNDED
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
}

enum PaymentMethod {
  COD
  CARD
  WHISH
}

enum TicketStatus {
  OPEN
  IN_PROGRESS
  RESOLVED
  CLOSED
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  DONE
  CANCELLED
}

enum TaskPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum FaceShape {
  OVAL
  ROUND
  SQUARE
  HEART
  DIAMOND
  OBLONG
  UNKNOWN
}
```

## Proposed model set (what each system uses)

Below is the target set you requested, with a pragmatic mapping to the three systems:
- **Storefront**: customer frontend
- **Backend**: API + business logic
- **CRM**: admin dashboard + operations tooling
- **AI**: face analysis service integration (backend-owned persistence)

### A) Identity and Access

1) `User`
- **Why**: unified identity for customers + staff/admin
- **Used by**: Storefront, Backend, CRM
- **Relations**: roles, sessions, addresses, orders, notes/tasks/tickets
- **Indexes/uniques**: unique email; index status; createdAt

2) `UserSession` (optional)
- **Why**: track sessions/devices and support logout/all-devices
- **Used by**: Backend, CRM (activity visibility)

3) `PasswordResetToken`
- **Why**: avoid reset token fields directly on user; support expiry/history
- **Used by**: Backend

4) `Address`
- **Why**: normalized shipping/billing addresses
- **Used by**: Storefront, Backend, CRM

5) `AdminLog` / `AuditLog`
- **Why**: governance and accountability for CRM actions
- **Used by**: CRM, Backend

### B) CRM / Admin Operations

6) `StaffProfile` (optional)
- **Why**: extra staff metadata (department, title, permissions overrides if needed)
- **Used by**: CRM

7) `CustomerNote`
- **Why**: CRM notes about a customer
- **Used by**: CRM

8) `CustomerActivity`
- **Why**: first-class activity timeline (or derive from orders/sessions)
- **Used by**: CRM

9) `CRMTask`
- **Why**: work queue & follow-ups
- **Used by**: CRM

10) `CRMTaskComment`
- **Why**: collaboration and audit trail
- **Used by**: CRM

11) `SupportTicket`
- **Why**: evolve beyond contact messages into lifecycle-managed support
- **Used by**: Storefront (submit), Backend, CRM

### C) Product Catalog

12) `Product`
- **Why**: primary product entity; status lifecycle (draft/active/archived)
- **Used by**: Storefront, Backend, CRM
- **Uniques**: `slug @unique`

13) `ProductVariant`
- **Why**: SKU-level pricing/stock
- **Used by**: Storefront, Backend, CRM
- **Uniques**: `sku @unique`

14) `ProductImage`
- **Why**: normalized multi-image support and ordering
- **Used by**: Storefront, CRM

15) `Category`
- **Why**: navigation/filtering
- **Used by**: Storefront, CRM
- **Uniques**: `slug @unique`

16) `Brand`
- **Why**: navigation/filtering
- **Used by**: Storefront, CRM
- **Uniques**: `slug @unique`

17) `ProductAttribute` / `ProductAttributeValue` (optional)
- **Why**: flexible attributes (material, gender, frame shape) without schema churn
- **Used by**: Storefront filters, CRM catalog management

### D) Inventory

18) `StockMovement`
- **Why**: inventory ledger (auditability, reporting, reconciliation)
- **Used by**: CRM, Backend

19) `InventoryLocation` (optional)
- **Why**: multi-warehouse or store locations
- **Used by**: CRM

### E) Cart and Wishlist

20) `Cart` / `CartItem`
- **Why**: persistent carts
- **Used by**: Storefront, Backend

21) `WishlistItem` (or `Favorite`)
- **Why**: favorites/wishlist
- **Used by**: Storefront, Backend

### F) Orders

22) `Order` / `OrderItem`
- **Why**: core commerce transaction
- **Used by**: Storefront, Backend, CRM

23) `OrderStatusHistory`
- **Why**: compliance/audit and timeline
- **Used by**: CRM, Backend

24) `Shipment` (optional)
- **Why**: tracking numbers, carrier, delivery events
- **Used by**: CRM, Storefront

### G) Payments

25) `Payment`
- **Why**: current payment state (method/status/amount/provider refs)
- **Used by**: Backend, CRM

26) `PaymentTransaction`
- **Why**: record provider events/attempts/refunds
- **Used by**: Backend, CRM

### H) Reviews

27) `Review`
- **Why**: product rating + moderation
- **Used by**: Storefront, Backend, CRM

### I) Blog / Content

28) `BlogPost`
- **Why**: marketing content
- **Used by**: Storefront, CRM

29) `BlogCategory` (optional)
- **Why**: structured content taxonomy
- **Used by**: Storefront, CRM

30) `CMSBlock` / `PageContent` (optional)
- **Why**: simple CMS to manage home page sections without redeploy
- **Used by**: CRM, Storefront

### J) AI Recommendation System

31) `FaceAnalysisResult`
- **Why**: store a run result (face shape, confidence, model version)
- **Used by**: Backend, CRM, AI integration

32) `ProductRecommendation`
- **Why**: tie analysis to product suggestions (with scoring)
- **Used by**: Storefront, Backend, CRM

33) `FaceShapeProductRule`
- **Why**: business-configurable rules (face shape → frame shapes/brands)
- **Used by**: CRM

### K) System Settings

34) `SystemSetting`
- **Why**: feature flags, thresholds, operational toggles
- **Used by**: Backend, CRM

## Migration reality check (from current schema)

Because your current schema is BigInt-based, the safest professional approach is:

1) Stabilize current schema + API contract + docker/dev experience
2) Add missing CRM/inventory/history tables **in the current key strategy**
3) If UUIDs are required for final defense, do a planned “v2 schema” migration:
   - dual-write/dual-read strategy or
   - export/import into new UUID schema
   - carefully preserve IDs for reconciliation

