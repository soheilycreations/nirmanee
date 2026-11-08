-- =============================================================================
-- Distinguish Supabase anonymous users (guests) from permanent accounts.
--
-- Guests get a real auth.uid() via signInAnonymously(), with JWT claim
-- is_anonymous = true and role "authenticated". RLS must therefore never
-- treat "authenticated" as "trusted". Rules:
--   * Anonymous users can NEVER act as staff (even if a staff row exists).
--   * Anonymous users cannot be added to public.staff.
--   * Anonymous users may: browse, own ONE active cart, upload to it, and
--     (later) place orders, chat and approve proofs on their own jobs.
--   * Reviews require a permanent account or the order access token.
-- =============================================================================

begin;

create or replace function app.is_anonymous()
returns boolean language sql stable set search_path = '' as $$
  select coalesce(
    (nullif(current_setting('request.jwt.claims', true), '')::json ->> 'is_anonymous')::boolean,
    false
  )
$$;

grant execute on function app.is_anonymous() to anon, authenticated, service_role;

-- Staff identity requires a permanent account.
create or replace function app.staff_role()
returns public.staff_role language sql stable security definer set search_path = '' as $$
  select s.role from public.staff s
  where s.user_id = auth.uid() and s.is_active and not app.is_anonymous()
$$;

create or replace function app.tg_staff_not_anonymous()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if exists (select 1 from auth.users u where u.id = new.user_id and coalesce(u.is_anonymous, false)) then
    raise exception 'anonymous users cannot be staff' using errcode = '42501';
  end if;
  return new;
end $$;

create trigger staff_not_anonymous
  before insert or update of user_id on public.staff
  for each row execute function app.tg_staff_not_anonymous();

-- One active cart per user (also protects against cart spam from a guest session).
with ranked as (
  select id, row_number() over (partition by user_id order by created_at desc) as rn
  from public.carts where status = 'active' and user_id is not null
)
update public.carts c set status = 'abandoned' from ranked r where c.id = r.id and r.rn > 1;

create unique index carts_one_active_per_user on public.carts (user_id) where status = 'active' and user_id is not null;

-- Reviews: permanent account, or the order access token for guests.
drop policy reviews_customer_insert on public.reviews;
create policy reviews_customer_insert on public.reviews for insert with check (
  (auth.uid() is not null and not app.is_anonymous() and (user_id is null or user_id = auth.uid()))
  or app.header_token_hash('x-order-token') is not null
);

-- Guests may only edit their own profile's name/phone/locale like everyone
-- else, but a guest profile must not claim an email (set on account upgrade).
create or replace function app.tg_profiles_guard()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if app.is_anonymous() and new.email is distinct from old.email then
    raise exception 'guests cannot set an email; upgrade the account instead' using errcode = '42501';
  end if;
  return new;
end $$;

create trigger profiles_guard
  before update on public.profiles
  for each row execute function app.tg_profiles_guard();

commit;
