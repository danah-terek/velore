# CRM design polish report

Velore eyewear admin CRM (`/admin`): visual alignment with the storefront luxury tokens (warm ivory/pearl canvas, soft cards, teal accent, charcoal ink) while keeping enterprise dashboard clarity. **Scope: frontend CRM UI only.** Backend, Prisma, and migrations were not touched.

---

## 1. Files changed

| Area | Path |
| --- | --- |
| Design tokens & CRM utilities | `frontend/src/index.css` |
| Route fallback | `frontend/src/features/admin/layout/CRMRouteFallback.jsx` |
| Lazy routes | `frontend/src/features/admin/AdminApp.jsx` |
| Layout / transitions / Suspense | `frontend/src/features/admin/layout/CRMLayout.jsx` |
| Sidebar | `frontend/src/features/admin/layout/CRMSidebar.jsx` |
| Topbar | `frontend/src/features/admin/layout/CRMTopbar.jsx` |
| Shared CRM UI | `frontend/src/features/admin/shared/*` (PageHeader, SectionCard, DataTable, Skeleton, Empty/Error/Loading, Search, StatusBadge, etc.) |
| Dashboard | `frontend/src/features/admin/dashboard/CRMDashboard.jsx` |
| Products | `frontend/src/features/admin/products/CRMProducts.jsx`, `CRMProductForm.jsx`, `CRMProductEditor.jsx` |
| Inventory | `frontend/src/features/admin/inventory/CRMInventory.jsx` |
| Orders | `frontend/src/features/admin/orders/CRMOrders.jsx` |
| Customers | `frontend/src/features/admin/customers/CRMCustomers.jsx` |
| Reviews | `frontend/src/features/admin/reviews/CRMReviews.jsx` |
| Blogs | `frontend/src/features/admin/blogs/CRMBlogs.jsx` |
| Staff | `frontend/src/features/admin/staff/CRMStaff.jsx` |
| Access denied | `frontend/src/features/admin/shared/CRMAccessDenied.jsx` |

*Pages such as Analytics, Settings, and Admin Login may still use occasional legacy Tailwind neutrals where they did not require changes for this pass; see section 13.*

---

## 2. Design system changes

- **CSS variables** (`:root` in `index.css`): existing Velore palette reused for CRM (`--velore-canvas`, `--velore-pearl`, `--velore-card`, `--velore-border-soft`, `--velore-accent`, `--velore-fg`).
- **New / refined CRM component classes** (scoped under `@layer components`):
  - Layout/surfaces: `crm-shell`, `crm-main`, `crm-topbar`, `crm-sidebar`, `crm-card`, `crm-card-luxury`, `crm-panel`, `crm-panel-solid`
  - Forms: `crm-input`, `crm-select`, `crm-select-sm`, `crm-textarea`, **`crm-field-label`**, **`crm-pill-muted`**, **`crm-file-trigger`** (styled native file button)
  - Tables: `crm-table-wrap`, `crm-table`
  - Buttons: `crm-btn-primary`, `crm-btn-secondary`, `crm-btn-danger`
  - Misc: `crm-empty-panel`, `crm-hover-lift`, `crm-page-enter`, `crm-route-fallback` pulse tweak
- **`prefers-reduced-motion`**: `crm-page-enter` and `crm-hover-lift` disable motion alongside existing storefront utilities.

---

## 3. Lazy loading changes

- **`AdminApp.jsx`**: major CRM screens use `React.lazy(() => import(...))` for Dashboard, Products, Product editor, Inventory, Orders, Customers, Reviews, Blogs, Analytics, Staff, Settings.
- **`AdminLogin`** stays eager (correct for redirect UX).
- **`CRMLayout.jsx`**: wraps `<Outlet />` with `<Suspense fallback={<CRMRouteFallback />}>` so lazy chunks load without breaking guards.

---

## 4. Dropdown / select improvements

- Shared **`crm-select`** (+ **`crm-select-sm`** for dense table controls) replaces raw bordered “white box” selects where updated (orders status + filter, staff role).
- Native `<select>` retained for correctness and accessibility; appearance normalized (chevron, focus ring, hover).

---

## 5. Icon improvements

