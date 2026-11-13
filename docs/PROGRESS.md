# Progress log

Newest first. Update after every task (see `CLAUDE.md` §6).

---

## 2026-11-13 — Storefront assets (`feat/storefront`)

**Done**
- `incoming/README.md`: drop zone for raw assets (what to drop, naming, targets). Not served by the site.
- Shop-front photo processed with ImageMagick: `public/brand/shop.webp` (1600×1200, 94 KB — centre crop on the
  entrance, ~1.8× upscale from the 2000×667 source, so slightly soft) and `public/brand/shop-wide.webp`
  (2400×800, 170 KB). `shop.webp` is picked up automatically by the existing home `TrustSection`
  (and the contact page); `shop-wide.webp` is the About page banner (en/si alt text).
- AI sample images: `public/products/<slug>/sample-N.webp` shown with a "Sample image" / "නිදර්ශන රූපය" label on
  product cards and the product page. They are only used when the product has no real photo (catalogue
  images or `1.webp`, `2.webp`…), are excluded from `ProductGallery`, JSON-LD and social previews.

**Decisions**
- Extended the existing `scripts/build-assets-manifest.mjs` (new `samples` map; `products` now excludes
  `sample-*`) rather than adding a second manifest; `productSampleFor()` lives in `src/lib/assets.ts`.
- Rebased on top of the Phase 1A polish commits; dropped my duplicate home trust-photo markup.

**Open questions**
- The 4:3 crop cuts off the outer side bays; send a native 4:3 / higher-res original for the full facade.
- Sinhala label/alt strings are drafts — need native review.

---

## 2026-11-08 — Phase 1A polish (`feat/storefront`)

**Bugs fixed**
- `/product/<id>`: only the 12 old prototype ids redirect (to their new product/category); anything else is a real 404.
- Shop sort: per-sq-ft products sort by their real minimum order (`minimumPrice()`: cheapest required options at the minimum billable size); search and sort now apply instantly in the browser (no Search button), state mirrored in `?q=&sort=`.
- Add to cart is optimistic: badge + toast update instantly, the save runs in the background and rolls back with an error toast if it fails. Cart quantity changes are instant (debounced save, revert on failure); remove is instant with a 6-second **Undo**.
- **Guest session bug found while testing:** a server action can be dropped by Next.js when the visitor navigates, and setting a cookie in an action re-renders the whole page (56 KB, ~2–3 s here). Cart mutations moved to `/api/cart` (route handler, `fetch` + `keepalive`, same-origin check), the session cookie write after anonymous sign-in is now awaited, sessions are read with `getClaims()`, and the cart page shows "Saving…" and refreshes itself if opened while an add is still saving.
- Cart WhatsApp message: options, design path, turnaround, skip-proof, uploaded-file count, notes, price with estimate flag, total and a short **cart reference** (`C-XXXXXX`, from the cart id).
- Cart shows delivery fees by zone from `delivery_zones` (pickup free).
- Custom size: inline min/max validation messages. Eyelets priced **per running foot of perimeter** (new modifier `per_running_ft`, Rs 20 placeholder, admin-editable).
- Home 390px: WhatsApp button shows "WhatsApp" on small screens (full label from `sm` up), never cut off.
- Locale: the URL decides the language (`localeDetection: false`); `/en/...` always English even with a Sinhala cookie.
- Tap targets: bulk-discount chips and breadcrumbs are 44px.

**Templates:** "Start from a template" only appears when a product has templates. 4 layouts each (SVG previews) for the photo mug and the two photo frames: single photo, photo + name, 2-photo collage, photo + date/message; layout hint (photos + text fields) under the picker.

**New pages:** `/privacy`, `/terms`, `/returns` (no refund after proof approval, free reprint for our faults, 48h claim window), `/faq` (FAQPage JSON-LD), `/track` (order no + phone, "available after online checkout launches" + WhatsApp). EN + SI drafts with a visible "Draft" notice (`SITE_SETTINGS.legalDraft`). Footer "Help & policies" column.

