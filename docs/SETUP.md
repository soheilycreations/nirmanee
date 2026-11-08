# Going live with real data (Supabase + R2)

Without environment variables the site runs in **preview mode**: catalogue from
`supabase/seed/catalog.json`, cart in a browser cookie, uploads replaced by a
WhatsApp link, and `/admin` denies everyone. Follow these steps to switch on the
real backend.

## 1. Supabase

1. Create a project (region: Singapore `ap-southeast-1` is closest to Sri Lanka).
2. Apply migrations in order — either
   - CLI: `supabase link --project-ref <ref>` then `supabase db push`, or
   - SQL editor: paste each file from `supabase/migrations/` in filename order, then `supabase/seed.sql`.
   Files:
   - `20261107000000_drop_legacy_tables.sql` — removes the old mock tables
   - `20261108000000_foundation_schema.sql`
   - `20261109000000_phase1a_storefront.sql`
   - `20261110000000_anonymous_users.sql` — guests (anonymous auth) can never act as staff, one active cart per user, reviews need a permanent account or order token
3. Load the catalogue: run `supabase/seed.sql` (regenerate with `npm run db:seed`
   after editing `supabase/seed/catalog.json`).
4. **Authentication → Sign In / Providers → enable "Allow anonymous sign-ins"**
   (guest carts depend on it).
5. **API keys**: Project Settings → API Keys → use the **publishable** (`sb_publishable_…`)
   and **secret** (`sb_secret_…`) keys in `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` /
   `SUPABASE_SECRET_KEY`. Once every deployment uses them, **disable the legacy JWT
   `anon` / `service_role` keys** in the same screen.
6. Create your first admin — see "First admin account" below.
7. Settings you can change any time (admin-editable tables):
   - `app_settings`: `revision_fee_lkr` (500), `free_revisions` (2)
   - `delivery_zones`: fees for `kalutara`, `western`, `island` (placeholders 350 / 450 / 600)

## 2. Cloudflare R2

1. Create a **private** bucket, e.g. `nirmanee-jobs`.
2. Create an API token with *Object Read & Write* on that bucket only.
3. Bucket → Settings → **CORS policy** (required for direct browser uploads):
   ```json
   [
     {
       "AllowedOrigins": ["https://nirmanee.vercel.app", "https://*.vercel.app", "http://localhost:3000"],
       "AllowedMethods": ["PUT", "GET", "HEAD"],
       "AllowedHeaders": ["Content-Type"],
       "ExposeHeaders": ["ETag"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```
   Narrow `*.vercel.app` to your own preview domain pattern once known.
4. Optional lifecycle rule: delete objects under `carts/` older than 30 days
   (abandoned uploads).

## 3. Vercel environment variables

Set for Production **and** Preview (see `.env.example` for all):

| Variable | Needed for |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | catalogue, cart, staff login |
| `SUPABASE_SECRET_KEY` (server only) | upload confirmation, linking files to cart items |
| `ORDER_TOKEN_SECRET` (server only) | signing guest order links (P1B) — `openssl rand -base64 48` |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_ENDPOINT` | uploads |
| `NEXT_PUBLIC_SITE_URL` | canonical URLs, sitemap (`https://nirmanee.vercel.app`, later `https://nirmanee.lk`) |
| `NEXT_PUBLIC_CONTACT_EMAIL` | optional, shows email on Contact page |

Uploads switch on only when Supabase **and** the secret key **and** all R2
variables are present. A partially configured group fails loudly at runtime.

Redeploy after changing variables (they are read at build/request time).

## 4. First admin account

1. Supabase Dashboard → **Authentication → Users → Add user → Create new user**.
   Enter your email and a strong password, tick **Auto Confirm User**, create.
2. **SQL Editor** → run (replace the email and name):
   ```sql
   insert into public.staff (user_id, role, display_name)
   select id, 'admin', 'Owner'
   from auth.users
   where email = 'you@example.com' and not is_anonymous;
   ```
   It must report `INSERT 0 1`. (`INSERT 0 0` = email typo or user not created.)
3. Open `https://nirmanee.vercel.app/admin` (or the preview URL) → sign in.
4. More staff later: same steps with role `designer` or `production`.
   Deactivate someone: `update public.staff set is_active = false where user_id = …;`

Do **not** enable public email sign-ups for staff: staff accounts are created by an
admin only. (Customer sign-up comes later; guests use anonymous sign-in.)

## 5. Pre-launch checklist (before real customers)

- [ ] **Captcha on auth** — Supabase: Authentication → Attack Protection → enable
      **Cloudflare Turnstile** (or hCaptcha), add the site key to the app and pass
      `options.captchaToken` to `signInAnonymously()` / `signInWithPassword()`.
      Anonymous sign-ins without captcha let bots create unlimited guest users/carts.
- [ ] Auth rate limits reviewed (Authentication → Rate Limits), esp. anonymous sign-ins per IP.
- [ ] Legacy JWT `anon` / `service_role` keys disabled; secret key rotated after setup.
- [ ] R2 CORS narrowed to the production domain (+ preview pattern).
- [ ] Placeholder prices and delivery fees confirmed; Sinhala reviewed.
- [ ] Cleanup job for abandoned anonymous users and carts (P3 cron).
- [ ] PayHere switched from sandbox to live after test transactions.

## 6. Smoke test

1. Home → product → upload a photo from a phone → progress bar → "Uploaded".
2. Add to cart → header count updates → `/cart` lists the item with "1 file uploaded".
3. `/admin` → redirected to login → staff account signs in → dashboard; a non-staff
   account is refused.
4. `/sitemap.xml` lists product URLs; `/robots.txt` on Preview disallows everything.
