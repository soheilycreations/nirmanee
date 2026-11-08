-- Minimal stand-ins for the objects a real Supabase project provides, so the
-- migrations can be tested on plain Postgres 15+:
--   psql -d test -f supabase/tests/_supabase_stub.sql \
--        -f supabase/migrations/20261108000000_foundation_schema.sql \
--        -f supabase/tests/_grants.sql -f supabase/tests/foundation_scenario.sql
-- NOT for use against a real Supabase database.
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then create role service_role nologin bypassrls; end if;
end $$;
create schema auth;
create table auth.users (id uuid primary key, email text, phone text, raw_user_meta_data jsonb default '{}');
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true),'')::uuid $$;
grant usage on schema auth to anon, authenticated, service_role;
grant execute on function auth.uid() to anon, authenticated, service_role;
do $$ begin if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then create publication supabase_realtime; end if; end $$;
