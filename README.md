# 💎 Velora

**Velora** is a full-stack **jewellery & fashion marketplace** built with **Next.js 16**, **TypeScript**, **Tailwind CSS**, **PostgreSQL**, **Prisma**, and **Stripe**. It lets customers browse and buy pieces from independent sellers, sellers list and manage their own products and orders, and an admin oversee the whole marketplace.

> Built as a **full-stack** application with a focus on **real end-to-end commerce flows**, **backend-enforced role permissions**, a **premium editorial storefront**, and **Stripe test-mode checkout**.

---

## ✨ Features

### 🛍️ Storefront & Product Discovery

The customer-facing store is an editorial homepage plus a full catalogue browsing experience.

* **Editorial homepage** built from seeded data
  * Cinematic full-viewport hero with a subtle load-in and slow zoom
  * "The Edit" — a draggable / swipeable editorial carousel
  * Product rails: **Featured**, **New Arrivals**, **Most Loved**, **Worth a Second Look** (discounted only)
  * Split editorial story section + **Recently Viewed** rail
* **Catalogue browsing**
  * Category and group (Jewellery / Fashion) pages
  * **Filters:** category, price range, size, colour, availability, on-sale-only
  * **Sorting:** price low→high, price high→low, newest, popular
  * Pagination and empty-state handling
* **Product detail page**
  * Multi-image gallery with a selectable **primary image**
  * Price, discount, material, sizes, colours, live stock
  * Seller / store information, shipping and returns details
  * Add to cart, **Buy it now**, add / remove from wishlist

### 🔍 Search

Search is available from every storefront page via the navbar.

* **Recent searches** — last 3 unique queries
  * Persisted in PostgreSQL for signed-in customers
  * Stored in `localStorage` for guests
  * Individual remove + clear-all
* **Autocomplete suggestions**
  * Triggered after 3 characters, debounced (250 ms), stale-response guarded
  * Suggestions drawn from real data: product names, materials, categories, store names
  * Keyboard navigation (arrows, Enter, Escape) and a "No suggestions found" state

### ⭐ Reviews & Ratings

* **1–5 star rating + written review**, stored in PostgreSQL
* Only customers who **purchased the product** (a paid order containing it) can review
* **One review per order/product**, enforced with a database unique constraint
* Product page shows **average rating, review count, and a 1–5 distribution**
* Aggregates (`ratingAvg`, `ratingCount`) are denormalised on the product and recomputed in a transaction on every new review
* "Write a review" is also linked from the order detail page
* `Load more` pagination, empty state, and inline validation / API error states

### 🚚 Shipping Information

* **Estimated delivery date range** shown next to the price / add-to-cart section
* Calculated from the current date plus a fixed **business-day dispatch + transit window** (pure function, no configuration)
* Also shows stock availability and a short shipping / returns summary

### 🛒 Cart & 💳 Checkout

* **Cart:** quantity changes, per-line subtotals, running total
  * Stock is validated on every change and again before checkout
  * Handles out-of-stock, insufficient quantity, unpublished items, and empty cart
* **Checkout with Stripe (test mode)**
  * Review cart → choose a saved shipping address → order summary → Stripe Checkout
  * On successful payment: order + order items created, product stock decremented, cart cleared, confirmation shown
  * **Idempotent order finalisation** keyed on the Stripe session id (also wired to an optional `checkout.session.completed` webhook)
  * Cancelled payments return to the cart with items kept

### 📦 Orders

* Customer order history and per-order detail
* Ordered products, quantities, prices, shipping address snapshot
* Status trail: `Processing → Shipped → Delivered`

### 🧑‍🎨 Seller Area (SELLER role)

* **Dashboard:** total products, active products, orders received, pending orders, lifetime paid revenue
* **Product management**
  * Create / edit / delete, publish / unpublish, inline stock updates
  * **1–3 image upload** with previews, remove / replace, and choose the **primary image** (auto-set when only one)
  * Images stored as data URIs in PostgreSQL (survives ephemeral hosting filesystems)
* **Orders:** only orders containing the seller's products, with customer name / phone / address and per-seller status updates
* Seller profile + saved-address management

### 🛠️ Admin Area (ADMIN role)

* **Dashboard:** total customers, sellers, products, orders, gross revenue
* **Customers:** list, profile, their orders
* **Sellers:** list, store info, their products, their orders
* **Products:** view all, publish / unpublish, delete (with filter by state)
* **Orders:** list all, full order detail (never exposes payment card data)

### 🔐 Authentication & Authorization

Authentication is a **custom signed-cookie session** — no third-party auth library.

