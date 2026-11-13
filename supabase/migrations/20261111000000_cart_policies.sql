-- =============================================================================
-- Carts: check ownership on the row's own columns.
--
-- The original `carts_owner_all` policy used app.owns_cart(id), which looks the
-- cart up by id. Inside INSERT ... RETURNING that lookup cannot see the row
-- being inserted, so creating a cart and reading it back in one statement
-- failed with "new row violates row-level security policy". Checking
-- user_id / guest_token_hash directly fixes that and avoids a sub-query per row.
-- =============================================================================
begin;

drop policy if exists carts_owner_all on public.carts;

create policy carts_owner_select on public.carts for select using (
  (auth.uid() is not null and user_id = auth.uid())
  or (guest_token_hash is not null and guest_token_hash = app.header_token_hash('x-cart-token'))
  or app.is_admin()
);

create policy carts_owner_insert on public.carts for insert with check (
  (auth.uid() is not null and user_id = auth.uid())
  or (guest_token_hash is not null and guest_token_hash = app.header_token_hash('x-cart-token'))
  or app.is_admin()
);

create policy carts_owner_update on public.carts for update
  using (
    (auth.uid() is not null and user_id = auth.uid())
    or (guest_token_hash is not null and guest_token_hash = app.header_token_hash('x-cart-token'))
    or app.is_admin()
  )
  with check (
    (auth.uid() is not null and user_id = auth.uid())
    or (guest_token_hash is not null and guest_token_hash = app.header_token_hash('x-cart-token'))
    or app.is_admin()
  );

create policy carts_owner_delete on public.carts for delete using (
  (auth.uid() is not null and user_id = auth.uid())
  or (guest_token_hash is not null and guest_token_hash = app.header_token_hash('x-cart-token'))
  or app.is_admin()
);

commit;
