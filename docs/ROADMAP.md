# Roadmap

Each task has acceptance criteria (AC). Tick items as they land and log them in `docs/PROGRESS.md`.

## P0 — Foundation ✅ (branch `feat/foundation`)

- [x] Audit (`docs/AUDIT.md`)
- [x] `CLAUDE.md` conventions
- [x] Schema design + migration + SQL scenario test (`docs/SCHEMA.md`)
- [x] Design direction + tokens (`docs/DESIGN.md`, `globals.css`)
- [x] Roadmap, `.env.example`, root metadata fix

---

## P1 — Storefront, customiser, cart/checkout, PayHere

### P1.1 Platform setup
- [ ] **Decisions from foundation resolved** (legacy tables, guest model, payment rules).
  AC: answers recorded in PROGRESS.md.
- [ ] **Supabase projects** (dev + prod), migration applied to dev, seed run, types generated to `src/types/database.ts`.
  AC: `supabase db reset` works locally; scenario test passes; `npm run build` uses generated types.
- [ ] **`@supabase/ssr` clients** `lib/supabase/{server,browser,admin}.ts`, session refresh in `middleware.ts`, delete `src/lib/supabase.ts`.
  AC: `admin.ts` imports `server-only`; build fails if imported from a client component.
- [ ] **Env validation** `lib/env.ts` (zod) for every var in `.env.example`.
  AC: missing/invalid var → clear error at boot; no placeholder fallbacks.
- [ ] **next-intl** with `/en` and `/si`, `messages/{en,si}.json`, locale switcher, `<html lang>` per locale, `hreflang` alternates.
  AC: every customer route renders in both locales; no hardcoded UI strings (lint rule or review checklist); Sinhala reviewed by a native speaker.
- [ ] **Security quick wins:** remove header "Admin Panel" link, delete mock `/admin` + `/admin/pos`, add security headers (CSP, HSTS, X-Frame-Options, Referrer-Policy) in `next.config.ts`.
  AC: `/admin` returns 404; securityheaders.com grade ≥ A.
- [ ] **UI primitives** in `components/ui`: Button, IconButton, Card, Input, Textarea, Select, Checkbox/Radio, Badge, StatusPill, Dialog/Sheet, Toast, Skeleton, PriceTag.
  AC: all use DESIGN tokens only; keyboard + screen-reader accessible; documented examples page (dev only).

### P1.2 Catalogue
- [ ] **Seed real catalogue**: categories (12), ≥ 20 products with options/values, images renamed and uploaded to R2 public bucket.
  AC: no `WhatsApp Image…` filenames remain in use; every product has en/si name and real photo.
- [ ] **Home page** redesign (hero, services grid, featured products from DB, how-it-works "order → proof → approve → print", trust strip with real facts only, WhatsApp CTA).
  AC: LCP < 2.5 s on 4G Moto G (Lighthouse mobile ≥ 90 perf, ≥ 95 a11y/SEO); no fake reviews/ratings/discounts.
- [ ] **Category page** `/[locale]/c/[slug]` with product grid, sorting, pagination (server-rendered).
  AC: unknown slug → 404; `generateMetadata` per category.
- [ ] **Product page** `/[locale]/p/[slug]` (server component + client customiser island), gallery with `next/image`, "from" price, specs, production time, FAQ.
  AC: unknown slug → 404; correct product always shown; JSON-LD `Product` without fake ratings.
- [ ] **Header/Footer** rebuild: working nav, mobile menu, cart count, locale switcher, real contact/NAP, no dead links.
  AC: link checker reports 0 broken internal links.

### P1.3 Customiser & uploads
- [ ] **Option renderer** for size (presets + custom W×H with min/max), material, finish, color (swatches), text fields (max length), photo slots.
  AC: required options enforced client + server (zod); price preview updates live and matches server.
- [ ] **Pricing engine** `lib/pricing.ts` (fixed, per_sqft with min_sqft, flat/percent/per_sqft modifiers, quantity) with unit tests.
  AC: ≥ 95 % branch coverage; server result is the only one persisted.