* Register with a role choice: **Shop as Customer** or **Sell on Velora** (creates the matching profile)
* Login / logout, forgot password, reset password
* **Passwords** hashed with `bcrypt`
* **Sessions** are a signed **JWT** (via `jose`) in an `httpOnly`, `SameSite=Lax` cookie, `secure` in production, 7-day expiry
* **Password reset:** single-use hashed token with a 30-minute expiry
  * Emailed via **Resend** when `RESEND_API_KEY` is set
  * Falls back to showing the reset link in the UI when email isn't configured (or the send fails)
* **Authorization is enforced on the backend**
  * `src/proxy.ts` does a fast cookie check and redirects by role
  * Every API route calls `authRole(...)` / `authSeller()`; every seller/admin query is scoped by `sellerId` / role
  * A seller cannot read or mutate another seller's products or orders (returns 404 / 403)

### 📱 Responsive Design

Designed for desktop, laptop, tablet, and mobile — not just a shrunk desktop layout.

* Responsive product grids, filters, galleries, cart, checkout, and dashboards
* **Dedicated mobile navigation drawer** (not the desktop nav resized)
* Homepage navbar is **transparent over the hero** and transitions to the solid style on scroll — homepage only; every other page keeps the standard sticky navbar
* Horizontal-scroll containers for wide content (carousels, tables) so the page body never scrolls sideways
* Comfortable touch targets on mobile controls

### 🎨 Animations & Accessibility

* CSS-only entrance animations — opacity + small translate reveals as sections enter the viewport (IntersectionObserver toggles a class), with a failsafe so content is never left hidden
* Slow hero zoom and a small, capped scroll parallax on the hero image
* Refined hover states: image scale, secondary-image cross-fade on product cards, arrow nudge on text CTAs
* **`prefers-reduced-motion: reduce`** disables the hero zoom/parallax and all reveal transitions
* Automated agents / crawlers skip the entrance animations (content renders immediately)
* Star ratings use deterministic SVG gradient ids so server and client markup match (no hydration mismatch)

---

## 🔄 User Flow

```text
Home (editorial storefront)
        ↓
Browse / Search / Filter products
        ↓
Product detail  (rating · delivery estimate · reviews)
        ↓
Add to cart  →  choose shipping address  →  Stripe test checkout
        ↓
Order confirmed  →  track status  →  leave a review
```

Sellers register as **Sell on Velora**, land on the seller dashboard, add products with 1–3 images, publish them to the storefront, and manage the orders that contain their pieces. Admins sign in and land on the marketplace dashboard with read access to every customer, seller, product, and order, plus publish/delete control over products.

---

## 🧩 Project Structure

```text
src/
├── app/
│   ├── (store)/                     # customer storefront — shares the Navbar + Footer layout
│   │   ├── page.tsx                  # editorial homepage
│   │   ├── products/
│   │   │   ├── page.tsx              # listing + filters + sort + pagination
│   │   │   └── [slug]/page.tsx       # product detail + reviews + shipping estimate
│   │   ├── cart/  wishlist/  account/  orders/  checkout/
│   │   └── loading.tsx               # route-level loading states
│   │
│   ├── (auth)/                       # login, register, forgot / reset password
│   ├── seller/                       # seller dashboard, products, orders, profile  (SELLER only)
│   ├── admin/                        # marketplace dashboards                        (ADMIN only)
│   │
│   ├── api/                          # REST route handlers
│   │   ├── auth/  cart/  wishlist/  addresses/  profile/  checkout/
│   │   ├── products/[id]/reviews/
│   │   ├── search/recent/  search/suggest/  recently-viewed/
│   │   ├── seller/products/  seller/orders/
│   │   ├── admin/products/
│   │   └── stripe/webhook/
│   │
│   ├── layout.tsx   globals.css   error.tsx   not-found.tsx
│
├── components/
│   ├── store/                        # Hero, EditCarousel, ProductCard, ProductGrid,
│   │                                 # ProductFilters, SearchBox, ProductReviews, Rating,
│   │                                 # ShippingEstimate, CartView, CheckoutClient, Navbar, ...
│   ├── seller/                       # ProductForm, SellerProductList, SellerOrderList, SellerNav
│   ├── admin/                        # AdminProductList, AdminNav
│   ├── account/                      # ProfileForm, AddressManager, AccountNav
│   └── ui/                           # hand-built primitives: Button, Field, Modal,
│                                     # Badge, Toaster, States, StatCard
│
├── lib/
│   ├── prisma.ts                     # Prisma client singleton
│   ├── session.ts  auth.ts  api.ts   # cookie session + server-page / API-route guards
│   ├── pricing.ts                    # single effective-price (discounted price) calculation
│   ├── products.ts  productShared.ts # storefront queries + shared Prisma selects
│   ├── cart.ts  checkout.ts  stripe.ts
│   ├── reviews.ts  shipping.ts
│   ├── search.ts  recentlyViewed.ts  localHistory.ts
│   ├── validations.ts                # all Zod schemas
│   └── email.ts  images.ts  toast.ts  utils.ts  ...
│
├── proxy.ts                          # coarse route protection (redirect by role)
│
prisma/
├── schema.prisma                     # 17 models, 3 enums
├── migrations/                       # init · search+effective-price · reviews+ratings
└── seed.ts                           # categories, products, sellers, customers, orders, reviews

render.yaml                           # Render blueprint: Web Service + PostgreSQL
```

