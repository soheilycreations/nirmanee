# Going live with real data (Supabase + R2)

Without environment variables the site runs in **preview mode**: catalogue from
`supabase/seed/catalog.json`, cart in a browser cookie, uploads replaced by a
WhatsApp link, and `/admin` denies everyone. Follow these steps to switch on the
real backend.

## 1. Supabase

1. Create a project (region: Singapore `ap-southeast-1` is closest to Sri Lanka).
2. Apply migrations in order (CLI: `supabase link --project-ref <ref>` then `supabase db push`):
   - `20261107000000_drop_legacy_tables.sql` — removes the old mock tables
   - `20261108000000_foundation_schema.sql`
   - `20261109000000_phase1a_storefront.sql`
3. Load the catalogue: run `supabase/seed.sql` in the SQL editor (regenerate with
   `npm run db:seed` after editing `supabase/seed/catalog.json`).
4. **Authentication → Sign In / Providers → enable "Allow anonymous sign-ins"**
   (guest carts depend on it). Recommended: enable Cloudflare Turnstile / captcha
   for anonymous sign-ins to limit abuse.
5. Create staff users: Authentication → Users → "Add user" (email + password), then in SQL:
   ```sql
   insert into public.staff (user_id, role, display_name)
   select id, 'admin', 'Owner' from auth.users where email = 'owner@example.com';
   ```
   Roles: `admin`, `designer`, `production`.
6. Settings you can change any time (admin-editable tables):
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
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | catalogue, cart, staff login |
| `SUPABASE_SERVICE_ROLE_KEY` | upload confirmation, linking files to cart items |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_ENDPOINT` | uploads |
| `NEXT_PUBLIC_SITE_URL` | canonical URLs, sitemap (`https://nirmanee.vercel.app`, later `https://nirmanee.lk`) |
| `NEXT_PUBLIC_CONTACT_EMAIL` | optional, shows email on Contact page |

Uploads switch on only when Supabase **and** the service role key **and** all R2
variables are present. A partially configured group fails loudly at runtime.

Redeploy after changing variables (they are read at build/request time).

## 4. Smoke test

1. Home → product → upload a photo from a phone → progress bar → "Uploaded".
2. Add to cart → header count updates → `/cart` lists the item with "1 file uploaded".
3. `/admin` → redirected to login → staff account signs in → dashboard; a non-staff
   account is refused.
4. `/sitemap.xml` lists product URLs; `/robots.txt` on Preview disallows everything.
