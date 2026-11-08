-- =============================================================================
-- Nirmanee Digital Print House — foundation schema
-- Migration: 20261108000000_foundation_schema
--
-- Every order becomes one or more JOBS (one per order item). Jobs move through
-- a strict status machine driven mostly by triggers:
--   * job status change        -> job_status_history row + system message
--   * proof inserted           -> job.status = proof_sent
--   * proof approved           -> job.status = approved
--   * proof changes_requested  -> job.status = changes_requested (+1 revision)
--   * payment confirmed        -> order.amount_paid / payment_status recalculated,
--                                 jobs awaiting_payment -> new once the required
--                                 advance (100% fixed, 50% quote) is covered
--   * quote sent / accepted    -> order totals set, jobs quote_sent / awaiting_payment
--
-- See docs/SCHEMA.md for the full description.
--
-- Assumes a FRESH Supabase project (auth schema, anon/authenticated/service_role
-- roles and the `extensions` schema exist). It does NOT drop the legacy tables
-- from supabase/schema.sql — see docs/SCHEMA.md "Legacy tables".
-- DO NOT apply to production until reviewed.
-- =============================================================================

begin;

-- -----------------------------------------------------------------------------
-- 0. Extensions & private schema
-- -----------------------------------------------------------------------------
create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;
create extension if not exists citext with schema extensions;

-- Private helper schema: NOT exposed through the Data API (PostgREST), but
-- functions here are referenced from RLS policies, so API roles need USAGE.
create schema if not exists app;
grant usage on schema app to anon, authenticated, service_role;

-- -----------------------------------------------------------------------------
-- 1. Enums
-- -----------------------------------------------------------------------------
create type public.staff_role        as enum ('admin', 'designer', 'production');
create type public.order_type        as enum ('fixed', 'quote');
create type public.order_status      as enum ('open', 'completed', 'cancelled');
create type public.order_payment_status as enum ('unpaid', 'partially_paid', 'paid', 'refunded');
create type public.delivery_method   as enum ('pickup', 'courier');
create type public.pricing_mode      as enum ('fixed', 'per_sqft', 'quote');
create type public.option_type       as enum ('size', 'material', 'finish', 'color', 'text', 'photo_slots');
create type public.price_modifier_type as enum ('flat', 'percent', 'per_sqft');
create type public.cart_status       as enum ('active', 'converted', 'abandoned');
create type public.job_status        as enum (
  'quote_requested', 'quote_sent', 'awaiting_payment',
  'new', 'artwork_in_progress', 'proof_sent', 'changes_requested', 'approved',
  'printing', 'quality_check', 'ready_for_pickup', 'dispatched', 'delivered',
  'cancelled'
);
create type public.file_kind         as enum ('customer_upload', 'proof', 'final_print', 'attachment');
create type public.upload_status     as enum ('pending', 'uploaded', 'failed');
create type public.proof_status      as enum ('pending', 'approved', 'changes_requested', 'superseded');
create type public.sender_type       as enum ('customer', 'staff', 'system');
create type public.payment_provider  as enum ('payhere', 'bank_slip', 'cash');
create type public.payment_kind      as enum ('full', 'advance', 'balance', 'extra');
create type public.payment_status    as enum ('pending', 'confirmed', 'failed', 'cancelled', 'refunded', 'chargeback');
create type public.quote_status      as enum ('draft', 'sent', 'accepted', 'rejected', 'expired', 'superseded');
create type public.discount_type     as enum ('percent', 'fixed');

-- -----------------------------------------------------------------------------
-- 2. Generic helpers
-- -----------------------------------------------------------------------------
create or replace function app.tg_set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- -----------------------------------------------------------------------------
-- 3. Tables
-- -----------------------------------------------------------------------------

