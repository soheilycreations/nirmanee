# Progress log

Newest first. Update after every task (see `CLAUDE.md` §6).

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
