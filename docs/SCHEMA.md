# Database schema

Source of truth: [`supabase/migrations/20261108000000_foundation_schema.sql`](../supabase/migrations/20261108000000_foundation_schema.sql).
Status: **written and tested locally (Postgres 16 + Supabase auth stubs), NOT applied to production.**

Scenario test: [`supabase/tests/foundation_scenario.sql`](../supabase/tests/foundation_scenario.sql)
(fixed order → payment → proof → changes → re-proof → guest approval → print → deliver → review;
quote → accept → 50 % advance; RLS isolation checks).

---

## 1. Core idea

```
order (fixed | quote)
 └─ order_item  ──1:1──  job  ── status machine ──► delivered
                          ├─ job_files   (R2 index: customer_upload | proof | final_print | attachment)
                          ├─ proofs      (v1, v2, … pending → approved | changes_requested | superseded)
                          ├─ messages    (chat: customer | staff | system, internal notes)
                          └─ job_status_history (audit, trigger-written)
order ─ payments (payhere | bank_slip | cash; full | advance | balance)
order ─ quotes   (quote orders only; draft → sent → accepted)
```

Money is `numeric(12,2)` LKR. Sizes are stored in **inches** (`width_in`, `height_in`);
`order_items.area_sqft` is generated (`w × h / 144`). Timestamps are `timestamptz`; business dates
(due dates) use `Asia/Colombo`.

Bilingual content uses paired columns `*_en` / `*_si` (Sinhala nullable → falls back to English).

## 2. Enums

| Enum | Values |
|---|---|
| `staff_role` | admin, designer, production |
| `order_type` | fixed, quote |
| `order_status` | open, completed, cancelled (auto: completed when all jobs delivered/cancelled) |
| `order_payment_status` | unpaid, partially_paid, paid, refunded |
| `delivery_method` | pickup, courier |
| `pricing_mode` | fixed, per_sqft, quote |
| `option_type` | size, material, finish, color, text, photo_slots |
| `price_modifier_type` | flat (+LKR/unit), percent (+%), per_sqft (+LKR/sqft) |
| `job_status` | quote_requested, quote_sent, awaiting_payment, new, artwork_in_progress, proof_sent, changes_requested, approved, printing, quality_check, ready_for_pickup, dispatched, delivered, cancelled |
| `file_kind` | customer_upload, proof, final_print, attachment |
| `upload_status` | pending, uploaded, failed |
| `proof_status` | pending, approved, changes_requested, superseded |
| `sender_type` | customer, staff, system |
| `payment_provider` | payhere, bank_slip, cash |
| `payment_kind` | full, advance, balance, extra (e.g. paid extra revision) |
| `payment_status` | pending, confirmed, failed, cancelled, refunded, chargeback |
| `quote_status` | draft, sent, accepted, rejected, expired, superseded |
| `discount_type` | percent, fixed |

## 3. Tables

### Identity
| Table | Key columns | Notes |
|---|---|---|
| `profiles` | `id` = `auth.users.id`, full_name, email, phone, locale | Auto-created by trigger on sign-up (incl. Supabase **anonymous** users). |
| `staff` | `user_id` → profiles, `role`, display_name, is_active | An active row makes a user staff. Managed by admins only. |

### Catalogue
| Table | Key columns | Notes |
|---|---|---|
| `categories` | slug, name_en/si, parent_id, image_key, sort_order, is_active | Seeded with the 12 services (`supabase/seed.sql`). |
| `products` | category_id, slug, name/description en/si, `order_type`, `pricing_mode`, base_price, price_per_sqft, min_sqft, min/max_quantity, production_days, requires_artwork, images jsonb, specs jsonb, seo_* | Check constraint: fixed ⇒ base_price; per_sqft ⇒ price_per_sqft; quote ⇒ order_type quote. |
| `product_options` | product_id, `type`, code, label en/si, is_required, `config` jsonb | One row per customisation dimension. `config` holds type-specific rules (custom-size limits, text max length, photo slot count + min px). |
| `product_option_values` | option_id, label en/si, value, `modifier_type`, `price_modifier`, width_in/height_in (size presets), swatch_hex, is_default | Choices for size/material/finish/color. Max one default per option. |
| `product_templates` | product_id, name en/si, preview_key, source_key, config | Ready-made layouts the customer can start from. |