- [ ] **R2 uploads**: server action → `job_files` (pending) → presigned PUT (multipart > 100 MB) → progress UI → confirm via HeadObject → `uploaded` + width/height.
  AC: 500 MB file uploads on desktop; mid-upload refresh can resume or cleanly fail; > 500 MB or disallowed type rejected server-side; low-resolution warning when photo < slot min px.
- [ ] **Notes & template picker** (product_templates).
  AC: selected template and notes appear on the order item snapshot.

### P1.4 Cart & checkout
- [ ] **Guest identity**: anonymous Supabase sign-in on first cart action; optional account creation keeps cart and orders.
  AC: guest cart survives reload and browser restart; signing up keeps the same orders.
- [ ] **Cart** page/drawer: edit quantity/options, remove, uploaded file thumbnails, server-computed totals, coupon field.
  AC: totals always server-computed; invalid coupon shows reason.
- [ ] **Checkout** (single page): contact (name, phone required, email optional), delivery method pickup/courier + address (district list), delivery fee rule, notes, terms; creates order + items (service role) → jobs auto-created by trigger; files re-parented from cart items to jobs.
  AC: zod-validated; order totals match pricing engine; order number shown; access-token link generated; idempotent on double-submit.
- [ ] **Quote request** flow for `order_type = quote` products: same checkout without payment, job status `quote_requested`.
  AC: quote order visible to staff; customer sees "We'll send your quote within X hours".

### P1.5 PayHere (sandbox)
- [ ] **Checkout hash** generated server-side; redirect/post to PayHere sandbox with `order_id = payments.merchant_reference`.
  AC: merchant secret never reaches the browser.
- [ ] **`/api/payhere/notify`**: verify `md5sig`, amount and currency vs DB, map `status_code` (2 confirmed, 0 pending, −1 cancelled, −2 failed, −3 chargeback), upsert payment idempotently, store raw payload.
  AC: replayed notification doesn't double-count; tampered signature → 400 + logged; order becomes `paid` and jobs `new` via trigger.
- [ ] **Return/cancel pages** that poll order status (never trust return URL).
  AC: shows "Payment received — your designer will start soon" only after notify confirmed.
- [ ] **Bank slip** option: upload slip → payment `pending` → staff confirms.
  AC: confirmed slip releases jobs just like PayHere.
- [ ] **Order confirmation** page `/[locale]/orders/[number]` (read-only job list + statuses).
  AC: accessible by owner or `?t=` token only; other orders return 404.

**P1 exit criteria:** a guest can buy a fixed-price mug with photo upload, pay in PayHere sandbox,
and see the order with job status `new`; a quote request reaches `quote_requested`.

---

## P2 — Job page, proofs & staff dashboard

### P2.1 Customer job page
- [ ] **Job page** `/[locale]/orders/[number]/jobs/[jobNumber]`: status timeline (job_status_history), item summary, uploaded files, chat.
  AC: works for registered, anonymous and token guests; internal notes never rendered or returned.
- [ ] **Realtime chat** (Supabase Realtime on `messages`), text + attachments (R2), localised system messages from `meta.event`.
  AC: new staff message appears < 2 s without reload; attachments open via presigned GET.
- [ ] **Proof card** with zoom, version switcher, **Approve** / **Request changes** (comment required) via `respond_to_proof` RPC; revision counter "1 of 2 free revisions used".
  AC: job status updates instantly; third+ revision shows extra-charge notice; approved proof locks.
- [ ] **Token → session claim**: opening a `?t=` link while signed in (or anonymous) attaches the order to the current user.
  AC: claimed orders appear in "My orders"; token links still work.
- [ ] **My orders** list for signed-in/anonymous users.

### P2.2 Staff dashboard (`/staff`)
- [ ] **Auth + role gate** (middleware + server checks), staff login (email magic link / password + optional TOTP for admin).
  AC: non-staff → 404; designer cannot open unassigned jobs (RLS-verified).
- [ ] **Kanban** board by job status with drag-and-drop transitions (only allowed transitions droppable), filters (designer, category, due date, overdue, rush), search by order/job number/phone.
  AC: illegal transition rejected by DB and shown as toast; board updates in realtime.
