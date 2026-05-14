# Frontend Design + Currency Recovery Report

Date: 2026-05-07  
Scope: `frontend/` only (no backend changes)

## What was broken after currency sync

- `src/App.jsx` had a **nested `<Routes>`** tree and most routes were **not lazy-loaded**.
- `src/App.css` contained **invalid SCSS-style nesting**, which is not valid CSS.
- `src/shared/utils/imageUrl.js` was **missing**, causing regressions for backend-served `/uploads/...` assets.
- `src/shared/components/ui/ContactModal.jsx` had reverted to a version where the top contact cards were **not clickable** and lacked the previously restored a11y behaviors.
- Several components still referenced **external placeholder images** (Unsplash/placeholder.com/Wikipedia).
- Navbar had **hash-scroll** navigation variants and search results used external fallbacks.
- Product card behavior included **DOM text mutation** for “Added!” state.

## Currency system preserved (critical)

Kept unchanged (source of truth + shared UI):

- `src/shared/hooks/useCurrency.js`
- `src/shared/components/ui/CurrencyMenu.jsx`
- LocalStorage key: `velore_currency`
- Same-tab sync via `CustomEvent('velore:currency-change')`
- Cross-tab sync via `storage` event

Navbar and Footer continue to use **the same `CurrencyMenu` component** so currency updates remain immediately synced.

## Lazy loading restored (routes + modals)

- Restored a **single clean `Routes` tree** with a store layout using `Outlet`.
- Added route-level lazy loading for major pages (Home/Shop/Product/Blogs/Auth/Checkout/Favorite/Profile/About/Policies/NotFound).
- Kept admin routes separate (no Navbar/Footer) and lazy loaded.
- Lazy-loaded non-critical modals:
  - `CartSidebar`
  - `ContactModal`
- Added a premium `Suspense` fallback (`PageLoader`) and lightweight content transition (`v-route-enter`).

File:
- `src/App.jsx`

## Missing pages/helpers restored

- `src/pages/About.jsx`
- `src/pages/NotFound.jsx`
- `src/pages/PolicyPlaceholder.jsx`
- `src/shared/utils/imageUrl.js`

`resolveImageUrl(path)` behavior:

- `null/empty` → `null`
- `http(s)://…` → unchanged
- `/uploads/...` → prepends backend origin derived from `VITE_API_URL` (fallback: `http://localhost:3000`)
- `/assets/...` or other `/...` → unchanged
- invalid → `null`

## Global design system stabilized

- Replaced invalid nested CSS in `src/App.css` with minimal valid CSS.
- Rebuilt `src/index.css` into stable “premium primitives” without fragile nesting and while **preserving currency styles** (`v-currency-trigger`, `v-menu-item[aria-current="true"]`).

Primitives restored/added:

- Typography: `v-eyebrow`, `v-h1`, `v-h2`, `v-lead`, `v-body`, `v-caption`, `v-price`, `v-label`
- Layout: `v-page`, `v-container`, `v-section`, `v-section-muted`, `v-divider`
- Surfaces/cards: `v-card`, `v-card-luxury`, `v-card-media`, `v-surface`, `v-surface-muted`, `v-form-card`, `v-empty`, `v-popover`, `v-menu-item`
- Buttons/forms: `v-btn-primary`, `v-btn-secondary`, `v-btn-ghost`, `v-icon-btn`, `v-input`, `v-select`, `v-field-error`
- Motion: `v-motion`, `v-hover-lift`, `v-popover-anim`, `v-route-enter`, `v-soft-enter`, `v-fade-up`

## Navbar icon navigation restored

File:
- `src/shared/components/layout/Navbar.jsx`

Changes:

- Restored premium icon + label navigation:
  - Shop: `Glasses`
  - About: `BadgeInfo`
  - Journal: `BookOpen`
  - Contact: `Headphones` (opens contact modal)
- Removed hash-scroll `/#about-us` and `/#latest-news` navigation.
- Search dropdown now uses premium popover primitives and no external placeholders.

## Clickable contact tiles restored (modal + footer)

Contact modal:

- `src/shared/components/ui/ContactModal.jsx`
- Top cards are full clickable `<a>` tiles:
  - Phone: `tel:+9611234567`
  - Email: `mailto:hello@velore.com`
  - Location: Google Maps search (new tab)
- Added focus-visible ring, pointer cursor, and Escape key close.

Footer:

- `src/shared/components/layout/Footer.jsx`
- Restored matching clickable phone/email/location tiles + service promise icons.
- Removed external payment images (Wikipedia).

## Image handling restored + external placeholders removed

Removed external placeholders from:

- `Navbar.jsx` search results
- `Home.jsx`, `Blogs.jsx`, `BlogPost.jsx`
- `CartSidebar.jsx`
- `ReviewForm.jsx`
- `ProfileSidebar.jsx`
- `ProductDetail.jsx` fallback arrays / guest cart image placeholder

Now all backend-driven images use `resolveImageUrl()` and safe `onError` handling (no infinite loops).

## Product/blog card design restored

Product cards:

- `src/shared/components/eyewear/EyewearCard.jsx`
- Restored `v-card-luxury` / `v-card-media` and removed DOM text mutation for “Added!”.
- Uses state-driven “Added” feedback with a `Check` icon.
- Resolved images via `resolveImageUrl()`, including variant-image fallback.

## Checkout empty-cart fix

File:
- `src/features/checkout/Checkout.jsx`

Behavior:

- When cart is empty: `subtotal = 0`, `shipping = 0`, `discount = 0`, `total = 0`
- Payment methods are disabled when cart is empty.
- Confirm button remains disabled when cart is empty.
- Removed checkout console noise.

## Removed unwanted/breaking code

- External image fallbacks (`via.placeholder.com`, `images.unsplash.com`, Wikipedia images)
- Hash-scroll navbar routes for About/Journal
- DOM text mutation in `EyewearCard`
- Invalid nested CSS in `App.css`

## Route verification (spot-check targets)

Expected status after this recovery:

- `/` Home: hero uses local `src/assets/heropic.jpg`; blog images via backend `/uploads` when present.
- `/shop` and `/products`: product cards show backend SVG images if provided by variants.
- `/product/:id`: images resolved via backend; add-to-cart uses state feedback.
- `/blogs` and `/blogs/:id`: cover images resolved via backend; no external placeholders.
- `/about`: restored page.
- `/favorite`: unchanged feature route.
- `/checkout`: empty-cart totals stay at \(0\).
- `/login`, `/signup`, `/register`: routes intact (with `/register` alias).
- Unknown route: `NotFound`.

## Build / lint results

- Build: `npm run build` ✅ PASS (code splitting confirmed; largest JS chunk `index-*.js` ~327kB, gzip ~104kB)
- Lint: `npm run lint` ✅ PASS with warnings only:
  - `Checkout.jsx`: `react-hooks/exhaustive-deps` missing `loadCart`
  - `ProductDetail.jsx`: `react-hooks/exhaustive-deps` missing `loadProduct`
  - `Shop.jsx`: `react-hooks/exhaustive-deps` missing `loadProducts`

## Remaining TODOs

- If desired, move remaining inline Tailwind classes on legacy pages toward the restored `v-*` primitives for consistency (purely visual).
- Optional: convert language dropdown to the same popover pattern as currency (not required, and not part of currency sync).