**Pricing (computed server-side only):**
```
fixed:     unit = base_price + Σflat + base_price·Σpercent/100
per_sqft:  area = max(w·h/144, min_sqft)
           unit = area · (price_per_sqft + Σper_sqft) + Σflat, then ·(1+Σpercent/100)
quote:     staff sets price via quotes
line_total = unit · quantity
```

### Cart
| Table | Key columns | Notes |
|---|---|---|
| `carts` | user_id **or** guest_token_hash, status, coupon_id, expires_at | Owner = logged-in/anonymous user or guest cookie token (sha256 stored). |
| `cart_items` | cart_id, product_id, template_id, quantity, selections jsonb, width_in, height_in, notes | **No prices stored** — always recomputed. Uploads made while customising attach to the cart item (`job_files.cart_item_id`) and are re-parented to the job at checkout. |

### Orders & jobs
| Table | Key columns | Notes |
|---|---|---|
| `orders` | order_number (`NP-26-000123`), user_id (nullable), access_token_hash, type, status, payment_status, customer_name/email/phone, delivery_method, shipping_address jsonb, subtotal, discount_total, delivery_fee, total, amount_paid, **amount_due** (generated), advance_percent (100 fixed / 50 quote), coupon_id, courier_name, tracking_number | Created by the checkout server action with the service role. `total = max(subtotal − discount, 0) + delivery_fee` enforced by check. Courier ⇒ address required. |
| `order_items` | order_id, product_id, product_snapshot jsonb, selections jsonb, quantity, width_in, height_in, area_sqft (generated), unit_price, line_total, notes, position | Immutable snapshot of what was bought. Inserting one **creates its job**. |
| `jobs` | order_item_id (unique), order_id, job_number (`NP-26-000123-1`), status, assigned_designer, due_date, revision_count, max_free_revisions (2), priority, status_changed_at | Status machine enforced in DB. |
| `job_files` | job_id or cart_item_id, kind, r2_key (unique), original_filename, content_type, size_bytes (≤ 500 MB), width_px, height_px, checksum_sha256, upload_status, slot_index, uploaded_by | Index of R2 objects. Row inserted `pending` before the presigned PUT; server marks `uploaded` after verifying the object. |
| `proofs` | job_id, version (auto), file_id (kind=proof), status, staff_note, customer_comment, created_by, responded_by/at | At most one `pending` proof per job; a new proof supersedes the previous pending one. |
| `messages` | job_id, sender_type, sender_id, body, attachments uuid[], internal, proof_id, meta jsonb | `internal` = staff-only note (customers can never post or see them). System messages carry `meta.event` (`job_created`, `status_changed`, `proof_posted`, `proof_response`) so the UI can localise them. |
| `job_status_history` | job_id, from_status, to_status, changed_by, created_at | Append-only, trigger-written. Powers the customer timeline. |

### Money
| Table | Key columns | Notes |
|---|---|---|
| `payments` | order_id, provider, kind, amount, status, merchant_reference (unique, sent to PayHere as `order_id`), provider_reference (PayHere `payment_id`, unique per provider), method, slip_file_key, raw_payload, verified_by, confirmed_at | Staff-only table. PayHere rows are written by the `notify_url` handler (service role) after md5sig verification; cash / bank-slip rows by admin/production. amount & order immutable. |
| `quotes` | order_id, version, status, line_items jsonb, subtotal, delivery_fee, discount_total, total (generated), advance_percent (50), valid_until, note | Quote orders only. |
| `coupons` | code (citext, unique), discount_type, value, max_discount, min_order_total, window, usage_limit, per_customer_limit, used_count, category_id | Never readable by customers; validated server-side. |
| `coupon_redemptions` | coupon_id, order_id (unique), user_id, amount | Trigger enforces validity/limits and bumps `used_count`. |