**Design:** hero image slot (recent-work collage from `public/gallery/`, illustrated tiles until photos exist) + "Ready in 24–48h · Free pickup in Kalutara"; "How your order works" journey (photo → mockup → approve → printed & delivered) on home and product pages; trust section (Google rating, address, embedded map, shop photo, "serving since") driven by `src/config/site-settings.ts`, hidden until filled; recent-work gallery (hidden if empty); multi-photo product gallery from `public/products/<slug>/1.webp…` with thumbnails (placeholder fallback kept); categories with fewer than 2 products hidden from nav/home (still reachable).

**Performance:** home, shop, categories, services, products, about, contact, FAQ and policy pages are SSG + ISR (1 h) — locally ~10 ms TTFB, served from Vercel's CDN in production. Catalogue/settings/zones read through a cookie-less public client cached under the `catalog` tag; `/api/revalidate` (secret header, Supabase DB webhooks) refreshes pages when products change. Cart badge is client state (no cookies in the layout). The proxy only touches Supabase when a session cookie exists. Each page ships only its translation namespaces (`IntlIsland`).

**Verified:** `npm run lint`, `tsc`, `npm test` (10/10), `npm run build`, full local SQL suite (7 migrations, 3 scenarios), and a 48-check Playwright run at 390px + 1366px against the live Supabase project (temporary photos/guests created and removed afterwards).

**Owner actions**
- Run migrations `20261111000000_cart_policies.sql`, `20261112000000_running_ft_modifier.sql` (on its own), `20261112000100_eyelets_and_templates.sql` in the SQL editor; afterwards `public/templates/mug-birthday.svg`, `mug-love.svg`, `mug-logo.svg` can be deleted.
- Set `REVALIDATE_SECRET` on Vercel + create the Supabase DB webhooks (`docs/SETUP.md` §3b).
- Photos, business details and text reviews: `docs/CONTENT-CHECKLIST.md`.
- Two anonymous users from before this session (10:46, 11:03 UTC) were left untouched — probably your own test visits.

---

## 2026-11-08 — Live Supabase verification (`feat/storefront`)

**State of the live project `jvejmlwpahjittbzztmy`** (owner ran the combined SQL): migrations 1–4 + seed applied (19 products, 12 categories, 3 templates, settings, delivery zones), anonymous sign-ins enabled, owner's admin account + `staff` row created. Keys (`sb_publishable_` / `sb_secret_`, `ORDER_TOKEN_SECRET`) provided via environment variables.

**Bug found and fixed**
- Creating a cart failed live: `INSERT … RETURNING` on `carts` violated RLS because the policy's `app.owns_cart(id)` lookup can't see the row being inserted (local tests had inserted without RETURNING). Fixed twice: the app now inserts without RETURNING and re-reads the active cart (handles the two-tab race via the unique index), and migration `20261111000000_cart_policies.sql` rewrites the carts policies to check the row's `user_id` / `guest_token_hash` directly. **Migration 5 still needs to be run by the owner** — the app works without it.

**Live checks — 29/29 passed** (real UI + real database, temporary test users deleted afterwards)
- Guest add-to-cart → anonymous auth user + session cookie; header count; cart persists across navigation; option labels; quantity update and remove persisted; one active cart reused; second browser sees an empty cart.
- RLS as an anonymous user: can't see others' carts, staff, orders, payments or coupons; can't create a cart for someone else; second active cart rejected; can't change product prices; public settings readable.
- Anonymous user cannot be made staff (trigger); guests are redirected from `/admin`.
- Staff login: non-staff account refused (and stays locked out), designer signs in to the dashboard, sign-out re-locks `/admin`, wrong password shows an error.
- Uploader correctly falls back to WhatsApp (R2 not configured yet).
- `npm run lint`, `tsc`, `npm test` (9/9), `npm run build`, full local SQL suite (5 migrations, 3 scenario files) green.

**Not yet verified:** owner's own admin login (password unknown to me — owner to test), R2 uploads (no R2 credentials), Vercel deployment with these env vars.

**Follow-ups**
- `NextIntlClientProvider` currently ships the full message catalogue to the browser — pass only client namespaces (perf, P1).
- Generate `src/types/database.ts` (needs Supabase CLI access or the owner running `supabase gen types`).

---

## 2026-11-08 — Supabase hookup prep (`feat/storefront`)

