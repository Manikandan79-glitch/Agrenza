# FarmLink — Next.js Frontend (Homepage + Shop + Auth + Buyer)

New homepage redesign, built in Next.js 14 (App Router) with real CSS 3D
(not a library) for the signature crate-stack hero.

## What's new in this update

- **Real mobile OTP + email verification (Firebase)** — `auth/verify-otp`
  now runs actual Firebase Phone Authentication (real SMS) instead of a
  fake timer, and registration sends a real Firebase email verification
  link. See `app/lib/firebase.ts`, `app/lib/otp.ts`, `.env.local.example`,
  and the PHP API's README for the matching server-side token checks.
- **Product photos** — `app/lib/products-data.ts` now ships real produce
  photography (Wikimedia Commons) per product via a new `image` field,
  rendered through `app/components/ProductImage.tsx` (falls back to the
  original hand-drawn icon if a photo ever fails to load).
- **More 3D** — the hero crate stack now idly floats even without pointer
  input, the product-detail image panel tilts with the pointer, and a new
  `Produce3DShowcase.tsx` section ("Spin the stall") adds a draggable,
  auto-rotating CSS 3D carousel of product photos to the homepage.

## Design direction

- **Palette**: soil black (#16241a), turmeric gold (#e8a33d), leaf green
  (#4c7a3d), rust terracotta (#b5502d), paper (#efe8d8) — pulled from an
  Indian mandi (market) rather than a generic template palette.
- **Type**: Fraunces (display) + Work Sans (body) + IBM Plex Mono (prices /
  the ticker, echoing a mandi price board).
- **Signature element**: an interactive stack of produce crates in the hero,
  built with real CSS `perspective` + `preserve-3d` + `translateZ`, tilting
  as you move the pointer. Product cards on scroll pick up the same tilt
  on hover — like lifting a crate off the stack.
- **Numbered rows** in the "How it moves" section are a literal 3-step
  supply chain (farm → verified → you), not decorative numbering.

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000 — requires an internet connection (Google Fonts
are fetched at build time via `next/font/google`).

```bash
npm run build   # production build
npm run start   # serve the production build
```

## What's included

```
app/
  layout.tsx                 — fonts + CartProvider + global <html>/<body>
  page.tsx                    — homepage: hero + ticker + journey + product grid
  globals.css                  — design tokens (colors/fonts) as CSS variables
  lib/
    types.ts                    — Product / CartItem / Order types
    products-data.ts             — placeholder product catalog (8 items)
    cart-context.tsx              — cart state, persisted to localStorage
  components/
    Nav.tsx, Footer.tsx           — shared shell, live cart count in Nav
    CrateHero.tsx, ProduceIcons.tsx, MandiTicker.tsx, Journey.tsx, ProductGrid.tsx
    AuthShell.tsx                  — shared branded card wrapper for auth pages
    forms.css                       — shared input/button styling
  auth/
    login/page.tsx                  — buyer/farmer toggle login
    buyer-register/page.tsx
    farmer-register/page.tsx         — includes Aadhaar auto-formatting
    verify-otp/page.tsx               — 6-box OTP input, resend timer
  shop/
    page.tsx                          — listing with live search + category filter
    [id]/page.tsx                      — product detail, qty selector, add-to-cart
  buyer/
    cart/page.tsx
    checkout/page.tsx
    orders/page.tsx                     — orders + bulk-request tabs
    bulk-request/page.tsx
  farmer/
    dashboard/page.tsx                    — stats + low-stock alert + quick actions
    products/page.tsx                      — My Products table (edit/delete)
    products/new/page.tsx                   — add product form (image upload)
    products/[id]/edit/page.tsx              — edit product form
    orders/page.tsx                           — incoming orders, status dropdown
    earnings/page.tsx                          — totals + delivered-order history
```

Every page here is build-tested (`next build` passes clean, 18/18 pages).

## Not yet migrated (still PHP)

- `frontend/admin/*` — admin dashboard (approve farmers, approve bulk requests)
- All `backend/*` PHP stays as-is — a matching `backend/api/` JSON layer is
  provided as a separate deliverable (`farmlink-php-api.zip`). See its
  README for the full endpoint list and how to wire each `// TODO` in this
  project to a real `fetch()` call.

## Wiring up the real backend

Auth (`login`, `buyer-register`, `farmer-register`, `verify-otp`,
`email-verify`) is now wired end-to-end: it calls the PHP JSON API
(`app/lib/api.ts`) and Firebase (`app/lib/otp.ts`) for real. What's still
a client-only placeholder:

- Checkout (`buyer/checkout`) — needs a JSON version of
  `backend/buyer/place-order-process.php` (already provided as
  `POST /orders/place.php` in `farmlink-php-api.zip` — just needs wiring).
- Bulk request — same, via `POST /bulk-requests/create.php`.
- Product data (`ProductGrid`, `/shop`, `/shop/[id]`) — currently reads from
  `app/lib/products-data.ts`. Replace with a `fetch()` to
  `GET /products/list.php` once you're ready to show real farmer-uploaded
  listings instead of the placeholder catalog.

The cart itself (`app/lib/cart-context.tsx`) already works end-to-end on
the client (add → view cart → checkout → see it under My Orders) using
localStorage, so you can demo the full buyer flow before the backend is
wired up.

## Product data

`ProductGrid` currently ships with 8 placeholder products (each with a
real photo — see "What's new" above) so the page renders standalone. To
pull real data, replace the `PRODUCTS` array in `app/lib/products-data.ts`
with a `fetch()` call to a PHP endpoint that returns JSON, e.g.:

```ts
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products.php`, { cache: "no-store" });
const products = await res.json();
```