### Reviews
| Table | Key columns | Notes |
|---|---|---|
| `reviews` | order_item_id (unique), product_id (auto), user_id, author_name, rating 1–5, body, photo_keys, is_published | Insert only allowed when the item's job is `delivered` and the caller owns the order. Always unpublished until an admin approves. |

## 4. Job status machine

```
quote_requested ⇄ quote_sent ─accept→ awaiting_payment ─advance paid→ new
                                          ▲ (fixed orders start here)
new ─► artwork_in_progress ─► proof_sent ─► approved ─► printing ─► quality_check ─► ready_for_pickup ─► delivered
 │                              │   ▲                      ▲            │                 │
 │                              ▼   │                      └── reprint ─┘                 └► dispatched ─► delivered
 │                       changes_requested                               quality_check ─► dispatched
 └─► proof_sent / approved (print-ready customer file)
any non-final ─► cancelled          delivered, cancelled = final
```

Allowed transitions live in `app.job_transition_allowed(from, to)`; any other update raises
`invalid job status transition`.

## 5. Triggers (trigger-first business logic)

| Event | Effect |
|---|---|
| `orders` insert | Generates `order_number`; quote orders default to 50 % advance. |
| `order_items` insert | Creates the job: `quote_requested` (quote) / `awaiting_payment` (fixed, unpaid) / `new` (already paid). |
| `jobs` status change | Validates transition; sets `status_changed_at`; `changes_requested` ⇒ `revision_count + 1`; `new` ⇒ `due_date = today + product.production_days`; writes `job_status_history`; posts a system message (except `proof_sent`, announced by the proof card); notes when a revision exceeds the free allowance; closes the order when all jobs are delivered/cancelled. |
| `jobs` update by non-admin staff | Blocks changes to `assigned_designer`, `max_free_revisions`, manual `revision_count`. |
| `proofs` insert | Validates file (kind=proof, same job); assigns next `version`; supersedes previous pending proof; job ⇒ `proof_sent`; posts proof-card system message. |
| `proofs` status change | Only from `pending`; `approved` ⇒ job `approved`; `changes_requested` ⇒ job `changes_requested` (+1 revision). |
| `payments` insert / status change | Recalculates `orders.amount_paid`, `payment_status`, `paid_at`; once `amount_paid ≥ total × advance_percent` jobs `awaiting_payment` ⇒ `new`. |
| `quotes` sent | Supersedes older sent quote; copies totals + advance % to the order; jobs `quote_requested` ⇒ `quote_sent`. |
| `quotes` accepted | Jobs `quote_sent` ⇒ `awaiting_payment` (then the advance payment releases them). |
| `coupon_redemptions` insert | Validates window/limits; increments `used_count`. |
| `reviews` insert | Requires delivered job + ownership; forces `is_published = false` for non-admins. |
| `auth.users` insert | Creates `profiles` row. |
| all mutable tables | `updated_at` maintenance. |

## 6. RPC functions (call via `supabase.rpc` from server actions)

| Function | Who | What |
|---|---|---|
| `respond_to_proof(proof_id, decision, comment)` | order owner, guest with `x-order-token`, job staff, service role | Approve or request changes (comment required for changes). Posts the comment in the chat linked to the proof. |
| `accept_quote(quote_id)` | order owner, guest token, ops staff, service role | Accepts the current `sent` quote (rejects expired). |

## 7. Row Level Security

RLS is enabled on **every** table. Helper functions live in the private `app` schema
(`SECURITY DEFINER`, `search_path = ''`).

| Helper | Meaning |
|---|---|
| `app.is_staff()` / `app.is_admin()` / `app.is_ops()` | active staff / admin / admin-or-production |
| `app.customer_can_access_order(order_id)` | `orders.user_id = auth.uid()` **or** sha256(`x-order-token` header) = `orders.access_token_hash` |
| `app.is_job_staff(job_id)` | ops staff, or the designer assigned to the job |
| `app.can_view_job(job_id)` / `app.can_view_order(order_id)` | staff path or customer path |
| `app.owns_cart(cart_id)` | `carts.user_id = auth.uid()` or sha256(`x-cart-token`) = `guest_token_hash` |