- Sidebar and navigation use **lucide-react** consistently (per earlier layout work): LayoutDashboard, Package, Boxes, ShoppingCart, Users, Star, Newspaper, BarChart3, ShieldCheck, Settings, LogOut.

---

## 6. Card / table improvements

- **`CRMDataTable`** / **`CRMSectionCard`** use pearl surfaces, soft borders, and hover rhythm aligned with `crm-table` styles.
- Product/inventory/blog thumbnails use **stone borders + subtle rings + accent-tinted placeholder** instead of flat slate gray.
- Pagination controls use **`crm-btn-secondary`** for consistency.

---

## 7. Product form / variant manager polish

- **`CRMProductForm`**: section grouping, `crm-*` controls, upload zone and previews aligned with luxury surfaces (existing pass).
- **`CRMProductEditor`**: variant rows use **`crm-panel-solid`** + **`crm-hover-lift`**; inputs use **`crm-input`**; labels use **`crm-field-label`**; image path chips use **`crm-pill-muted`**; file inputs use **`crm-file-trigger`**; error banner and divider borders use Velore tokens. Super-admin-only delete behavior unchanged.

---

## 8. Loading / empty / error state improvements

- **`CRMRouteFallback`**: pearl background, Velore CRM label, skeleton placeholders (not spinner-only).
- Shared **`CRMLoadingState`**, **`CRMEmptyState`** (optional action), **`CRMErrorState`**, **`CRMUnavailableState`** updated to match CRM surfaces (earlier pass).

---

## 9. Responsive behavior

- **Sidebar**: desktop sticky column; mobile drawer + overlay (layout).
- **Tables**: `crm-table-wrap` horizontal scroll; forms use responsive grids.
- **Variant editor**: stacked file row on small screens (`flex-col` / `sm:flex-row`).

---

## 10. Regression checks (manual expectations)

| Check | Status |
| --- | --- |
| Product create / edit / delete | No logic changes; UI classes only in touched files |
| Image upload | Paths + multipart flow untouched |
| Variant CRUD + super-admin delete gate | Preserved in `CRMProductEditor` |
| `total_stock` / inventory columns | Data columns unchanged |
| Cart/checkout stock validation | Backend untouched |
| Admin token / route guards | `AdminProtectedRoute`, `AdminRoleGuard`, login route unchanged |
| Storefront routes | No Navbar/Footer embedded in CRM |

---

## 11. Frontend build / lint result

Commands:

```bash
cd frontend
npm run build
npm run lint
```

**Results (2026-05-09):**

- **`npm run build`**: succeeded (`vite build`, ~1m 39s). CRM routes appear as separate chunks (e.g. `CRMProductEditor-*.js`, `CRMOrders-*.js`, `AdminApp-*.js`).
- **`npm run lint`**: **exit code 0**; **3 warnings** (known storefront hook dependency warnings, unchanged policy):
  - `Checkout.jsx` — missing `loadCart` in `useEffect` deps
  - `ProductDetail.jsx` — missing `loadProduct` in `useEffect` deps
  - `Shop.jsx` — missing `loadProducts` in `useEffect` deps

---

## 12. Backend result

**Not applicable** — backend was not modified for this milestone.

---

## 13. Remaining design TODOs

- Replace remaining **`text-slate-*`** / **`border-slate-*`** in secondary cells (e.g. some customer/review/dashboard/analytics rows, `CRMProductForm` helper captions, sidebar overlay) with **`rgba(var(--velore-fg), …)`** or shared caption utilities for 100% token consistency.
- **`AdminLogin`**: optional pass to use `crm-card` / `crm-input` for parity with CRM shell.
- **`CRMAnalytics`** / **`CRMSettings`**: align empty/loading panels with `crm-empty-panel` if desired.

---

## Safe to commit?

After `npm run build` and `npm run lint` succeed with no new errors: **YES** for a design-only milestone on branch `crm`.

Suggested commands (do not run unless you intend to commit):

```bash
git checkout crm
git status
git add frontend/src/index.css frontend/src/features/admin docs/crm-design-polish-report.md
git commit -m "Polish CRM admin UI with Velore design tokens, lazy loading fallback, and form/table consistency"
```