- [ ] **Job detail (staff)**: customer files download, assign designer (admin), upload proof (→ `proofs` insert), upload final print file, internal notes, chat.
  AC: proof upload sets `proof_sent` and notifies customer; internal notes styled distinctly.
- [ ] **Orders view**: list, payments, record cash/bank-slip payment, delivery info, print job ticket / packing slip (PDF or print CSS).
- [ ] **Catalogue admin**: CRUD categories, products, options/values, templates, images (R2), en/si fields.
  AC: zod-validated; slug uniqueness; preview before publish.
- [ ] **Staff management** (admin): invite staff, set role, deactivate.
- [ ] **Dashboard KPIs** from real data: jobs per status, overdue, today's pickups, revenue (paid).

**P2 exit criteria:** full loop — order paid → designer uploads proof → customer requests changes →
v2 → approve → production moves to delivered — entirely in the app, with realtime updates.

---

## P3 — Notifications, quotes, delivery, reviews, SEO

### P3.1 Notifications
- [ ] **Notification service** (`features/notifications`) with per-event templates in en/si, outbox table + retry (cron), user channel preferences.
  AC: each event sent at most once (idempotency key); failures retried and visible to admin.
- [ ] **Email** (Resend): order confirmation, payment received, proof ready, changes received, ready for pickup, dispatched (tracking), delivered + review request; staff alerts for new paid job / customer message.
- [ ] **WhatsApp** (Cloud API, approved templates) + **SMS** fallback (local gateway) for proof ready, quote ready, ready for pickup, dispatched.
  AC: templates approved by Meta; opt-out respected; phone normalised to E.164 (+94).

### P3.2 Quotes
- [ ] **Quote builder** (staff): line items, delivery fee, discount, advance %, validity → `quotes` (sent) → customer notified with pay link.
  AC: order totals updated by trigger; superseded quotes visible in history.
- [ ] **Customer quote view**: accept (`accept_quote`) → pay 50 % advance (PayHere) → jobs `new`; balance payment link after approval; printing blocked until balance paid (if decided).
  AC: amounts match quote; expired quote cannot be accepted; balance link shows `amount_due`.
- [ ] **Quote expiry cron** marks `expired`, notifies customer.

### P3.3 Delivery
- [ ] Delivery fee rules (by district / weight class), courier selection, tracking number + link, pickup ready notification with shop map.
  AC: fee computed server-side at checkout; tracking visible on job page.

### P3.4 Reviews
- [ ] Review request after `delivered`; review form (rating, text, photos to R2) via RLS insert; admin moderation; show published reviews and real aggregate rating on product pages.
  AC: impossible to review undelivered items (DB-enforced); only published reviews in JSON-LD `aggregateRating`.

### P3.5 SEO & performance
- [ ] Per-page `generateMetadata` (en/si), canonical + `hreflang`, Open Graph images (dynamic `opengraph-image`).
- [ ] `sitemap.ts` (categories, products, static pages, both locales) and `robots.ts` (disallow `/staff`, `/api`, order pages).
- [ ] JSON-LD: `LocalBusiness` (Kalutara NAP, hours, geo, phone), `Product`, `BreadcrumbList`, `FAQPage`.
- [ ] Static pages: About, Services (one landing page per service for local SEO, e.g. "Photo framing Kalutara"), Contact (map, WhatsApp), FAQ, Terms, Privacy, Refund policy (required by PayHere).
- [ ] Google Business Profile link, Search Console + sitemap submission, Vercel Analytics / Speed Insights.
  AC: Lighthouse mobile ≥ 90 performance, 100 SEO on home, category and product pages; Rich Results test passes; 0 broken links.

### P3.6 Ops hardening
- [ ] Cron: abandoned carts cleanup, orphaned R2 uploads (pending > 24 h) deletion, quote expiry.
- [ ] Error monitoring (Sentry), audit logging for admin actions, backups / PITR on Supabase prod.
- [ ] Switch PayHere to live after test transactions and refund policy page.