| Table | Customer (owner / guest token) | Designer | Admin / Production |
|---|---|---|---|
| catalogue tables | read active rows | read | admin: full |
| carts, cart_items | full on own cart | — | admin: full |
| orders, order_items | read own | read orders containing their assigned jobs | read; ops update orders, admin update items |
| jobs | read own | read + update **assigned** jobs | read + update all |
| job_files | read own `customer_upload`/`proof`/`attachment`; insert `customer_upload`/`attachment` (pending) | read/insert/update on assigned jobs | all on all jobs; admin delete |
| proofs | read own (respond via RPC) | read + insert on assigned jobs | read/insert/update |
| messages | read **non-internal** on own jobs; insert as `customer`, never internal | read all (incl. internal) + insert as `staff` on assigned jobs | same, all jobs; admin delete |
| job_status_history | read own | read assigned | read all |
| quotes | read non-draft on own orders; accept via RPC | — | ops: read/insert/update |
| payments | **no access** (see `orders.amount_paid / payment_status / amount_due`) | — | ops read; ops insert/update cash & bank_slip only; PayHere via service role |
| coupons, coupon_redemptions | no access | — | admin |
| reviews | read published + own; insert (trigger-validated) | read published | admin moderate |
| profiles | own row | all (read) | admin full |
| staff | — | read | admin full |

Orders, order items, jobs and PayHere payments are **never inserted by the browser**: checkout and
the PayHere notify handler run server-side with the service role, after zod validation and
server-side price computation.

### Guest access model (recommended)

1. On first visit to cart/checkout the app calls `supabase.auth.signInAnonymously()`. The guest
   gets a real `auth.uid()`, so RLS and **Realtime chat** work exactly like for registered users.
   Upgrading later (email/phone) keeps the same uid.
2. Every order also gets a random 32-byte **access token** (only its sha256 is stored). The
   confirmation email/SMS/WhatsApp link `/{locale}/orders/{order_number}?t=…` lets the customer open
   the job page on another device; server code forwards it as the `x-order-token` header.
   (Realtime does not carry custom headers, so token-only sessions fall back to polling or are
   "claimed" into the anonymous session — P2.)

## 8. Realtime

`messages`, `jobs` and `proofs` are added to the `supabase_realtime` publication (RLS applies).

## 9. File storage (Cloudflare R2)

Key layout (private bucket `R2_BUCKET`):
```
carts/{cart_id}/{cart_item_id}/{uuid}-{safe-filename}     customer uploads before checkout
jobs/{job_number}/uploads/{uuid}-{safe-filename}           customer uploads after checkout / in chat
jobs/{job_number}/proofs/v{n}-{uuid}.{ext}                 proofs (watermarked JPG/PDF)
jobs/{job_number}/final/{uuid}-{safe-filename}             print-ready files (staff only)
payments/{order_number}/{uuid}.{ext}                       bank slips
```
Flow: server action validates (zod: type, size ≤ 500 MB) → inserts `job_files` (`pending`) →
returns presigned PUT (multipart for > 100 MB) → browser uploads directly → server confirms with
`HeadObject` and sets `uploaded` + dimensions. Downloads always via short-lived presigned GET.

## 10. Legacy tables

`supabase/schema.sql` defined `products`, `orders`, `order_items` with incompatible shapes. The
foundation migration uses the same names, so **it will fail on a database where the legacy schema
was applied**. Before applying: confirm whether production contains those tables/data; if it does
and the data is disposable, add a preceding migration that drops them; otherwise migrate the data
first. `supabase/schema.sql` should be deleted once confirmed.

## 11. Running locally

```bash
supabase start                       # local stack (Docker)
supabase db reset                    # applies migrations + supabase/seed.sql
supabase gen types typescript --local > src/types/database.ts
```
