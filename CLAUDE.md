# CLAUDE.md — Nirmanee Digital Print House

Read this before every task. Then read `docs/PROGRESS.md` to see where we are.

## 1. Product vision

Nirmanee is a digital print shop in **Kalutara, Sri Lanka** (digital printing, banners, photo
framing, mug/sublimation, crystal printing, laser cutting & wood engraving, plan printing, T-shirts,
edible print, custom souvenirs).

The website is **not a normal shop — it is an online print studio where every order becomes a JOB**:

```
pick product → customise (photos, text, size, options, notes) → pay
→ our designer makes the artwork → proof posted in the job chat
→ customer clicks Approve or Request changes (2 free revisions)
→ printing → QC → dispatch / pickup → delivered
```

**Order types**
- **FIXED** — catalogue items with a fixed price (mugs, frames, clocks). Full payment at checkout.
- **QUOTE** — banners, bulk, custom sizes. Customer submits a request → team sets the price in chat
  → customer pays a **50 % advance** via pay link → balance after proof approval.

**Job statuses:** `new, artwork_in_progress, proof_sent, changes_requested, approved, printing,
quality_check, ready_for_pickup, dispatched, delivered, cancelled` + quote-only `quote_requested,
quote_sent, awaiting_payment` (fixed orders also wait in `awaiting_payment` until paid).

Guest checkout is allowed. Staff roles: **admin, designer, production**.
Languages: **English + Sinhala** everywhere customer-facing.

## 2. Stack

| Concern | Choice |
|---|---|
| Framework | Next.js (App Router) 16 + React 19 + TypeScript (strict) |
| Styling | Tailwind CSS 4 — CSS-first config: tokens live in `src/app/globals.css` `@theme` (there is no `tailwind.config.*`) |
| DB / Auth / Realtime | Supabase (Postgres + RLS + Auth incl. anonymous sign-in + Realtime) via `@supabase/ssr` |
| Files | Cloudflare R2 (private bucket), presigned URLs, direct browser upload, up to 500 MB |
| Payments | PayHere (sandbox first), server-side `notify_url` verification with `md5sig` |
| i18n | next-intl, locales `en` (default) and `si`, routes `/[locale]/…` |
| Validation | zod (all inputs: forms, server actions, route handlers, env) |
| Hosting | Vercel |
| Request middleware | `src/proxy.ts` (Next 16 renamed `middleware.ts` → `proxy.ts`): next-intl routing, Supabase session refresh, `/admin` gate |

## 3. Folder conventions

```
src/
  app/
    [locale]/                 customer-facing routes (next-intl)
      (shop)/                 home, categories, products, cart, checkout
      orders/[orderNumber]/   job page (chat, proofs, approve)
      account/
    staff/                    staff dashboard (auth + role gated, not localised)
    api/
      payhere/notify/route.ts PayHere server-to-server callback
      cron/…                  Vercel cron jobs
  components/
    ui/                       design-system primitives (Button, Card, Input, Badge…)
    shop/  job/  staff/  layout/
  features/<domain>/          domain logic: actions.ts (server actions), queries.ts, schemas.ts (zod), types.ts
                              domains: catalog, cart, checkout, orders, jobs, proofs, messages, payments, quotes, uploads, reviews
  lib/
    supabase/{server,browser,admin}.ts   admin.ts = service role, imports "server-only"
    r2/        payhere/      env.ts (zod-validated env)      pricing.ts      utils.ts
  i18n/        next-intl config + request.ts
  types/database.ts            generated: supabase gen types typescript
messages/{en,si}.json          translation catalogues
supabase/
  migrations/                  ALL schema changes, timestamped
  seed.sql                     local seed data
  tests/                       SQL scenario tests
docs/                          AUDIT, SCHEMA, DESIGN, ROADMAP, PROGRESS
```

## 4. Coding rules

