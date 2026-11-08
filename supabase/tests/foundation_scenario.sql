-- End-to-end scenario for the foundation schema (run after _supabase_stub.sql,
-- the migration and _grants.sql — see _supabase_stub.sql header).
-- Exercises: fixed order -> payment -> designer proof -> changes requested ->
-- re-proof -> guest approval via x-order-token -> production -> delivered ->
-- review; quote -> sent -> accepted -> 50% advance; RLS isolation.
\set ON_ERROR_STOP 1
-- users
insert into auth.users(id,email) values
 ('00000000-0000-0000-0000-00000000000a','admin@x.lk'),
 ('00000000-0000-0000-0000-00000000000d','des@x.lk'),
 ('00000000-0000-0000-0000-00000000000e','des2@x.lk'),
 ('00000000-0000-0000-0000-00000000000c','cust@x.lk'),
 ('00000000-0000-0000-0000-00000000000f','other@x.lk');
insert into staff values ('00000000-0000-0000-0000-00000000000a','admin','Admin',true),
 ('00000000-0000-0000-0000-00000000000d','designer','Des',true),
 ('00000000-0000-0000-0000-00000000000e','designer','Des2',true);
insert into categories(id,slug,name_en) values ('10000000-0000-0000-0000-000000000001','test-mugs','Mugs'),('10000000-0000-0000-0000-000000000002','test-banners','Banners');
insert into products(id,category_id,slug,name_en,base_price,production_days) values ('20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','magic-mug','Magic Mug',1500,4);
insert into products(id,category_id,slug,name_en,order_type,pricing_mode,price_per_sqft) values ('20000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000002','flex-banner','Flex Banner','quote','per_sqft',90);

