-- =============================================================================
-- Phase 1A — storefront support + owner decisions of 2026-11-08
--
--  1. app_settings (admin-editable): revision_fee_lkr = 500
--  2. delivery_zones (admin-editable): Kalutara district / Western Province /
--     rest of island; pickup at the Kalutara shop is free
--  3. orders.extras_total (paid extra revisions) + orders.delivery_zone
--  4. products: design_fee ("Design it for me"), express turnaround,
--     artwork path toggles; product_price_tiers (quantity discounts)
--  5. cart_items / order_items: design_mode, turnaround, skip_proof
--  6. job_files.cart_id — uploads made on the product page before the item
--     is in the cart
--  7. Jobs:
--     * printing requires the order to be FULLY paid (quote balance rule)
--     * 3rd+ revision adds revision_fee_lkr to the order
--     * express jobs get due_date from products.express_days
--     * designers see an "unassigned" queue (status new) and can claim jobs
-- =============================================================================

begin;

-- -----------------------------------------------------------------------------
-- 1. Settings
-- -----------------------------------------------------------------------------
create table public.app_settings (
  key          text primary key check (key ~ '^[a-z0-9_.]+$'),
  value        jsonb not null,
  is_public    boolean not null default false,   -- readable by the storefront
  description  text,
  updated_by   uuid references public.profiles (id) on delete set null,
  updated_at   timestamptz not null default now()
);

create trigger app_settings_set_updated_at
  before update on public.app_settings
  for each row execute function app.tg_set_updated_at();

insert into public.app_settings (key, value, is_public, description) values
  ('revision_fee_lkr', '500'::jsonb, true,
   'Fee (LKR) charged for each proof revision beyond jobs.max_free_revisions'),
  ('free_revisions', '2'::jsonb, true,
   'Default number of free proof revisions for new jobs');