1. **TypeScript strict.** No `any` (use `unknown` + zod), no `@ts-ignore`, no non-null `!` without a comment explaining why.
2. **Server Components by default.** Add `"use client"` only for interactivity; keep client components small and leaf-level.
3. **Mutations = Server Actions** (`features/<domain>/actions.ts`, `"use server"`). Route handlers only for webhooks (PayHere), cron and third-party callbacks.
4. **Validate everything with zod** at the boundary: server action inputs, route handler bodies, search params, env vars (`lib/env.ts`). Never trust the client for prices, totals, statuses or ownership.
5. **Prices are computed server-side only** (`lib/pricing.ts`), using DB product/option data. Cart items store selections, never prices.
6. **Database changes only as migrations** in `supabase/migrations/<timestamp>_<name>.sql`. Never edit an applied migration — add a new one. Regenerate `src/types/database.ts` after each.
7. **RLS on every table**, with explicit policies. Remember guests are `authenticated` too (anonymous auth) — use `app.is_anonymous()` when a rule needs a permanent account. New table without RLS = rejected. Business rules that must always hold (status transitions, payment recalculation, revision counts) live in **DB triggers/functions**, not only in app code.
8. **Secret key** (`SUPABASE_SECRET_KEY`, `sb_secret_…`; legacy service_role) only in `lib/supabase/admin.ts` (with `import "server-only"`), used only where RLS cannot express the operation (checkout insert, PayHere notify, upload confirmation). Prefer the user-scoped server client.
9. **No secrets in code or in `NEXT_PUBLIC_*`.** All config via env vars documented in `.env.example`. Never log secrets, tokens, or full PayHere payloads to the client.
10. **Files go to R2, never to `public/` or the DB.** Use presigned PUT/GET with short TTLs; verify size/type server-side; record every object in `job_files`.
11. **PayHere:** compute the checkout `hash` server-side; on `notify_url` verify `md5sig` (`UPPER(MD5(merchant_id + order_id + payhere_amount + payhere_currency + status_code + UPPER(MD5(merchant_secret))))`), check amount/currency against our DB, make the handler idempotent (unique `provider_reference`), then insert the payment with the service role. Never mark paid from `return_url`.
12. **i18n:** no hardcoded user-facing strings in components — use next-intl messages (`messages/en.json`, `messages/si.json`). DB content uses `*_en` / `*_si` columns with English fallback. Set `lang` on `<html>` per locale.
13. **Design system:** use tokens (`bg-surface`, `text-fg`, `bg-primary`, `rounded-card`, `shadow-card`, `font-display`…) from `globals.css`; don't introduce raw hex colours or new arbitrary values without adding a token. See `docs/DESIGN.md`.
14. **Images:** `next/image` with real `alt` text (en/si). Descriptive kebab-case filenames.
15. **Accessibility:** semantic HTML, labels on every input, visible focus, 4.5:1 text contrast, keyboard-operable dialogs.
16. **No fake data in production UI** — no invented reviews, ratings, discounts, stats or claims.
17. **Full-file outputs:** when showing or writing code, output complete files — no `// ...rest unchanged` placeholders.
18. Keep `npm run lint` and `npm run build` green before every commit.

## 5. Git workflow

- Branch per task: **`feat/<name>`** (also `fix/<name>`, `chore/<name>`). Never commit directly to `main`.
- Small, focused commits with descriptive messages (imperative mood).
- Open a PR to `main`; Vercel preview must build.

## 6. After every task

**Update `docs/PROGRESS.md`**: date, branch, what was done, files touched, decisions made, open
questions, next step. Also tick the matching items in `docs/ROADMAP.md`. If the schema changed,
update `docs/SCHEMA.md` in the same commit.

## 7. Preview mode

With no Supabase env the app still runs: catalogue from `supabase/seed/catalog.json`, cart in a cookie, uploads → WhatsApp, `/admin` denied. Keep both paths working until production is configured (`docs/SETUP.md`).

## 8. Useful commands

```bash
npm run dev                 # local dev server
npm run lint && npm run build
npm test                    # pricing engine unit tests (node --test)
npm run db:seed             # regenerate supabase/seed.sql from supabase/seed/catalog.json
supabase start && supabase db reset          # local DB with migrations + seed
supabase gen types typescript --local > src/types/database.ts
```

Live project: `jvejmlwpahjittbzztmy` (keys come from the environment / `.env.local`, never commit them).
In the Claude cloud sandbox, Node only reaches Supabase through the proxy with
`NODE_USE_ENV_PROXY=1` (e.g. `NODE_USE_ENV_PROXY=1 npm start`).

SQL scenario test without Docker (plain Postgres 15+):
```bash
psql -d test -f supabase/tests/_supabase_stub.sql \
  -f supabase/migrations/20261107000000_drop_legacy_tables.sql \
  -f supabase/migrations/20261108000000_foundation_schema.sql \
  -f supabase/migrations/20261109000000_phase1a_storefront.sql \
  -f supabase/migrations/20261110000000_anonymous_users.sql \
  -f supabase/migrations/20261111000000_cart_policies.sql \
  -f supabase/tests/_grants.sql -f supabase/tests/foundation_scenario.sql \
  -f supabase/tests/phase1a_scenario.sql -f supabase/tests/anonymous_scenario.sql
```