---

## 🛠️ Tech Stack

| Technology | Usage |
| --- | --- |
| **Next.js 16 (App Router)** | Server components for pages, route handlers for the REST API |
| **TypeScript** | End-to-end typing, shared types between DB, API, and UI |
| **Tailwind CSS v4** | All styling; theme tokens + a few keyframes in `globals.css` |
| **PostgreSQL** | Primary datastore |
| **Prisma 6** | Schema, migrations, and the typed query layer |
| **jose** | Signing / verifying the session JWT (edge-compatible) |
| **bcryptjs** | Password hashing |
| **Zod** | Request validation for every API route and form |
| **Stripe (test mode)** | Checkout Sessions + optional webhook |
| **Resend** | Transactional email for password reset (optional) |
| **tsx** | Running the TypeScript seed script |

> No component library or CSS framework beyond Tailwind was used — the UI primitives (buttons, fields, modal, toaster, badges) are hand-built. Authentication is a custom `jose` + `bcrypt` cookie session rather than NextAuth.

---

## 🚀 Getting Started

### Prerequisites

* **Node.js 20+** (22 recommended)
* **PostgreSQL 14+**

### 1. Clone the repository

```bash
git clone <repository-url>
cd velora
```

### 2. Create the database

```bash
psql -U postgres -c "CREATE DATABASE commerce;"
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | ✅ | e.g. `postgresql://postgres:student@localhost:5432/commerce?schema=public` |
| `AUTH_SECRET` | ✅ | Long random string used to sign session cookies (`openssl rand -base64 48`) |
| `NEXT_PUBLIC_APP_URL` | ✅ | `http://localhost:3000` locally; the deployed URL in production |
| `STRIPE_SECRET_KEY` | for checkout | Stripe **test** secret key (`sk_test_…`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | for checkout | Stripe **test** publishable key (`pk_test_…`) |
| `STRIPE_WEBHOOK_SECRET` | optional | Only if you run the webhook endpoint |
| `RESEND_API_KEY` | optional | Enables password-reset emails; without it the link is shown in the UI |
| `EMAIL_FROM` | optional | Sender address, e.g. `Velora <onboarding@resend.dev>` |

### 4. Install dependencies

```bash
npm install
```

### 5. Run migrations and seed

```bash
npx prisma migrate dev
npm run db:seed
```

### 6. Start the development server

```bash
npm run dev
```

```text
http://localhost:3000
```

### Useful scripts

```bash
npm run dev            # dev server
npm run build          # prisma generate + production build
npm run start          # run the production build
npm run typecheck      # tsc --noEmit
npm run lint           # eslint
npm run db:seed        # (re)seed the database
npm run prisma:studio  # open Prisma Studio
```

---

## 📦 Production Build

```bash
npm run build
npm run start
```

Build output goes to:

```text
.next/
```

**Deploying to Render:** the repo includes `render.yaml`, which provisions a **Render PostgreSQL** database and a **Node Web Service**.

* Build command: `npm install && npm run build`
* Pre-deploy command: `npx prisma migrate deploy`
* Start command: `npm run start`
* `AUTH_SECRET` is generated by Render; `DATABASE_URL` is wired from the database; Stripe / Resend / `NEXT_PUBLIC_APP_URL` are set in the dashboard
* Seed once from the service Shell: `npx prisma db seed`

---

## 🔑 Seeded Accounts

`npm run db:seed` creates 8 categories, 3 sellers (each with a draft product), ~20 published products, sample orders, and ~23 verified-purchase reviews.

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@velora.test` | `Admin123!` |
| Customer | `customer@velora.test` | `Customer123!` |
| Seller — Atelier Lune | `seller1@velora.test` | `Seller123!` |
| Seller — House of Meridian | `seller2@velora.test` | `Seller123!` |
| Seller — Kin & Stone | `seller3@velora.test` | `Seller123!` |
| Review authors | `sofia@velora.test`, `priya@velora.test`, `elena@velora.test` | `Customer123!` |

Stripe test card: `4242 4242 4242 4242`, any future expiry, any CVC.

---

## 📌 Current Scope

The current version is a complete marketplace: browsing, search, cart, Stripe test checkout, order tracking, reviews, and separate seller and admin panels — all backed by PostgreSQL with permissions enforced server-side.

### Implemented

* ✅ Customer registration, login/logout, forgot & reset password
* ✅ Role-based access for **CUSTOMER**, **SELLER**, **ADMIN**, enforced on the backend
* ✅ Editorial homepage with hero, editorial carousel, and product rails
* ✅ Product browsing with filters (incl. on-sale) and sorting on the **final discounted price**
* ✅ Search with persisted recent searches and debounced autocomplete
* ✅ Product detail with image gallery, primary-image control, and stock
* ✅ Wishlist and cart, both persisted, with stock validation
* ✅ Customer profile and full address CRUD
* ✅ Stripe test-mode checkout with idempotent order creation and stock decrement
* ✅ Order history and `Processing → Shipped → Delivered` status
* ✅ Product reviews & ratings (purchase-gated, one per order/product, with aggregates)
* ✅ Estimated delivery date range + shipping/returns info on the product page
* ✅ Seller dashboard, product CRUD, 1–3 image upload with primary image, publish/unpublish, stock
* ✅ Seller orders scoped to their own products, with status updates
* ✅ Admin dashboards for customers, sellers, products, and orders
* ✅ Recently viewed products (persisted for customers, `localStorage` for guests)
* ✅ Loading, empty, and error states across the app
* ✅ Responsive layouts with a dedicated mobile nav drawer
* ✅ Render deployment config (`render.yaml`)

### Not Yet Implemented

* ⏳ Automated test suite (testing is currently manual)
* ⏳ Order status email notifications (only password-reset email is wired)
* ⏳ Refunds / order cancellation after payment
* ⏳ Coupon or promo codes at checkout
* ⏳ Seller payouts / settlement
* ⏳ Review editing / deletion by the author and moderation tools

---

## 🔮 Future Improvements

* **Automated tests** — API route tests plus a Playwright pass over the checkout and review flows
* **Order lifecycle emails** — dispatch and delivery notifications through the existing Resend integration
* **Full-text / fuzzy search** — replace substring matching with Postgres full-text search or a search index
* **Coupons and store credit** — discount codes applied before the Stripe session
* **Seller payouts** — record per-order seller balances and payout status
* **Image hosting** — move seller uploads from data URIs to object storage (S3 / R2) with resizing

---

## 👩‍💻 What I Worked On

* **Full-stack architecture** — Next.js App Router with server components for pages and route handlers for a small REST API; shared TypeScript types from the database up to the UI
* **Database design** — 17-model Prisma schema (users/profiles, catalogue, cart/wishlist, orders, reviews, search history) across 3 migrations, plus a seed script that builds a realistic marketplace
* **Authentication** — custom `jose` + `bcrypt` signed-cookie sessions, registration with role selection, and a password-reset flow with a hashed token and an email-or-UI-link fallback
* **Authorization** — coarse redirects in `proxy.ts` and strict server-side guards (`authRole`, `authSeller`) with every seller/admin query scoped so cross-account access returns 404/403
* **Storefront** — the editorial homepage (hero, draggable carousel, product rails), product listing, and product detail page
* **Search & filtering** — recent-searches API + `localStorage` fallback, debounced autocomplete, and a filter/sort layer that consistently uses one central `effectivePrice` calculation (persisted on the product for indexable queries)
* **Cart & Stripe checkout** — cart with live stock checks and an idempotent order-finalisation function keyed on the Stripe session id, with a matching webhook handler
* **Reviews & ratings** — purchase-gated review creation with a DB unique constraint, transactional aggregate recomputation, and a summary + list UI with pagination
* **Shipping estimates** — a pure business-day delivery-window function rendered on the server
* **Seller & admin panels** — dashboards, product CRUD with multi-image upload and primary-image selection, and order management scoped by role
* **Reusable UI** — a small hand-built component library (Button, Field, Modal, Badge, Toaster, State/empty/loading components) used across storefront, seller, and admin
* **Responsive design & animation** — mobile nav drawer, responsive grids/tables, CSS reveal animations and a scroll-aware overlay navbar, all respecting `prefers-reduced-motion`
* **Deployment** — build script (`prisma generate` + `next build`) and a `render.yaml` blueprint for Render Web Service + PostgreSQL