create or replace function app.setting_numeric(p_key text, p_default numeric default 0)
returns numeric language sql stable security definer set search_path = '' as $$
  select coalesce((select (s.value #>> '{}')::numeric from public.app_settings s where s.key = p_key),
                  p_default)
$$;

alter table public.app_settings enable row level security;
create policy app_settings_public_read on public.app_settings for select
  using (is_public or app.is_staff());
create policy app_settings_admin_all on public.app_settings for all
  using (app.is_admin()) with check (app.is_admin());

-- -----------------------------------------------------------------------------
-- 2. Delivery zones
-- -----------------------------------------------------------------------------
create table public.delivery_zones (
  code            text primary key check (code ~ '^[a-z0-9_]+$'),
  name_en         text not null,
  name_si         text,
  description_en  text,
  description_si  text,
  fee             numeric(12,2) not null check (fee >= 0),
  eta_min_days    int not null check (eta_min_days >= 0),
  eta_max_days    int not null check (eta_max_days >= eta_min_days),
  sort_order      int not null default 0,
  is_active       boolean not null default true,
  updated_at      timestamptz not null default now()
);

create trigger delivery_zones_set_updated_at
  before update on public.delivery_zones
  for each row execute function app.tg_set_updated_at();

-- Fees are placeholders until the owner sets them in the admin.
insert into public.delivery_zones (code, name_en, name_si, description_en, fee, eta_min_days, eta_max_days, sort_order) values
  ('kalutara', 'Kalutara District',  'කළුතර දිස්ත්‍රික්කය', 'Kalutara, Panadura, Horana, Beruwala, Matugama and surroundings', 350, 1, 2, 10),
  ('western',  'Western Province',   'බස්නාහිර පළාත',       'Colombo and Gampaha districts',                                  450, 2, 3, 20),
  ('island',   'Rest of the island', 'දිවයිනේ අනෙකුත් ප්‍රදේශ', 'All other districts',                                         600, 2, 4, 30);

alter table public.delivery_zones enable row level security;
create policy delivery_zones_public_read on public.delivery_zones for select
  using (is_active or app.is_admin());
create policy delivery_zones_admin_all on public.delivery_zones for all
  using (app.is_admin()) with check (app.is_admin());

-- -----------------------------------------------------------------------------
-- 3. Orders: extras (paid revisions) and delivery zone
-- -----------------------------------------------------------------------------
alter table public.orders
  add column extras_total  numeric(12,2) not null default 0 check (extras_total >= 0),
  add column delivery_zone text references public.delivery_zones (code) on delete restrict;

alter table public.orders drop constraint orders_total_consistent;
alter table public.orders add constraint orders_total_consistent check (
  total = greatest(subtotal - discount_total, 0) + delivery_fee + extras_total
);
alter table public.orders add constraint orders_courier_needs_zone check (
  delivery_method = 'pickup' or delivery_zone is not null
);

-- -----------------------------------------------------------------------------
-- 4. Products: artwork paths, express turnaround, quantity tiers
-- -----------------------------------------------------------------------------
alter table public.products
  add column design_fee                numeric(12,2) not null default 0 check (design_fee >= 0),
  add column allow_customer_artwork    boolean not null default true,   -- "Upload my design"
  add column allow_design_service      boolean not null default true,   -- "Design it for me"
  add column express_days              int check (express_days >= 0),   -- null = no express
  add column express_surcharge_percent int not null default 50
                                       check (express_surcharge_percent between 0 and 300);

create table public.product_price_tiers (
  id                uuid primary key default gen_random_uuid(),
  product_id        uuid not null references public.products (id) on delete cascade,
  min_quantity      int not null check (min_quantity >= 2),
  discount_percent  numeric(5,2) not null check (discount_percent > 0 and discount_percent <= 90),
  created_at        timestamptz not null default now(),
  unique (product_id, min_quantity)
);

alter table public.product_price_tiers enable row level security;
create policy product_price_tiers_public_read on public.product_price_tiers for select using (true);
create policy product_price_tiers_admin_all on public.product_price_tiers for all
  using (app.is_admin()) with check (app.is_admin());

-- -----------------------------------------------------------------------------
-- 5. Design path / turnaround / skip proof on cart & order items
-- -----------------------------------------------------------------------------
create type public.design_mode as enum ('upload', 'design_for_me', 'template');
create type public.turnaround  as enum ('standard', 'express');

alter table public.cart_items
  add column design_mode public.design_mode not null default 'upload',
  add column turnaround  public.turnaround  not null default 'standard',
  add column skip_proof  boolean not null default false,
  add constraint cart_items_skip_proof_upload_only check (not skip_proof or design_mode = 'upload'),
  add constraint cart_items_template_mode check (design_mode <> 'template' or template_id is not null);

alter table public.order_items
  add column design_mode     public.design_mode not null default 'upload',
  add column turnaround      public.turnaround  not null default 'standard',
  add column skip_proof      boolean not null default false,
  add column price_breakdown jsonb not null default '{}'::jsonb,
  add constraint order_items_skip_proof_upload_only check (not skip_proof or design_mode = 'upload');

-- -----------------------------------------------------------------------------
-- 6. Uploads attached to a cart (product page, before "Add to cart")
-- -----------------------------------------------------------------------------
alter table public.job_files
  add column cart_id uuid references public.carts (id) on delete cascade;
alter table public.job_files drop constraint job_files_has_parent;
alter table public.job_files add constraint job_files_has_parent
  check (job_id is not null or cart_item_id is not null or cart_id is not null);
create index job_files_cart_id_idx on public.job_files (cart_id) where cart_id is not null;

-- -----------------------------------------------------------------------------
-- 7. Jobs
-- -----------------------------------------------------------------------------
alter table public.jobs
  add column revision_fees_total numeric(12,2) not null default 0 check (revision_fees_total >= 0);

-- New jobs take the current free-revision allowance from settings.
alter table public.jobs alter column max_free_revisions drop default;
create or replace function app.tg_jobs_before_insert()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.max_free_revisions is null then
    new.max_free_revisions := app.setting_numeric('free_revisions', 2)::int;
  end if;
  return new;
end $$;
create trigger jobs_before_insert
  before insert on public.jobs
  for each row execute function app.tg_jobs_before_insert();

create or replace function app.is_designer()
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce(app.staff_role() = 'designer', false)
$$;

-- Unassigned, paid jobs waiting for a designer.
create or replace function app.is_queue_job(p_job_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select app.is_designer() and exists (
    select 1 from public.jobs j
    where j.id = p_job_id and j.assigned_designer is null and j.status = 'new'
  )
$$;

create or replace function app.can_view_job(p_job_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select app.is_job_staff(p_job_id)
      or app.is_queue_job(p_job_id)
      or app.customer_can_access_job(p_job_id)
$$;

create or replace function app.can_view_order(p_order_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select app.is_ops()
      or app.customer_can_access_order(p_order_id)
      or (app.is_designer() and exists (
            select 1 from public.jobs j
            where j.order_id = p_order_id
              and (j.assigned_designer = auth.uid()
                   or (j.assigned_designer is null and j.status = 'new'))
         ))
$$;

create or replace function app.tg_jobs_before_update()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_days       int;
  v_total      numeric(12,2);
  v_paid       numeric(12,2);
  v_fee        numeric(12,2);
begin
  if new.order_id <> old.order_id or new.order_item_id <> old.order_item_id
     or new.job_number <> old.job_number then
    raise exception 'jobs.order_id, order_item_id and job_number are immutable'
      using errcode = 'P0001';
  end if;

  -- Only admins (or trusted definer code) may change assignment, revision
  -- allowance or counters directly. public.claim_job sets app.allow_claim.
  if app.is_staff() and not app.is_admin() and (
       (new.assigned_designer is distinct from old.assigned_designer
        and coalesce(current_setting('app.allow_claim', true), '') <> 'on')
    or new.max_free_revisions  is distinct from old.max_free_revisions
    or new.revision_fees_total is distinct from old.revision_fees_total
    or (new.revision_count     is distinct from old.revision_count and new.status = old.status)
  ) then
    raise exception 'only admins can change assignment or revision settings'
      using errcode = '42501';
  end if;

  if new.status is distinct from old.status then
    if not app.job_transition_allowed(old.status, new.status) then
      raise exception 'invalid job status transition: % -> %', old.status, new.status
        using errcode = 'P0001';
    end if;

    -- Owner rule: the full order (incl. quote balance and extra revision fees)
    -- must be paid before printing starts.
    if new.status = 'printing' then
      select o.total, o.amount_paid into v_total, v_paid
      from public.orders o where o.id = new.order_id;
      if v_total > 0 and v_paid < v_total then
        raise exception 'order must be fully paid before printing (Rs % due)', v_total - v_paid
          using errcode = 'P0001';
      end if;
    end if;

    new.status_changed_at := now();

    if new.status = 'changes_requested' then
      new.revision_count := old.revision_count + 1;
      if new.revision_count > new.max_free_revisions then
        v_fee := app.setting_numeric('revision_fee_lkr', 0);
        new.revision_fees_total := old.revision_fees_total + v_fee;
      end if;
    end if;

    if new.status = 'new' and new.due_date is null then
      select case when oi.turnaround = 'express' and p.express_days is not null
                  then p.express_days else coalesce(p.production_days, 3) end
        into v_days
      from public.order_items oi
      left join public.products p on p.id = oi.product_id
      where oi.id = new.order_item_id;
      new.due_date := (now() at time zone 'Asia/Colombo')::date + coalesce(v_days, 3);
    end if;
  end if;

  return new;
end $$;

create or replace function app.tg_jobs_after_status()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_from public.job_status := case when tg_op = 'UPDATE' then old.status end;
  v_body text;
  v_fee  numeric(12,2) := 0;
begin
  insert into public.job_status_history (job_id, from_status, to_status, changed_by)
  values (new.id, v_from, new.status, auth.uid());

  if tg_op = 'UPDATE' then
    v_fee := new.revision_fees_total - old.revision_fees_total;
  end if;

  v_body := app.job_status_label(new.status);
  if new.status = 'changes_requested' and new.revision_count > new.max_free_revisions then
    v_body := v_body || ' (revision ' || new.revision_count || ' — beyond the '
              || new.max_free_revisions || ' free revisions'
              || case when v_fee > 0 then '; Rs ' || to_char(v_fee, 'FM999G999G990') || ' added to your order'
                      else '' end
              || ')';
  end if;

  -- proof_sent is announced by the proof card message (proofs trigger)
  if new.status <> 'proof_sent' then
    insert into public.messages (job_id, sender_type, body, internal, meta)
    values (
      new.id, 'system', v_body, false,
      jsonb_build_object('event', case when tg_op = 'INSERT' then 'job_created' else 'status_changed' end,
                         'from', v_from, 'to', new.status, 'revision_count', new.revision_count,
                         'revision_fee', v_fee)
    );
  end if;

  -- Paid extra revision: add to the order and recompute payment status.
  if v_fee > 0 then
    update public.orders
       set extras_total = extras_total + v_fee,
           total        = total + v_fee
     where id = new.order_id;
    perform app.recalc_order_payment(new.order_id);
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

-- Quote totals must keep any extras already on the order.
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
           total           = new.total + extras_total,
           advance_percent = new.advance_percent
     where id = new.order_id;

    update public.jobs set status = 'quote_sent'
    where order_id = new.order_id and status = 'quote_requested';

  elsif new.status = 'accepted' then
    update public.jobs set status = 'awaiting_payment'
    where order_id = new.order_id and status = 'quote_sent';
    perform app.recalc_order_payment(new.order_id);
  end if;
  return null;
end $$;

-- Designer picks a job from the unassigned queue.
create or replace function public.claim_job(p_job_id uuid)
returns public.jobs
language plpgsql security definer set search_path = '' as $$
declare
  v_job public.jobs%rowtype;
begin
  if not (app.is_designer() or app.is_admin()) then
    raise exception 'only designers can claim jobs' using errcode = '42501';
  end if;
  perform set_config('app.allow_claim', 'on', true);
  update public.jobs
     set assigned_designer = auth.uid()
   where id = p_job_id and assigned_designer is null and status = 'new'
  returning * into v_job;
  perform set_config('app.allow_claim', 'off', true);
  if v_job.id is null then
    raise exception 'this job is no longer available' using errcode = 'P0001';
  end if;
  return v_job;
end $$;

revoke all on function public.claim_job(uuid) from public;
grant execute on function public.claim_job(uuid) to authenticated, service_role;

-- Proof responses: tell the client the fee that WILL apply before asking.
create or replace function public.revision_fee_preview(p_job_id uuid)
returns table (revision_count int, max_free_revisions int, next_revision_fee numeric)
language sql stable security definer set search_path = '' as $$
  select j.revision_count, j.max_free_revisions,
         case when j.revision_count + 1 > j.max_free_revisions
              then app.setting_numeric('revision_fee_lkr', 0) else 0 end
  from public.jobs j
  where j.id = p_job_id and (app.can_view_job(p_job_id) or app.is_service_role())
$$;

revoke all on function public.revision_fee_preview(uuid) from public;
grant execute on function public.revision_fee_preview(uuid) to anon, authenticated, service_role;

grant execute on function app.setting_numeric(text, numeric), app.is_designer(), app.is_queue_job(uuid)
  to anon, authenticated, service_role;

-- -----------------------------------------------------------------------------
-- 8. RLS updates
-- -----------------------------------------------------------------------------
drop policy job_files_select on public.job_files;
create policy job_files_select on public.job_files for select using (
  (job_id is not null and app.is_job_staff(job_id))
  or (job_id is not null and kind = 'customer_upload' and app.is_queue_job(job_id))
  or (job_id is not null and kind in ('customer_upload', 'proof', 'attachment')
      and app.customer_can_access_job(job_id))
  or (job_id is null and cart_item_id is not null and app.owns_cart_item(cart_item_id))
  or (job_id is null and cart_id is not null and app.owns_cart(cart_id))
);

drop policy job_files_customer_insert on public.job_files;
create policy job_files_customer_insert on public.job_files for insert with check (
  kind in ('customer_upload', 'attachment')
  and upload_status = 'pending'
  and (
    (job_id is not null and app.customer_can_access_job(job_id))
    or (job_id is null and cart_id is not null and app.owns_cart(cart_id)
        and (cart_item_id is null or app.owns_cart_item(cart_item_id)))
  )
);

commit;