**Done**
- `.env.local` created from `.env.example` (gitignored, mode 600) with the project URL/ref and public settings; secrets left blank.
- Cloud environment allowlist: added `jvejmlwpahjittbzztmy.supabase.co` and `api.supabase.com`.
- Switched to the new Supabase keys: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` / `SUPABASE_SECRET_KEY` (legacy `ANON_KEY` / `SERVICE_ROLE_KEY` still accepted as fallback; a publishable key in the secret slot is rejected).
- Migration `20261110000000_anonymous_users.sql`: `app.is_anonymous()`, anonymous sessions never get staff rights, anonymous users can't be added to `staff`, one active cart per user, reviews need a permanent account or order token, guests can't set a profile email. Test `supabase/tests/anonymous_scenario.sql`; all four scenario files pass on local Postgres 16.
- `docs/SETUP.md`: new keys, first admin account steps, pre-launch checklist (captcha/Turnstile on auth, rate limits, disable legacy keys, R2 CORS, cleanup jobs, PayHere live).
- `supabase/.temp/` gitignored.

**Blocked / waiting on the owner**
- Migrations + seed not yet applied to the live project: the owner declined to provide a Supabase personal access token, and direct Postgres is not reachable from the sandbox → owner runs the combined SQL in the dashboard SQL editor.
- Publishable/secret keys and ORDER_TOKEN_SECRET not yet provided → live verification of cart / anonymous auth / staff login pending.

---

## 2026-11-08 — Phase 1A: storefront → cart (`feat/storefront`)

**Owner decisions applied**
1. Legacy tables dropped by a migration ordered before the foundation schema.
2. Guests: Supabase anonymous sign-in (+ order token links later).
3. Printing blocked in the DB until the order is fully paid (quote balance + paid revisions).
4. 3rd+ revision = Rs 500 each (`app_settings.revision_fee_lkr`), shown on the product page before ordering; `revision_fee_preview()` RPC for the proof screen (P2).
5. Designers see assigned jobs + an unassigned queue and can `claim_job()`.
6. Delivery zones (Kalutara district / Western Province / rest of island, admin-editable, placeholder fees); pickup free.
7. Direction A "Ink & Paper"; branded placeholders until real photos/vector logo arrive.

**Done**
- Migrations `20261107000000_drop_legacy_tables.sql`, `20261109000000_phase1a_storefront.sql` + `supabase/tests/phase1a_scenario.sql` (all scenarios pass on local Postgres 16).
- Catalogue seed as one JSON source (`supabase/seed/catalog.json`: 12 categories, 19 products, options, quantity tiers, 3 mug templates) → `npm run db:seed` → `supabase/seed.sql`.
- Critical fixes: working mobile nav (drawer, Esc/overlay close, focus return), "Admin Panel" link removed, `/admin` behind Supabase Auth + active staff role (proxy + server check, fails closed), real 404s (`/products/unknown`, unknown paths), all nav/footer links real, no fake reviews/ratings/old prices/stock photos, NIRMANEE20 bar removed, old `/product/:id` → `/shop` redirect, default favicon and 7 MB of WhatsApp/AI images removed.
- Redesigned in Ink & Paper, mobile-first: Home (products above the fold at 390px — first card at 524px), Shop (+ `/shop/[category]`, server-side search/sort via GET form), Services (one section per service with anchors), About, Contact, Cart, localised 404. Floating WhatsApp button (hidden on mobile product pages where the sticky bar is), 44px tap targets, `next/image`.
- Products server-rendered from Supabase; falls back to the seed JSON in preview mode.
- Product page: three paths (Upload / Design it for me +fee / Template), live price (size incl. custom W×H, material, finish, colour, qty tiers, Standard/Express), sticky price + Add to cart bar on mobile, "Ready in X days · Pickup Kalutara · Islandwide 2–4 days", "Skip proof, print as-is", design brief/notes, revision-fee notice.
- Pricing engine `src/lib/pricing.ts` shared by client preview and server action; 9 unit tests (`npm test`).
- Uploader: direct presigned PUT to R2 (JPG/PNG/HEIC/PDF/AI/ZIP, ≤500 MB, ≤10 files), thumbnails, progress bar, server-side size verification (HeadObject), low-resolution warning from print size (300 ppi target, 100 for large format), WhatsApp fallback.
- Cart: Supabase `carts`/`cart_items` with anonymous auth (RLS), cookie cart in preview mode; quantity update, remove, uploaded-file count, delivery info, "Send cart on WhatsApp" until checkout ships.
- i18n: next-intl, `/` English + `/si` Sinhala, full UI catalogues, `lang` per locale, Sinhala fonts/line-height, language toggle keeps the current page.
- SEO: per-page metadata + canonical + hreflang, Open Graph/Twitter + generated OG image, `sitemap.xml` (both locales), `robots.txt` (previews disallowed), LocalBusiness / Product / BreadcrumbList JSON-LD.
- Security headers (HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy).
- Verified: `npm run lint` clean, `tsc` clean, `npm test` 9/9, `npm run build` OK, Playwright run (mobile nav, language switch, customise → add to cart → update → remove, search/sort, 0 console errors, no horizontal scroll).

**Not verified (needs owner setup, see `docs/SETUP.md`)**
- Supabase-mode cart, anonymous sign-in, staff login and R2 uploads were type-checked and RLS-tested in SQL, but not run against a live Supabase project / R2 bucket (no credentials in this environment).

**Open items for the owner**
- Create Supabase project + R2 bucket and add env vars on Vercel (`docs/SETUP.md`).
- Confirm placeholder prices in `supabase/seed/catalog.json` and delivery-zone fees.
- Review Sinhala text (`messages/si.json`, seed JSON).
- Shop street address, Google Maps link, Facebook/Instagram URLs, contact email.
- Real photos + vector logo.

**Next:** P1B — checkout (contact, delivery zone, order creation via service role), PayHere sandbox with notify_url md5sig verification, order confirmation page.

---

## 2026-11-08 — Foundation (`feat/foundation`)

**Done**
- Full audit of `src/`, `supabase/`, `public/` → `docs/AUDIT.md` (top 10 findings, routes,
  components, security, SEO, reuse/delete plan).
- `CLAUDE.md`: vision, stack, folder conventions, coding rules, branch rule, progress rule.
- Database design → `docs/SCHEMA.md` + `supabase/migrations/20261108000000_foundation_schema.sql`
  (21 tables, trigger-driven job state machine, RLS on every table, `respond_to_proof` /
  `accept_quote` RPCs, Realtime publication). **Not applied to any Supabase project.**
- Verified the migration on local Postgres 16 with Supabase stubs: `supabase/tests/foundation_scenario.sql`
  passes (fixed + quote flows, revisions, guest token access, internal-note isolation, designer
  scoping, review gate, payment-driven job release).
- `supabase/seed.sql` with the 12 service categories (Sinhala names = draft, needs native review).
- Design proposal → `docs/DESIGN.md` (A "Ink & Paper" recommended, B "Studio Workshop").
  Direction A tokens implemented in `src/app/globals.css`; fonts (Inter, Fraunces, Noto Sans
  Sinhala, Abhaya Libre) wired in `src/app/layout.tsx`. Pages intentionally unchanged visually.
- Root metadata fixed (was "Create Next App"); `themeColor`, Open Graph basics.
- `.env.example` with all Supabase / R2 / PayHere / site / notification vars; `.gitignore` fixed
  so `.env.example` can be committed.
- `docs/ROADMAP.md` with P1–P3 checklists and acceptance criteria.
- `npm run build` ✅. `eslint src`: 14 pre-existing errors in mock pages (to be deleted in P1),
  none in files touched here.

**Open decisions (need owner input)** — see summary in the PR / chat:
1. Was legacy `supabase/schema.sql` applied to the live Supabase project? Any data to keep?
2. Guest model: Supabase anonymous auth + order token links (recommended)?
3. Quote orders: must the balance be paid before printing, or after approval but before
   pickup/dispatch?
4. Third+ revision: charge a fee (amount?) or just warn?
5. Designers: see only assigned jobs (implemented) or also an unassigned "pick-up" queue?
6. Delivery fees: flat islandwide, per district, or quoted?
7. Design direction A vs B; any brand assets (vector logo, real photography plan)?
8. Domain: stay on `nirmanee.vercel.app` or move to `nirmanee.lk` (footer mentions it)?

**Next:** P1.1 platform setup (Supabase dev project, `@supabase/ssr`, env validation, next-intl,
remove public admin).
