# Frontend currency sync + dropdown stabilization

## Root cause — header/footer desync
- Each currency control owned its **own local state** and did not subscribe to changes from other instances.
- `localStorage` reads (when present) happen only on mount; **same-tab updates are not broadcast** by the browser `storage` event.

## Root cause — dropdown design instability
- Native `<select>` controls and/or inconsistent custom styling caused:
  - trigger width/label variability (layout “jump”)
  - browser-default UI (not premium)
  - inconsistent styling between Navbar and Footer

## Fix: shared currency state
- Added `src/shared/hooks/useCurrency.js`
  - `localStorage` key: `velore_currency`
  - default: `USD`
  - supported: `USD`, `EUR`, `GBP`, `LBP`
  - same-tab sync via `window.dispatchEvent(new CustomEvent("velore:currency-change", { detail }))`
  - cross-tab sync via `storage` event

## Fix: CurrencyMenu uses shared state
- Added `src/shared/components/ui/CurrencyMenu.jsx`
  - consumes `useCurrency()` (no isolated local selected state)
  - selecting a currency:
    - updates shared state + localStorage
    - updates all mounted menus immediately
    - closes popover
  - outside click + Escape close

## Navbar / Footer wiring
- `src/shared/components/layout/Navbar.jsx`
  - removed exchange-rate fetch
  - replaced currency `<select>` (desktop + mobile) with `CurrencyMenu`
- `src/shared/components/layout/Footer.jsx`
  - replaced currency `<select>` with `CurrencyMenu`
  - language select kept as native but styled via `v-select`

## Styling stabilization
- `src/index.css` now includes a minimal stable set of primitives used by the dropdown:
  - `v-popover`, `v-menu-item`, `v-popover-anim`, `v-motion`
  - stable-width trigger `.v-currency-trigger`
  - deterministic selected-row style: `.v-menu-item[aria-current="true"]`

## Manual behavior check (expected result)
1. Change Navbar currency USD → EUR → Footer immediately reflects EUR.
2. Change Footer currency EUR → LBP → Navbar immediately reflects LBP.
3. Refresh page → currency persists (LBP).
4. Navigate to `/shop` → still synced.

## Accessibility notes
- Trigger: `aria-label`, `aria-haspopup="menu"`, `aria-expanded`
- Items: `<button role="menuitem">`, selected row uses `aria-current` + `aria-pressed`
- Escape closes and returns focus to trigger

## Regression check
- No backend changes
- No Prisma changes
- Lazy loading unaffected
- Navbar routing unaffected
- No external exchange-rate fetch

## Build / lint
- `npm run build`: PASS (note: one chunk-size warning remains)
- `npm run lint`: PASS with known warnings only:
  - `Checkout.jsx` missing `loadCart` (exhaustive-deps)
  - `ProductDetail.jsx` missing `loadProduct` (exhaustive-deps)
  - `Shop.jsx` missing `loadProducts` (exhaustive-deps)

## Files changed
- `src/shared/hooks/useCurrency.js` (new)
- `src/shared/components/ui/CurrencyMenu.jsx` (new)
- `src/shared/components/ui/index.js`
- `src/shared/components/layout/Navbar.jsx`
- `src/shared/components/layout/Footer.jsx`
- `src/index.css`
- `eslint.config.js`
- misc lint cleanups:
  - `src/features/auth/ForgotPassword.jsx`
  - `src/features/auth/authService.js`
  - `src/features/checkout/Checkout.jsx`
  - `src/features/checkout/StripeCheckout.jsx`
  - `src/features/home/Home.jsx`
  - `src/features/shop/Shop.jsx`
  - `src/shared/components/eyewear/Testimonials.jsx`
  - `src/shared/contexts/FavoritesContext.jsx`

