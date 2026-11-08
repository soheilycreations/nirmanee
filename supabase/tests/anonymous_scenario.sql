-- Anonymous-user scenario (run after phase1a_scenario.sql on the same database).
\set ON_ERROR_STOP 1
insert into auth.users(id, is_anonymous) values ('00000000-0000-0000-0000-0000000000b1', true);
select id as review_item from order_items oi where exists (select 1 from jobs j where j.order_item_id = oi.id and j.status = 'delivered') limit 1 \gset

\echo ---- anonymous user cannot become staff
do $$ begin
  insert into staff(user_id, role, display_name) values ('00000000-0000-0000-0000-0000000000b1','admin','x');
  raise notice 'BAD: anonymous staff created';
exception when others then raise notice 'OK blocked: %', sqlerrm; end $$;

\echo ---- an anonymous JWT never gets staff rights, even for a staff uid
begin; set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000a';
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated","is_anonymous":true}';
select app.is_staff() as staff_when_anonymous_claim;
commit;
begin; set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000a';
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated","is_anonymous":false}';
select app.is_staff() as staff_when_permanent;
commit;

\echo ---- guest: one active cart, cart works, no review without token
begin; set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000b1';
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000b1","role":"authenticated","is_anonymous":true}';
select set_config('test.review_item', :'review_item', true);
insert into carts(user_id) values ('00000000-0000-0000-0000-0000000000b1');
savepoint s1;
do $$ begin
  insert into carts(user_id) values ('00000000-0000-0000-0000-0000000000b1');
  raise notice 'BAD: second active cart';
exception when unique_violation then raise notice 'OK blocked: second active cart'; end $$;
select count(*) as guest_carts from carts;
do $$ begin
  insert into reviews(order_item_id, author_name, rating) values (current_setting('test.review_item')::uuid, 'Guest', 5);
  raise notice 'BAD: anonymous review';
exception when others then raise notice 'OK blocked: %', sqlerrm; end $$;
do $$ begin
  update profiles set email = 'x@y.lk' where id = '00000000-0000-0000-0000-0000000000b1';
  raise notice 'email update affected % rows (profile row may not exist in stub)', (select count(*) from profiles where id='00000000-0000-0000-0000-0000000000b1');
exception when others then raise notice 'OK blocked: %', sqlerrm; end $$;
commit;
