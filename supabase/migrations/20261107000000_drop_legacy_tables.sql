-- =============================================================================
-- Drop the legacy prototype tables from supabase/schema.sql.
-- They only ever held mock data (confirmed by the owner on 2026-11-08).
-- Runs BEFORE 20261108000000_foundation_schema.sql, which reuses the names
-- products / orders / order_items with a different shape.
-- Safe on a fresh database (IF EXISTS).
-- =============================================================================
begin;

drop table if exists public.order_items cascade;
drop table if exists public.orders cascade;
drop table if exists public.products cascade;

commit;