-- 3.1 profiles — 1:1 with auth.users (also anonymous users)
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  email       extensions.citext,
  phone       text,
  locale      text not null default 'en' check (locale in ('en', 'si')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 3.2 staff — presence of an active row = staff member
create table public.staff (
  user_id      uuid primary key references public.profiles (id) on delete cascade,
  role         public.staff_role not null,
  display_name text not null,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- 3.3 categories
create table public.categories (
  id              uuid primary key default gen_random_uuid(),
  parent_id       uuid references public.categories (id) on delete set null,
  slug            text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name_en         text not null,
  name_si         text,
  description_en  text,
  description_si  text,
  image_key       text,                       -- R2 key or /public path
  sort_order      int  not null default 0,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- 3.4 products
create table public.products (
  id               uuid primary key default gen_random_uuid(),
  category_id      uuid not null references public.categories (id) on delete restrict,
  slug             text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name_en          text not null,
  name_si          text,
  short_description_en text,
  short_description_si text,
  description_en   text,
  description_si   text,
  order_type       public.order_type   not null default 'fixed',
  pricing_mode     public.pricing_mode not null default 'fixed',
  base_price       numeric(12,2) check (base_price >= 0),        -- fixed: unit price
  price_per_sqft   numeric(12,2) check (price_per_sqft >= 0),    -- per_sqft: rate
  min_sqft         numeric(10,3) check (min_sqft >= 0),          -- billable minimum area
  min_quantity     int not null default 1 check (min_quantity >= 1),
  max_quantity     int check (max_quantity is null or max_quantity >= min_quantity),
  production_days  int not null default 3 check (production_days >= 0),
  requires_artwork boolean not null default true,  -- false: print customer file as-is
  images           jsonb not null default '[]'::jsonb,  -- [{ "key": "...", "alt_en": "...", "alt_si": "..." }]
  specs            jsonb not null default '[]'::jsonb,  -- [{ "label_en": "...", "value_en": "..." }]
  seo_title        text,
  seo_description  text,
  is_active        boolean not null default true,
  is_featured      boolean not null default false,
  sort_order       int not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint products_pricing_consistent check (
       (pricing_mode = 'fixed'    and base_price is not null)
    or (pricing_mode = 'per_sqft' and price_per_sqft is not null)
    or (pricing_mode = 'quote'    and order_type = 'quote')
  ),
  constraint products_images_array check (jsonb_typeof(images) = 'array'),
  constraint products_specs_array  check (jsonb_typeof(specs)  = 'array')
);
create index products_category_idx on public.products (category_id) where is_active;

-- 3.5 product_options — one row per configurable dimension of a product
--   config examples:
--     size:        { "allow_custom": true, "min_width_in": 12, "max_width_in": 240, "min_height_in": 12, "max_height_in": 120 }
--     text:        { "max_length": 60, "multiline": false, "placeholder_en": "Name" }
--     photo_slots: { "count": 3, "min_width_px": 1200, "min_height_px": 1200, "accept": ["image/jpeg","image/png"] }
create table public.product_options (
  id           uuid primary key default gen_random_uuid(),
  product_id   uuid not null references public.products (id) on delete cascade,
  type         public.option_type not null,
  code         text not null check (code ~ '^[a-z0-9_]+$'),
  label_en     text not null,
  label_si     text,
  help_en      text,
  help_si      text,
  is_required  boolean not null default true,
  config       jsonb not null default '{}'::jsonb check (jsonb_typeof(config) = 'object'),
  sort_order   int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (product_id, code)
);

-- 3.6 product_option_values — choices for size/material/finish/color options
create table public.product_option_values (
  id              uuid primary key default gen_random_uuid(),
  option_id       uuid not null references public.product_options (id) on delete cascade,
  label_en        text not null,
  label_si        text,
  value           text not null,                 -- machine value, e.g. "8x10", "matte"
  modifier_type   public.price_modifier_type not null default 'flat',
  price_modifier  numeric(12,2) not null default 0,  -- flat: +LKR/unit; percent: +%; per_sqft: +LKR/sqft
  width_in        numeric(10,2) check (width_in  > 0),  -- for size presets
  height_in       numeric(10,2) check (height_in > 0),
  swatch_hex      text check (swatch_hex is null or swatch_hex ~ '^#[0-9a-fA-F]{6}$'),
  is_default      boolean not null default false,
  is_active       boolean not null default true,
  sort_order      int not null default 0,
  created_at      timestamptz not null default now(),
  unique (option_id, value)
);
create unique index product_option_values_one_default
  on public.product_option_values (option_id) where is_default;

-- 3.7 product_templates — pre-made layouts a customer can start from
create table public.product_templates (
  id           uuid primary key default gen_random_uuid(),
  product_id   uuid not null references public.products (id) on delete cascade,
  name_en      text not null,
  name_si      text,
  preview_key  text not null,          -- R2 key of preview image
  source_key   text,                   -- R2 key of the editable design file (staff only)
  config       jsonb not null default '{}'::jsonb,  -- photo slot positions, text fields...
  is_active    boolean not null default true,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- 3.8 coupons
create table public.coupons (
  id                  uuid primary key default gen_random_uuid(),
  code                extensions.citext not null unique,
  description         text,
  discount_type       public.discount_type not null,
  value               numeric(12,2) not null check (value > 0),
  max_discount        numeric(12,2) check (max_discount > 0),
  min_order_total     numeric(12,2) not null default 0 check (min_order_total >= 0),
  starts_at           timestamptz,
  ends_at             timestamptz,
  usage_limit         int check (usage_limit > 0),
  per_customer_limit  int check (per_customer_limit > 0),
  used_count          int not null default 0 check (used_count >= 0),
  category_id         uuid references public.categories (id) on delete set null, -- null = all
  is_active           boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint coupons_percent_range check (discount_type <> 'percent' or value <= 100),
  constraint coupons_window check (ends_at is null or starts_at is null or ends_at > starts_at)
);

-- 3.9 carts — owned by a user (incl. Supabase anonymous users) or a guest token
create table public.carts (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references public.profiles (id) on delete cascade,
  guest_token_hash  text unique,   -- sha256 hex of the x-cart-token cookie value
  status            public.cart_status not null default 'active',
  coupon_id         uuid references public.coupons (id) on delete set null,
  expires_at        timestamptz not null default now() + interval '30 days',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint carts_has_owner check (user_id is not null or guest_token_hash is not null)
);
create index carts_user_idx on public.carts (user_id) where status = 'active';

-- Prices are NEVER stored on cart items: they are recomputed server-side.
create table public.cart_items (
  id           uuid primary key default gen_random_uuid(),
  cart_id      uuid not null references public.carts (id) on delete cascade,
  product_id   uuid not null references public.products (id) on delete cascade,
  template_id  uuid references public.product_templates (id) on delete set null,
  quantity     int not null default 1 check (quantity between 1 and 100000),
  selections   jsonb not null default '[]'::jsonb check (jsonb_typeof(selections) = 'array'),
  width_in     numeric(10,2) check (width_in  > 0),
  height_in    numeric(10,2) check (height_in > 0),
  notes        text check (char_length(notes) <= 4000),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index cart_items_cart_idx on public.cart_items (cart_id);

-- 3.10 orders
create sequence public.order_number_seq;

create table public.orders (
  id                 uuid primary key default gen_random_uuid(),
  order_number       text not null unique,                 -- set by trigger: NP-26-000123
  user_id            uuid references public.profiles (id) on delete set null,
  access_token_hash  text not null,                        -- sha256 hex of guest/order link token
  type               public.order_type not null,
  status             public.order_status not null default 'open',
  payment_status     public.order_payment_status not null default 'unpaid',
  customer_name      text not null check (char_length(customer_name) between 1 and 200),
  customer_email     extensions.citext,
  customer_phone     text not null check (char_length(customer_phone) between 7 and 20),
  delivery_method    public.delivery_method not null default 'pickup',
  shipping_address   jsonb,   -- { line1, line2, city, district, postal_code, landmark }
  currency           text not null default 'LKR' check (currency = 'LKR'),
  subtotal           numeric(12,2) not null default 0 check (subtotal >= 0),
  discount_total     numeric(12,2) not null default 0 check (discount_total >= 0),
  delivery_fee       numeric(12,2) not null default 0 check (delivery_fee >= 0),
  total              numeric(12,2) not null default 0 check (total >= 0),
  amount_paid        numeric(12,2) not null default 0,
  amount_due         numeric(12,2) generated always as (total - amount_paid) stored,
  advance_percent    int not null default 100 check (advance_percent between 1 and 100),
  coupon_id          uuid references public.coupons (id) on delete set null,
  customer_notes     text check (char_length(customer_notes) <= 4000),
  locale             text not null default 'en' check (locale in ('en', 'si')),
  courier_name       text,
  tracking_number    text,
  paid_at            timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  constraint orders_courier_needs_address check (
    delivery_method = 'pickup' or shipping_address is not null
  ),
  constraint orders_total_consistent check (
    total = greatest(subtotal - discount_total, 0) + delivery_fee
  )
);
create index orders_user_idx on public.orders (user_id, created_at desc);
create index orders_status_idx on public.orders (status, payment_status);

-- 3.11 order_items — immutable snapshot of what was bought
create table public.order_items (
  id                uuid primary key default gen_random_uuid(),
  order_id          uuid not null references public.orders (id) on delete cascade,
  product_id        uuid references public.products (id) on delete set null,
  template_id       uuid references public.product_templates (id) on delete set null,
  product_snapshot  jsonb not null,   -- { slug, name_en, name_si, pricing_mode, base_price, price_per_sqft }
  selections        jsonb not null default '[]'::jsonb check (jsonb_typeof(selections) = 'array'),
  quantity          int not null check (quantity >= 1),
  width_in          numeric(10,2) check (width_in  > 0),
  height_in         numeric(10,2) check (height_in > 0),
  area_sqft         numeric(12,3) generated always as (
                      case when width_in is not null and height_in is not null
                           then round(width_in * height_in / 144.0, 3) end) stored,
  unit_price        numeric(12,2) not null default 0 check (unit_price >= 0),
  line_total        numeric(12,2) not null default 0 check (line_total >= 0),
  notes             text check (char_length(notes) <= 4000),
  position          int not null default 1,
  created_at        timestamptz not null default now()
);
create index order_items_order_idx on public.order_items (order_id);

-- 3.12 jobs — exactly one per order item
create table public.jobs (
  id                  uuid primary key default gen_random_uuid(),
  order_item_id       uuid not null unique references public.order_items (id) on delete cascade,
  order_id            uuid not null references public.orders (id) on delete cascade, -- denormalised for RLS
  job_number          text not null unique,                 -- NP-26-000123-1
  status              public.job_status not null,
  assigned_designer   uuid references public.staff (user_id) on delete set null,
  due_date            date,
  revision_count      int not null default 0 check (revision_count >= 0),
  max_free_revisions  int not null default 2 check (max_free_revisions >= 0),
  priority            smallint not null default 0,          -- 0 normal, 1 rush
  status_changed_at   timestamptz not null default now(),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index jobs_order_idx    on public.jobs (order_id);
create index jobs_status_idx   on public.jobs (status, due_date);
create index jobs_designer_idx on public.jobs (assigned_designer) where assigned_designer is not null;

-- 3.13 job_files — every file lives in Cloudflare R2; this is the index.
-- Files uploaded while customising (before an order exists) hang off a
-- cart_item and are re-parented to the job at checkout.
create table public.job_files (
  id                 uuid primary key default gen_random_uuid(),
  job_id             uuid references public.jobs (id) on delete cascade,
  cart_item_id       uuid references public.cart_items (id) on delete set null,
  kind               public.file_kind not null,
  r2_key             text not null unique,
  original_filename  text not null check (char_length(original_filename) <= 255),
  content_type       text not null,
  size_bytes         bigint not null check (size_bytes > 0 and size_bytes <= 524288000), -- 500 MB
  width_px           int check (width_px  > 0),
  height_px          int check (height_px > 0),
  checksum_sha256    text,
  upload_status      public.upload_status not null default 'pending',
  slot_index         int,                     -- which photo slot it fills, if any
  uploaded_by        uuid references public.profiles (id) on delete set null,
  created_at         timestamptz not null default now(),
  constraint job_files_has_parent check (job_id is not null or cart_item_id is not null)
);
create index job_files_job_idx  on public.job_files (job_id, kind);
create index job_files_cart_idx on public.job_files (cart_item_id) where cart_item_id is not null;

-- 3.14 proofs
create table public.proofs (
  id                uuid primary key default gen_random_uuid(),
  job_id            uuid not null references public.jobs (id) on delete cascade,
  version           int not null,                         -- set by trigger
  file_id           uuid not null references public.job_files (id) on delete restrict,
  status            public.proof_status not null default 'pending',
  staff_note        text check (char_length(staff_note) <= 4000),
  customer_comment  text check (char_length(customer_comment) <= 4000),
  created_by        uuid references public.staff (user_id) on delete set null,
  responded_by      uuid references public.profiles (id) on delete set null,
  responded_at      timestamptz,
  created_at        timestamptz not null default now(),
  unique (job_id, version)
);
create unique index proofs_one_pending_per_job on public.proofs (job_id) where status = 'pending';

-- 3.15 messages — the job chat
create table public.messages (
  id           uuid primary key default gen_random_uuid(),
  job_id       uuid not null references public.jobs (id) on delete cascade,
  sender_type  public.sender_type not null,
  sender_id    uuid references public.profiles (id) on delete set null,
  body         text not null default '' check (char_length(body) <= 8000),
  attachments  uuid[] not null default '{}',   -- job_files.id[]
  internal     boolean not null default false, -- staff-only note
  proof_id     uuid references public.proofs (id) on delete set null,
  meta         jsonb not null default '{}'::jsonb,  -- system events: { event, from, to, version }
  created_at   timestamptz not null default clock_timestamp()  -- stable order within a transaction,
  constraint messages_customer_never_internal check (not (internal and sender_type = 'customer')),
  constraint messages_not_empty check (char_length(body) > 0 or cardinality(attachments) > 0 or proof_id is not null)
);
create index messages_job_idx on public.messages (job_id, created_at);

-- 3.16 job_status_history — append-only audit log (written by trigger only)
create table public.job_status_history (
  id           bigint generated always as identity primary key,
  job_id       uuid not null references public.jobs (id) on delete cascade,
  from_status  public.job_status,
  to_status    public.job_status not null,
  changed_by   uuid references public.profiles (id) on delete set null,
  created_at   timestamptz not null default clock_timestamp()
);
create index job_status_history_job_idx on public.job_status_history (job_id, created_at);

-- 3.17 quotes
create table public.quotes (
  id               uuid primary key default gen_random_uuid(),
  order_id         uuid not null references public.orders (id) on delete cascade,
  version          int not null default 1,
  status           public.quote_status not null default 'draft',
  line_items       jsonb not null default '[]'::jsonb check (jsonb_typeof(line_items) = 'array'),
  subtotal         numeric(12,2) not null check (subtotal >= 0),
  delivery_fee     numeric(12,2) not null default 0 check (delivery_fee >= 0),
  discount_total   numeric(12,2) not null default 0 check (discount_total >= 0),
  total            numeric(12,2) generated always as (greatest(subtotal - discount_total, 0) + delivery_fee) stored,
  advance_percent  int not null default 50 check (advance_percent between 1 and 100),
  valid_until      date,
  note             text check (char_length(note) <= 4000),
  created_by       uuid references public.staff (user_id) on delete set null,
  sent_at          timestamptz,
  accepted_at      timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (order_id, version)
);

-- 3.18 payments
create table public.payments (
  id                  uuid primary key default gen_random_uuid(),
  order_id            uuid not null references public.orders (id) on delete restrict,
  provider            public.payment_provider not null,
  kind                public.payment_kind not null,
  amount              numeric(12,2) not null check (amount > 0),
  currency            text not null default 'LKR' check (currency = 'LKR'),
  status              public.payment_status not null default 'pending',
  merchant_reference  text not null unique,      -- order_id sent to PayHere, e.g. NP-26-000123-A1
  provider_reference  text,                      -- PayHere payment_id
  method              text,                      -- VISA / MASTER / AMEX / ...
  slip_file_key       text,                      -- R2 key of bank slip
  raw_payload         jsonb,                     -- full notify payload (table is staff-only)
  verified_by         uuid references public.staff (user_id) on delete set null,
  confirmed_at        timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index payments_order_idx on public.payments (order_id);
create unique index payments_provider_ref_uq on public.payments (provider, provider_reference)
  where provider_reference is not null;

-- 3.19 coupon_redemptions
create table public.coupon_redemptions (
  id          uuid primary key default gen_random_uuid(),
  coupon_id   uuid not null references public.coupons (id) on delete cascade,
  order_id    uuid not null unique references public.orders (id) on delete cascade,
  user_id     uuid references public.profiles (id) on delete set null,
  amount      numeric(12,2) not null check (amount >= 0),
  created_at  timestamptz not null default now()
);
create index coupon_redemptions_coupon_user_idx on public.coupon_redemptions (coupon_id, user_id);

-- 3.20 reviews — only for delivered jobs (enforced by trigger)
create table public.reviews (
  id             uuid primary key default gen_random_uuid(),
  product_id     uuid references public.products (id) on delete cascade,
  order_item_id  uuid not null unique references public.order_items (id) on delete cascade,
  user_id        uuid references public.profiles (id) on delete set null,
  author_name    text not null check (char_length(author_name) between 1 and 80),
  rating         smallint not null check (rating between 1 and 5),
  body           text check (char_length(body) <= 2000),
  photo_keys     text[] not null default '{}',
  is_published   boolean not null default false,   -- moderated
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index reviews_product_idx on public.reviews (product_id) where is_published;

-- updated_at triggers
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','staff','categories','products','product_options','product_templates',
    'coupons','carts','cart_items','orders','jobs','quotes','payments','reviews'
  ] loop
    execute format(
      'create trigger %I before update on public.%I for each row execute function app.tg_set_updated_at()',
      t || '_set_updated_at', t);
  end loop;
end $$;

-- -----------------------------------------------------------------------------
-- 4. Access helper functions (SECURITY DEFINER to avoid RLS recursion)
-- -----------------------------------------------------------------------------

-- sha256 hex of a token sent in a request header (PostgREST exposes headers via
-- request.headers). Tokens shorter than 32 chars are ignored.
create or replace function app.header_token_hash(p_header text)
returns text language plpgsql stable security definer set search_path = '' as $$
declare
  v_raw text := nullif(current_setting('request.headers', true), '');
  v_token text;
begin
  if v_raw is null then return null; end if;
  begin
    v_token := (v_raw::json) ->> p_header;
  exception when others then
    return null;
  end;
  if v_token is null or char_length(v_token) < 32 then return null; end if;
  return encode(extensions.digest(v_token, 'sha256'), 'hex');
end $$;

-- True for trusted server code: Supabase service-role JWT, or a direct
-- database session (migrations, SQL editor, psql).
create or replace function app.is_service_role()
returns boolean language sql stable set search_path = '' as $$
  select coalesce(
           nullif(current_setting('request.jwt.claims', true), '')::json ->> 'role',
           nullif(current_setting('request.jwt.claim.role', true), ''),
           case when session_user in ('postgres', 'supabase_admin') then 'service_role' end,
           ''
         ) = 'service_role'
$$;

create or replace function app.staff_role()
returns public.staff_role language sql stable security definer set search_path = '' as $$
  select s.role from public.staff s where s.user_id = auth.uid() and s.is_active
$$;

create or replace function app.is_staff()
returns boolean language sql stable security definer set search_path = '' as $$
  select app.staff_role() is not null
$$;

create or replace function app.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce(app.staff_role() = 'admin', false)
$$;

-- admin or production: see every order/job
create or replace function app.is_ops()
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce(app.staff_role() in ('admin', 'production'), false)
$$;

-- Customer access to an order: owner (incl. anonymous auth user) or holder of
-- the order access token (x-order-token header).
create or replace function app.customer_can_access_order(p_order_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.orders o
    where o.id = p_order_id
      and (
        (auth.uid() is not null and o.user_id = auth.uid())
        or o.access_token_hash = app.header_token_hash('x-order-token')
      )
  )
$$;

create or replace function app.customer_can_access_job(p_job_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.jobs j
    where j.id = p_job_id and app.customer_can_access_order(j.order_id)
  )
$$;

-- Staff who work on a job: admin/production always, designer if assigned.
create or replace function app.is_job_staff(p_job_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select app.is_ops() or exists (
    select 1 from public.jobs j
    where j.id = p_job_id
      and j.assigned_designer = auth.uid()
      and app.staff_role() = 'designer'
  )
$$;

create or replace function app.can_view_job(p_job_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select app.is_job_staff(p_job_id) or app.customer_can_access_job(p_job_id)
$$;

create or replace function app.can_view_order(p_order_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select app.is_ops()
      or app.customer_can_access_order(p_order_id)
      or exists (
        select 1 from public.jobs j
        where j.order_id = p_order_id
          and j.assigned_designer = auth.uid()
          and app.staff_role() = 'designer'
      )
$$;

create or replace function app.owns_cart(p_cart_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.carts c
    where c.id = p_cart_id
      and (
        (auth.uid() is not null and c.user_id = auth.uid())
        or c.guest_token_hash = app.header_token_hash('x-cart-token')
      )
  )
$$;

create or replace function app.owns_cart_item(p_cart_item_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.cart_items ci
    where ci.id = p_cart_item_id and app.owns_cart(ci.cart_id)
  )
$$;

-- -----------------------------------------------------------------------------
-- 5. Job status machine
-- -----------------------------------------------------------------------------
create or replace function app.job_transition_allowed(p_from public.job_status, p_to public.job_status)
returns boolean language sql immutable set search_path = '' as $$
  select case
    when p_from = p_to then true
    when p_from in ('delivered', 'cancelled') then false
    when p_to = 'cancelled' then true
    else (p_from::text, p_to::text) in (
      ('quote_requested',     'quote_sent'),
      ('quote_sent',          'quote_requested'),      -- re-quote
      ('quote_sent',          'awaiting_payment'),
      ('awaiting_payment',    'new'),
      ('new',                 'artwork_in_progress'),
      ('new',                 'proof_sent'),
      ('new',                 'approved'),             -- print-ready customer file, no artwork
      ('artwork_in_progress', 'proof_sent'),
      ('proof_sent',          'approved'),
      ('proof_sent',          'changes_requested'),
      ('proof_sent',          'artwork_in_progress'),  -- staff withdraws proof
      ('changes_requested',   'artwork_in_progress'),
      ('changes_requested',   'proof_sent'),
      ('approved',            'printing'),
      ('printing',            'quality_check'),
      ('quality_check',       'printing'),             -- failed QC, reprint
      ('quality_check',       'ready_for_pickup'),
      ('quality_check',       'dispatched'),
      ('ready_for_pickup',    'delivered'),
      ('ready_for_pickup',    'dispatched'),
      ('dispatched',          'delivered')
    )
  end
$$;

create or replace function app.job_status_label(p_status public.job_status)
returns text language sql immutable set search_path = '' as $$
  select case p_status
    when 'quote_requested'     then 'Quote requested'
    when 'quote_sent'          then 'Quote sent — waiting for your confirmation'
    when 'awaiting_payment'    then 'Waiting for payment'
    when 'new'                 then 'Order received — queued for our designers'
    when 'artwork_in_progress' then 'Our designer is working on your artwork'
    when 'proof_sent'          then 'Proof ready for your review'
    when 'changes_requested'   then 'Changes requested — designer is updating the artwork'
    when 'approved'            then 'Artwork approved'
    when 'printing'            then 'Printing'
    when 'quality_check'       then 'Quality check'
    when 'ready_for_pickup'    then 'Ready for pickup'
    when 'dispatched'          then 'Dispatched'
    when 'delivered'           then 'Delivered'
    when 'cancelled'           then 'Cancelled'
  end
$$;

-- 5.1 orders: number generation
create or replace function app.tg_orders_before_insert()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.order_number is null then
    new.order_number := 'NP-' || to_char(now() at time zone 'Asia/Colombo', 'YY') || '-'
                        || lpad(nextval('public.order_number_seq')::text, 6, '0');
  end if;
  if new.type = 'quote' and new.advance_percent = 100 then
    new.advance_percent := 50;
  end if;
  return new;
end $$;

create trigger orders_before_insert
  before insert on public.orders
  for each row execute function app.tg_orders_before_insert();

-- 5.2 order_items -> create the job
create or replace function app.tg_order_items_create_job()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_order public.orders%rowtype;
  v_seq   int;
begin
  select * into v_order from public.orders where id = new.order_id for update;
  select count(*) + 1 into v_seq from public.jobs where order_id = new.order_id;

  insert into public.jobs (order_item_id, order_id, job_number, status)
  values (
    new.id, new.order_id, v_order.order_number || '-' || v_seq,
    case
      when v_order.type = 'quote'           then 'quote_requested'::public.job_status
      when v_order.payment_status = 'paid'  then 'new'::public.job_status
      else 'awaiting_payment'::public.job_status
    end
  );
  return new;
end $$;

create trigger order_items_create_job
  after insert on public.order_items
  for each row execute function app.tg_order_items_create_job();

-- 5.3 jobs: validate transitions, bump revision_count, set due_date, guard columns
create or replace function app.tg_jobs_before_update()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_days int;
begin
  if new.order_id <> old.order_id or new.order_item_id <> old.order_item_id
     or new.job_number <> old.job_number then
    raise exception 'jobs.order_id, order_item_id and job_number are immutable'
      using errcode = 'P0001';
  end if;

  -- Only admins (or service role / definer code with no staff identity) may
  -- change assignment, revision allowance or counters directly.
  if app.is_staff() and not app.is_admin() and (
       new.assigned_designer  is distinct from old.assigned_designer
    or new.max_free_revisions is distinct from old.max_free_revisions
    or (new.revision_count    is distinct from old.revision_count and new.status = old.status)
  ) then
    raise exception 'only admins can change assignment or revision settings'
      using errcode = '42501';
  end if;

  if new.status is distinct from old.status then
    if not app.job_transition_allowed(old.status, new.status) then
      raise exception 'invalid job status transition: % -> %', old.status, new.status
        using errcode = 'P0001';
    end if;

    new.status_changed_at := now();

    if new.status = 'changes_requested' then
      new.revision_count := old.revision_count + 1;
    end if;

    if new.status = 'new' and new.due_date is null then
      select coalesce(p.production_days, 3) into v_days
      from public.order_items oi
      left join public.products p on p.id = oi.product_id
      where oi.id = new.order_item_id;
      new.due_date := (now() at time zone 'Asia/Colombo')::date + coalesce(v_days, 3);
    end if;
  end if;

  return new;
end $$;

create trigger jobs_before_update
  before update on public.jobs
  for each row execute function app.tg_jobs_before_update();

-- 5.4 jobs: history + system message + order completion
create or replace function app.tg_jobs_after_status()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_from public.job_status := case when tg_op = 'UPDATE' then old.status end;
  v_body text;
begin
  insert into public.job_status_history (job_id, from_status, to_status, changed_by)
  values (new.id, v_from, new.status, auth.uid());

  v_body := app.job_status_label(new.status);
  if new.status = 'changes_requested' and new.revision_count > new.max_free_revisions then
    v_body := v_body || ' (revision ' || new.revision_count || ' — beyond the '
              || new.max_free_revisions || ' free revisions; extra charges may apply)';
  end if;

  -- proof_sent is announced by the proof card message (proofs trigger)
  if new.status <> 'proof_sent' then
  insert into public.messages (job_id, sender_type, body, internal, meta)
  values (
    new.id, 'system', v_body, false,
    jsonb_build_object('event', case when tg_op = 'INSERT' then 'job_created' else 'status_changed' end,
                       'from', v_from, 'to', new.status, 'revision_count', new.revision_count)
  );
  end if;

  if tg_op = 'UPDATE' and new.status in ('delivered', 'cancelled') and not exists (
       select 1 from public.jobs j
       where j.order_id = new.order_id and j.status not in ('delivered', 'cancelled')
     ) then
    update public.orders o
       set status = case when exists (
                      select 1 from public.jobs j
                      where j.order_id = new.order_id and j.status = 'delivered')
                    then 'completed'::public.order_status
                    else 'cancelled'::public.order_status end
     where o.id = new.order_id and o.status = 'open';
  end if;

  return null;
end $$;

create trigger jobs_after_insert
  after insert on public.jobs
  for each row execute function app.tg_jobs_after_status();

create trigger jobs_after_status_update
  after update of status on public.jobs
  for each row when (old.status is distinct from new.status)
  execute function app.tg_jobs_after_status();

-- -----------------------------------------------------------------------------
-- 6. Proof triggers
-- -----------------------------------------------------------------------------
create or replace function app.tg_proofs_before_insert()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_file public.job_files%rowtype;
begin
  perform 1 from public.jobs where id = new.job_id for update;  -- serialise versions

  select * into v_file from public.job_files where id = new.file_id;
  if v_file.id is null or v_file.job_id is distinct from new.job_id or v_file.kind <> 'proof' then
    raise exception 'proof file must be a job_files row of kind=proof on the same job'
      using errcode = 'P0001';
  end if;

  select coalesce(max(version), 0) + 1 into new.version
  from public.proofs where job_id = new.job_id;

  new.status       := 'pending';
  new.responded_at := null;
  new.responded_by := null;
  new.created_by   := coalesce(new.created_by, auth.uid());

  -- previous pending proof is superseded by this one
  update public.proofs set status = 'superseded'
  where job_id = new.job_id and status = 'pending';

  return new;
end $$;

create trigger proofs_before_insert
  before insert on public.proofs
  for each row execute function app.tg_proofs_before_insert();

create or replace function app.tg_proofs_after_insert()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  update public.jobs set status = 'proof_sent'
  where id = new.job_id and status <> 'proof_sent';

  insert into public.messages (job_id, sender_type, sender_id, body, proof_id, meta)
  values (new.job_id, 'system', null,
          'Proof v' || new.version || ' is ready for your review',
          new.id,
          jsonb_build_object('event', 'proof_posted', 'version', new.version));
  return null;
end $$;

create trigger proofs_after_insert
  after insert on public.proofs
  for each row execute function app.tg_proofs_after_insert();

create or replace function app.tg_proofs_before_update()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.job_id <> old.job_id or new.version <> old.version or new.file_id <> old.file_id then
    raise exception 'proof job_id, version and file_id are immutable' using errcode = 'P0001';
  end if;
  if new.status is distinct from old.status then
    if old.status <> 'pending' then
      raise exception 'only pending proofs can change status (was %)', old.status
        using errcode = 'P0001';
    end if;
    if new.status in ('approved', 'changes_requested') then
      new.responded_at := now();
      new.responded_by := coalesce(new.responded_by, auth.uid());
    end if;
  end if;
  return new;
end $$;

create trigger proofs_before_update
  before update on public.proofs
  for each row execute function app.tg_proofs_before_update();

create or replace function app.tg_proofs_after_status()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.status = 'approved' then
    update public.jobs set status = 'approved' where id = new.job_id;
  elsif new.status = 'changes_requested' then
    update public.jobs set status = 'changes_requested' where id = new.job_id;
  end if;
  return null;
end $$;

create trigger proofs_after_status
  after update of status on public.proofs
  for each row when (old.status is distinct from new.status)
  execute function app.tg_proofs_after_status();

-- -----------------------------------------------------------------------------
-- 7. Payments & quotes
-- -----------------------------------------------------------------------------
create or replace function app.recalc_order_payment(p_order_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_order    public.orders%rowtype;
  v_paid     numeric(12,2);
  v_refunded boolean;
  v_status   public.order_payment_status;
  v_required numeric(12,2);
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if v_order.id is null then return; end if;

  select coalesce(sum(amount) filter (where status = 'confirmed'), 0),
         coalesce(bool_or(status in ('refunded', 'chargeback')), false)
    into v_paid, v_refunded
  from public.payments where order_id = p_order_id;

  v_status := case
    when v_paid <= 0 and v_refunded              then 'refunded'
    when v_paid <= 0                             then 'unpaid'
    when v_order.total > 0 and v_paid >= v_order.total then 'paid'
    else 'partially_paid'
  end::public.order_payment_status;

  update public.orders
     set amount_paid    = v_paid,
         payment_status = v_status,
         paid_at        = case when v_status = 'paid' then coalesce(paid_at, now()) else paid_at end
   where id = p_order_id;

  -- Release jobs to production once the required advance is covered.
  v_required := round(v_order.total * v_order.advance_percent / 100.0, 2);
  if v_order.total > 0 and v_paid >= v_required then
    update public.jobs set status = 'new'
    where order_id = p_order_id and status = 'awaiting_payment';
  end if;
end $$;

create or replace function app.tg_payments_before_write()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.status = 'confirmed' and (tg_op = 'INSERT' or old.status is distinct from 'confirmed') then
    new.confirmed_at := coalesce(new.confirmed_at, now());
  end if;
  if tg_op = 'UPDATE' and (new.order_id <> old.order_id or new.amount <> old.amount) then
    raise exception 'payment order_id and amount are immutable' using errcode = 'P0001';
  end if;
  return new;
end $$;

create trigger payments_before_write
  before insert or update on public.payments
  for each row execute function app.tg_payments_before_write();

create or replace function app.tg_payments_after_write()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  perform app.recalc_order_payment(new.order_id);
  return null;
end $$;

create trigger payments_after_insert
  after insert on public.payments
  for each row execute function app.tg_payments_after_write();

create trigger payments_after_status_update
  after update of status on public.payments
  for each row when (old.status is distinct from new.status)
  execute function app.tg_payments_after_write();

create or replace function app.tg_quotes_before_write()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_type public.order_type;
begin
  select type into v_type from public.orders where id = new.order_id;
  if v_type <> 'quote' then
    raise exception 'quotes can only be attached to quote orders' using errcode = 'P0001';
  end if;
  if tg_op = 'INSERT' then
    select coalesce(max(version), 0) + 1 into new.version from public.quotes where order_id = new.order_id;
  end if;
  if new.status = 'sent' and (tg_op = 'INSERT' or old.status <> 'sent') then
    new.sent_at := now();
  end if;
  if new.status = 'accepted' and (tg_op = 'INSERT' or old.status <> 'accepted') then
    if tg_op = 'UPDATE' and old.status <> 'sent' then
      raise exception 'only a sent quote can be accepted' using errcode = 'P0001';
    end if;
    if new.valid_until is not null and new.valid_until < (now() at time zone 'Asia/Colombo')::date then
      raise exception 'quote has expired' using errcode = 'P0001';
    end if;
    new.accepted_at := now();
  end if;
  return new;
end $$;

create trigger quotes_before_write
  before insert or update on public.quotes
  for each row execute function app.tg_quotes_before_write();

create or replace function app.tg_quotes_after_status()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'UPDATE' and old.status = new.status then return null; end if;

  if new.status = 'sent' then
    update public.quotes set status = 'superseded'
    where order_id = new.order_id and id <> new.id and status = 'sent';

    update public.orders
       set subtotal        = new.subtotal,
           discount_total  = new.discount_total,
           delivery_fee    = new.delivery_fee,
           total           = new.total,
           advance_percent = new.advance_percent
     where id = new.order_id;

    update public.jobs set status = 'quote_sent'
    where order_id = new.order_id and status = 'quote_requested';

  elsif new.status = 'accepted' then
    update public.jobs set status = 'awaiting_payment'
    where order_id = new.order_id and status = 'quote_sent';
    -- payment may already exist (e.g. cash at counter)
    perform app.recalc_order_payment(new.order_id);
  end if;
  return null;
end $$;

create trigger quotes_after_insert
  after insert on public.quotes
  for each row execute function app.tg_quotes_after_status();

create trigger quotes_after_status_update
  after update of status on public.quotes
  for each row execute function app.tg_quotes_after_status();

-- -----------------------------------------------------------------------------
-- 8. Coupons & reviews
-- -----------------------------------------------------------------------------
create or replace function app.tg_coupon_redemptions_before_insert()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_coupon public.coupons%rowtype;
  v_used_by_user int;
begin
  select * into v_coupon from public.coupons where id = new.coupon_id for update;
  if not v_coupon.is_active
     or (v_coupon.starts_at is not null and now() < v_coupon.starts_at)
     or (v_coupon.ends_at   is not null and now() > v_coupon.ends_at)
     or (v_coupon.usage_limit is not null and v_coupon.used_count >= v_coupon.usage_limit) then
    raise exception 'coupon is not valid' using errcode = 'P0001';
  end if;
  if v_coupon.per_customer_limit is not null and new.user_id is not null then
    select count(*) into v_used_by_user from public.coupon_redemptions
    where coupon_id = new.coupon_id and user_id = new.user_id;
    if v_used_by_user >= v_coupon.per_customer_limit then
      raise exception 'coupon usage limit reached for this customer' using errcode = 'P0001';
    end if;
  end if;
  update public.coupons set used_count = used_count + 1 where id = new.coupon_id;
  return new;
end $$;

create trigger coupon_redemptions_before_insert
  before insert on public.coupon_redemptions
  for each row execute function app.tg_coupon_redemptions_before_insert();

create or replace function app.tg_reviews_before_insert()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_item public.order_items%rowtype;
begin
  select * into v_item from public.order_items where id = new.order_item_id;
  if v_item.id is null then
    raise exception 'order item not found' using errcode = 'P0001';
  end if;
  if not exists (select 1 from public.jobs where order_item_id = new.order_item_id and status = 'delivered') then
    raise exception 'reviews are only allowed after the item is delivered' using errcode = 'P0001';
  end if;
  if auth.uid() is not null and not app.is_admin()
     and not app.customer_can_access_order(v_item.order_id) then
    raise exception 'not your order' using errcode = '42501';
  end if;
  new.product_id   := v_item.product_id;
  new.user_id      := coalesce(new.user_id, auth.uid());
  if not app.is_admin() then
    new.is_published := false;
  end if;
  return new;
end $$;

create trigger reviews_before_insert
  before insert on public.reviews
  for each row execute function app.tg_reviews_before_insert();

-- -----------------------------------------------------------------------------
-- 9. Auth: create profile on sign-up
-- -----------------------------------------------------------------------------
create or replace function app.tg_handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, full_name, phone)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.phone, nullif(new.raw_user_meta_data ->> 'phone', ''))
  )
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function app.tg_handle_new_user();

-- -----------------------------------------------------------------------------
-- 10. Customer RPCs (callable via supabase.rpc from server actions)
-- -----------------------------------------------------------------------------

-- Approve a proof or request changes. Works for logged-in owners, anonymous
-- users and guests holding the x-order-token header.
create or replace function public.respond_to_proof(
  p_proof_id uuid,
  p_decision public.proof_status,
  p_comment  text default null
) returns public.proofs
language plpgsql security definer set search_path = '' as $$
declare
  v_proof public.proofs%rowtype;
begin
  if p_decision not in ('approved', 'changes_requested') then
    raise exception 'decision must be approved or changes_requested' using errcode = '22023';
  end if;
  if p_decision = 'changes_requested' and coalesce(btrim(p_comment), '') = '' then
    raise exception 'please describe the changes you need' using errcode = '22023';
  end if;

  select * into v_proof from public.proofs where id = p_proof_id for update;
  if v_proof.id is null or not (app.can_view_job(v_proof.job_id) or app.is_service_role()) then
    raise exception 'proof not found' using errcode = 'P0002';
  end if;
  if v_proof.status <> 'pending' then
    raise exception 'this proof has already been answered' using errcode = 'P0001';
  end if;

  update public.proofs
     set status = p_decision,
         customer_comment = nullif(btrim(p_comment), '')
   where id = p_proof_id
  returning * into v_proof;

  if nullif(btrim(p_comment), '') is not null then
    insert into public.messages (job_id, sender_type, sender_id, body, proof_id, meta)
    values (v_proof.job_id,
            case when app.is_staff() then 'staff' else 'customer' end::public.sender_type,
            auth.uid(), btrim(p_comment), v_proof.id,
            jsonb_build_object('event', 'proof_response', 'decision', p_decision, 'version', v_proof.version));
  end if;

  return v_proof;
end $$;

-- Accept the current sent quote of an order (before paying the advance).
create or replace function public.accept_quote(p_quote_id uuid)
returns public.quotes
language plpgsql security definer set search_path = '' as $$
declare
  v_quote public.quotes%rowtype;
begin
  select * into v_quote from public.quotes where id = p_quote_id for update;
  if v_quote.id is null or not (app.customer_can_access_order(v_quote.order_id) or app.is_ops()
                               or app.is_service_role()) then
    raise exception 'quote not found' using errcode = 'P0002';
  end if;
  if v_quote.status <> 'sent' then
    raise exception 'this quote can no longer be accepted' using errcode = 'P0001';
  end if;
  update public.quotes set status = 'accepted' where id = p_quote_id returning * into v_quote;
  return v_quote;
end $$;

revoke all on function public.respond_to_proof(uuid, public.proof_status, text) from public;
revoke all on function public.accept_quote(uuid) from public;
grant execute on function public.respond_to_proof(uuid, public.proof_status, text) to anon, authenticated, service_role;
grant execute on function public.accept_quote(uuid) to anon, authenticated, service_role;

-- helper functions are used inside RLS policies
grant execute on all functions in schema app to anon, authenticated, service_role;

-- -----------------------------------------------------------------------------
-- 11. Row Level Security
-- -----------------------------------------------------------------------------
alter table public.profiles              enable row level security;
alter table public.staff                 enable row level security;
alter table public.categories            enable row level security;
alter table public.products              enable row level security;
alter table public.product_options       enable row level security;
alter table public.product_option_values enable row level security;
alter table public.product_templates     enable row level security;
alter table public.coupons               enable row level security;
alter table public.carts                 enable row level security;
alter table public.cart_items            enable row level security;
alter table public.orders                enable row level security;
alter table public.order_items           enable row level security;
alter table public.jobs                  enable row level security;
alter table public.job_files             enable row level security;
alter table public.proofs                enable row level security;
alter table public.messages              enable row level security;
alter table public.job_status_history    enable row level security;
alter table public.quotes                enable row level security;
alter table public.payments              enable row level security;
alter table public.coupon_redemptions    enable row level security;
alter table public.reviews               enable row level security;

-- profiles
create policy profiles_select on public.profiles for select
  using (id = auth.uid() or app.is_staff());
create policy profiles_update_self on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_admin_all on public.profiles for all
  using (app.is_admin()) with check (app.is_admin());

-- staff
create policy staff_select on public.staff for select using (app.is_staff());
create policy staff_admin_all on public.staff for all
  using (app.is_admin()) with check (app.is_admin());

-- catalogue (public read of active rows, admin write)
create policy categories_public_read on public.categories for select
  using (is_active or app.is_admin());
create policy categories_admin_all on public.categories for all
  using (app.is_admin()) with check (app.is_admin());

create policy products_public_read on public.products for select
  using (is_active or app.is_admin());
create policy products_admin_all on public.products for all
  using (app.is_admin()) with check (app.is_admin());

create policy product_options_public_read on public.product_options for select using (true);
create policy product_options_admin_all on public.product_options for all
  using (app.is_admin()) with check (app.is_admin());

create policy product_option_values_public_read on public.product_option_values for select
  using (is_active or app.is_admin());
create policy product_option_values_admin_all on public.product_option_values for all
  using (app.is_admin()) with check (app.is_admin());

create policy product_templates_public_read on public.product_templates for select
  using (is_active or app.is_admin());
create policy product_templates_admin_all on public.product_templates for all
  using (app.is_admin()) with check (app.is_admin());

-- coupons: never readable by customers (validated server-side)
create policy coupons_admin_all on public.coupons for all
  using (app.is_admin()) with check (app.is_admin());
create policy coupon_redemptions_admin_read on public.coupon_redemptions for select
  using (app.is_admin());

-- carts
create policy carts_owner_all on public.carts for all
  using (app.owns_cart(id) or app.is_admin())
  with check (
    (auth.uid() is not null and user_id = auth.uid())
    or guest_token_hash = app.header_token_hash('x-cart-token')
    or app.is_admin()
  );
create policy cart_items_owner_all on public.cart_items for all
  using (app.owns_cart(cart_id) or app.is_admin())
  with check (app.owns_cart(cart_id) or app.is_admin());

-- orders / order_items: customers read only; writes go through server actions
-- running with the service role (prices are always computed server-side).
create policy orders_select on public.orders for select using (app.can_view_order(id));
create policy orders_ops_update on public.orders for update
  using (app.is_ops()) with check (app.is_ops());

create policy order_items_select on public.order_items for select using (app.can_view_order(order_id));
create policy order_items_admin_update on public.order_items for update
  using (app.is_admin()) with check (app.is_admin());

-- jobs
create policy jobs_select on public.jobs for select using (app.can_view_job(id));
create policy jobs_staff_update on public.jobs for update
  using (app.is_job_staff(id)) with check (app.is_job_staff(id));

-- job_files
create policy job_files_select on public.job_files for select using (
  (job_id is not null and app.is_job_staff(job_id))
  or (job_id is not null and kind in ('customer_upload', 'proof', 'attachment')
      and app.customer_can_access_job(job_id))
  or (cart_item_id is not null and app.owns_cart_item(cart_item_id))
);
create policy job_files_customer_insert on public.job_files for insert with check (
  kind in ('customer_upload', 'attachment')
  and upload_status = 'pending'
  and (
    (job_id is not null and app.customer_can_access_job(job_id))
    or (job_id is null and cart_item_id is not null and app.owns_cart_item(cart_item_id))
  )
);
create policy job_files_staff_insert on public.job_files for insert
  with check (job_id is not null and app.is_job_staff(job_id));
create policy job_files_staff_update on public.job_files for update
  using (job_id is not null and app.is_job_staff(job_id))
  with check (job_id is not null and app.is_job_staff(job_id));
create policy job_files_admin_delete on public.job_files for delete using (app.is_admin());

-- proofs (customers respond via public.respond_to_proof)
create policy proofs_select on public.proofs for select using (app.can_view_job(job_id));
create policy proofs_staff_insert on public.proofs for insert
  with check (app.is_job_staff(job_id));
create policy proofs_ops_update on public.proofs for update
  using (app.is_ops()) with check (app.is_ops());

-- messages: internal notes are visible to job staff only
create policy messages_select on public.messages for select using (
  app.is_job_staff(job_id)
  or (not internal and app.customer_can_access_job(job_id))
);
create policy messages_customer_insert on public.messages for insert with check (
  sender_type = 'customer'
  and internal = false
  and proof_id is null
  and meta = '{}'::jsonb
  and (sender_id is null or sender_id = auth.uid())
  and app.customer_can_access_job(job_id)
);
create policy messages_staff_insert on public.messages for insert with check (
  sender_type = 'staff'
  and sender_id = auth.uid()
  and app.is_job_staff(job_id)
);
create policy messages_admin_delete on public.messages for delete using (app.is_admin());

-- job_status_history (read-only, written by trigger)
create policy job_status_history_select on public.job_status_history for select
  using (app.can_view_job(job_id));

-- quotes
create policy quotes_select on public.quotes for select using (
  app.is_ops() or (status <> 'draft' and app.customer_can_access_order(order_id))
);
create policy quotes_ops_insert on public.quotes for insert with check (app.is_ops());
create policy quotes_ops_update on public.quotes for update
  using (app.is_ops()) with check (app.is_ops());

-- payments: staff (admin/production) only — rows carry the raw gateway payload.
-- Customers see orders.amount_paid / payment_status / amount_due instead.
-- PayHere confirmations are written by the service role (notify_url handler).
create policy payments_select on public.payments for select using (app.is_ops());
create policy payments_ops_insert on public.payments for insert with check (
  app.is_ops() and provider in ('cash', 'bank_slip')
);
create policy payments_ops_update on public.payments for update
  using (app.is_ops() and provider in ('cash', 'bank_slip'))
  with check (app.is_ops() and provider in ('cash', 'bank_slip'));

-- reviews
create policy reviews_select on public.reviews for select using (
  is_published or app.is_admin() or (auth.uid() is not null and user_id = auth.uid())
);
create policy reviews_customer_insert on public.reviews for insert with check (
  (auth.uid() is not null and (user_id is null or user_id = auth.uid()))
  or app.header_token_hash('x-order-token') is not null
);
create policy reviews_admin_update on public.reviews for update
  using (app.is_admin()) with check (app.is_admin());
create policy reviews_admin_delete on public.reviews for delete using (app.is_admin());

-- -----------------------------------------------------------------------------
-- 12. Function hardening
-- -----------------------------------------------------------------------------
-- recalc_order_payment mutates money state: only reachable through triggers.
revoke execute on function app.recalc_order_payment(uuid) from public, anon, authenticated;

-- -----------------------------------------------------------------------------
-- 13. Realtime (job chat, live status, proofs)
-- -----------------------------------------------------------------------------
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.messages, public.jobs, public.proofs;
  end if;
end $$;

commit;
