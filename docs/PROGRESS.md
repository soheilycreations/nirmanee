# Progress log

Newest first. Update after every task (see `CLAUDE.md` §6).

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