-- FIXED order (service role / server action)
insert into orders(id,user_id,access_token_hash,type,customer_name,customer_phone,subtotal,total)
values ('30000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-00000000000c', encode(extensions.digest('cust-token-cust-token-cust-token-xx','sha256'),'hex'),'fixed','Kamal','0771234567',3000,3000);
insert into order_items(order_id,product_id,product_snapshot,quantity,unit_price,line_total) values ('30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','{}',2,1500,3000);
select order_number, payment_status from orders;
select job_number,status from jobs;
insert into payments(order_id,provider,kind,amount,status,merchant_reference) values ('30000000-0000-0000-0000-000000000001','payhere','full',3000,'confirmed','NP-1-A');
select 'after payment' t, o.payment_status, o.amount_due, j.status, j.due_date is not null as has_due from orders o join jobs j on j.order_id=o.id;
update jobs set assigned_designer='00000000-0000-0000-0000-00000000000d';
\echo ---- designer flow
begin;
set local role authenticated; set local request.jwt.claim.sub='00000000-0000-0000-0000-00000000000d';
update jobs set status='artwork_in_progress';
insert into job_files(id,job_id,kind,r2_key,original_filename,content_type,size_bytes,upload_status) select '40000000-0000-0000-0000-000000000001',id,'proof','proofs/1.jpg','p1.jpg','image/jpeg',1000,'uploaded' from jobs;
insert into proofs(job_id,file_id) select id,'40000000-0000-0000-0000-000000000001' from jobs;
insert into messages(job_id,sender_type,sender_id,body,internal) select id,'staff','00000000-0000-0000-0000-00000000000d','check bleed',true from jobs;
commit;
select status, revision_count from jobs;
\echo ---- customer flow
begin;
set local role authenticated; set local request.jwt.claim.sub='00000000-0000-0000-0000-00000000000c';
select count(*) as cust_visible_msgs, count(*) filter (where internal) as internal_visible from messages;
select respond_to_proof((select id from proofs limit 1),'changes_requested','Make the name bigger') is not null as responded;
insert into messages(job_id,sender_type,sender_id,body) select id,'customer','00000000-0000-0000-0000-00000000000c','thanks' from jobs;
commit;
select status, revision_count from jobs;
-- 2nd + 3rd proof
insert into job_files(id,job_id,kind,r2_key,original_filename,content_type,size_bytes) select '40000000-0000-0000-0000-000000000002',id,'proof','proofs/2.jpg','p2.jpg','image/jpeg',1000 from jobs;
insert into proofs(job_id,file_id) select id,'40000000-0000-0000-0000-000000000002' from jobs;
select version,status from proofs order by version;
\echo ---- guest token access
begin; set local role anon;
select count(*) as anon_no_token_jobs from jobs;
set local request.headers='{"x-order-token":"cust-token-cust-token-cust-token-xx"}';
select count(*) as anon_token_jobs from jobs;
select (respond_to_proof((select id from proofs where status='pending'),'approved',null)).status;
commit;
select status, revision_count from jobs;
\echo ---- other user & other designer see nothing
begin; set local role authenticated; set local request.jwt.claim.sub='00000000-0000-0000-0000-00000000000f';
select count(*) o_jobs, (select count(*) from orders) o_orders, (select count(*) from messages) o_msgs from jobs; commit;
begin; set local role authenticated; set local request.jwt.claim.sub='00000000-0000-0000-0000-00000000000e';
select count(*) d2_jobs from jobs; commit;
\echo ---- designer cannot reassign
begin; set local role authenticated; set local request.jwt.claim.sub='00000000-0000-0000-0000-00000000000d';
savepoint s; 
do $$ begin update jobs set assigned_designer='00000000-0000-0000-0000-00000000000e'; raise notice 'BAD: reassigned'; exception when others then raise notice 'OK blocked: %', sqlerrm; end $$;
do $$ begin update jobs set status='delivered'; raise notice 'BAD'; exception when others then raise notice 'OK blocked: %', sqlerrm; end $$;
update jobs set status='printing'; update jobs set status='quality_check'; update jobs set status='ready_for_pickup'; update jobs set status='delivered';
commit;
select o.status order_status, j.status from orders o join jobs j on j.order_id=o.id;
\echo ---- review
begin; set local role authenticated; set local request.jwt.claim.sub='00000000-0000-0000-0000-00000000000c';
insert into reviews(order_item_id,author_name,rating,body,is_published) select id,'Kamal',5,'great',true from order_items;
select rating,is_published,product_id is not null from reviews; commit;
\echo ---- QUOTE flow
insert into orders(id,access_token_hash,type,customer_name,customer_phone) values ('30000000-0000-0000-0000-000000000002','x','quote','Nimal','0779999999');
insert into order_items(order_id,product_id,product_snapshot,quantity,width_in,height_in) values ('30000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000002','{}',1,120,48);
select advance_percent, (select status from jobs where order_id='30000000-0000-0000-0000-000000000002') , (select area_sqft from order_items where order_id='30000000-0000-0000-0000-000000000002') from orders where id='30000000-0000-0000-0000-000000000002';
insert into quotes(order_id,status,subtotal,delivery_fee) values ('30000000-0000-0000-0000-000000000002','sent',3600,400);
select total, advance_percent, (select status from jobs where order_id=o.id) from orders o where id='30000000-0000-0000-0000-000000000002';
select (accept_quote((select id from quotes))).status;
insert into payments(order_id,provider,kind,amount,status,merchant_reference) values ('30000000-0000-0000-0000-000000000002','payhere','advance',1999,'confirmed','Q-A1');
select payment_status, amount_due, (select status from jobs where order_id=o.id) from orders o where id='30000000-0000-0000-0000-000000000002';
insert into payments(order_id,provider,kind,amount,status,merchant_reference) values ('30000000-0000-0000-0000-000000000002','payhere','advance',1,'pending','Q-A2');
update payments set status='confirmed' where merchant_reference='Q-A2';
select payment_status, amount_due, (select status from jobs where order_id=o.id) from orders o where id='30000000-0000-0000-0000-000000000002';
\echo ---- history & messages for job 1
select from_status,to_status from job_status_history h join jobs j on j.id=h.job_id where j.order_id='30000000-0000-0000-0000-000000000001' order by h.id;
select sender_type, internal, left(body,70) from messages m join jobs j on j.id=m.job_id where j.order_id='30000000-0000-0000-0000-000000000001' order by m.created_at, m.id;
\echo ---- payments hidden from customer
begin; set local role authenticated; set local request.jwt.claim.sub='00000000-0000-0000-0000-00000000000c'; select count(*) cust_payments from payments; commit;
