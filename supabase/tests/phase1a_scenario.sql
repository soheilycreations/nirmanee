-- Phase 1A scenario (run after foundation_scenario.sql on the same database).
-- Checks: designer queue + claim, 3rd revision fee, printing payment gate,
-- quote balance gate, delivery zones / settings visibility, cart uploads.
\set ON_ERROR_STOP 1

-- New paid fixed order, unassigned
insert into orders(id,user_id,access_token_hash,type,customer_name,customer_phone,subtotal,total)
values ('30000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-00000000000c','h3','fixed','Kamal','0771234567',1500,1500);
insert into order_items(order_id,product_id,product_snapshot,quantity,unit_price,line_total,turnaround)
values ('30000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000001','{}',1,1500,1500,'express');
update products set express_days = 1 where id='20000000-0000-0000-0000-000000000001';
insert into payments(order_id,provider,kind,amount,status,merchant_reference) values ('30000000-0000-0000-0000-000000000003','payhere','full',1500,'confirmed','P3');
select status, max_free_revisions, due_date - (now() at time zone 'Asia/Colombo')::date as days_to_due
  from jobs where order_id='30000000-0000-0000-0000-000000000003';

\echo ---- designer queue + claim
begin; set local role authenticated; set local request.jwt.claim.sub='00000000-0000-0000-0000-00000000000e';
select count(*) as queue_jobs_visible from jobs where order_id='30000000-0000-0000-0000-000000000003';
select (claim_job((select id from jobs where order_id='30000000-0000-0000-0000-000000000003'))).assigned_designer = '00000000-0000-0000-0000-00000000000e' as claimed;
commit;
begin; set local role authenticated; set local request.jwt.claim.sub='00000000-0000-0000-0000-00000000000d';
select count(*) as other_designer_sees from jobs where order_id='30000000-0000-0000-0000-000000000003';
do $$ begin perform claim_job((select id from jobs where order_id='30000000-0000-0000-0000-000000000003')); raise notice 'BAD double claim'; exception when others then raise notice 'OK blocked: %', sqlerrm; end $$;
commit;

\echo ---- three revisions -> fee on the 3rd
do $$
declare v_job uuid := (select id from jobs where order_id='30000000-0000-0000-0000-000000000003'); v_file uuid; i int;
begin
  for i in 1..3 loop
    insert into job_files(job_id,kind,r2_key,original_filename,content_type,size_bytes)
      values (v_job,'proof','p3/'||i,'p.jpg','image/jpeg',10) returning id into v_file;
    insert into proofs(job_id,file_id) values (v_job, v_file);
    perform respond_to_proof((select id from proofs where job_id=v_job and status='pending'),'changes_requested','again '||i);
  end loop;
end $$;
select j.revision_count, j.revision_fees_total, o.extras_total, o.total, o.payment_status, o.amount_due
  from jobs j join orders o on o.id=j.order_id where o.id='30000000-0000-0000-0000-000000000003';
select (revision_fee_preview((select id from jobs where order_id='30000000-0000-0000-0000-000000000003'))).*;
select body from messages m join jobs j on j.id=m.job_id where j.order_id='30000000-0000-0000-0000-000000000003' and body like '%Rs%';

\echo ---- printing gate
do $$ declare v_job uuid := (select id from jobs where order_id='30000000-0000-0000-0000-000000000003'); v_file uuid;
begin
  insert into job_files(job_id,kind,r2_key,original_filename,content_type,size_bytes) values (v_job,'proof','p3/4','p.jpg','image/jpeg',10) returning id into v_file;
  insert into proofs(job_id,file_id) values (v_job, v_file);
  perform respond_to_proof((select id from proofs where job_id=v_job and status='pending'),'approved',null);
  begin update jobs set status='printing' where id=v_job; raise notice 'BAD printed unpaid';
  exception when others then raise notice 'OK blocked: %', sqlerrm; end;
end $$;
insert into payments(order_id,provider,kind,amount,status,merchant_reference) values ('30000000-0000-0000-0000-000000000003','cash','extra',500,'confirmed','P3-X');
update jobs set status='printing' where order_id='30000000-0000-0000-0000-000000000003';
select status from jobs where order_id='30000000-0000-0000-0000-000000000003';

\echo ---- quote balance gate (order 2 has 50% advance paid)
do $$ declare v_job uuid := (select id from jobs where order_id='30000000-0000-0000-0000-000000000002');
begin
  update jobs set status='approved' where id=v_job;
  begin update jobs set status='printing' where id=v_job; raise notice 'BAD quote printed with balance due';
  exception when others then raise notice 'OK blocked: %', sqlerrm; end;
end $$;

\echo ---- public settings + zones, cart upload
begin; set local role anon;
select count(*) zones, (select value from app_settings where key='revision_fee_lkr') fee from delivery_zones;
commit;
insert into auth.users(id) values ('00000000-0000-0000-0000-0000000000a1');
begin; set local role authenticated; set local request.jwt.claim.sub='00000000-0000-0000-0000-0000000000a1';
insert into carts(id,user_id) values ('50000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-0000000000a1');
insert into job_files(cart_id,kind,r2_key,original_filename,content_type,size_bytes) values ('50000000-0000-0000-0000-000000000001','customer_upload','carts/x/a.jpg','a.jpg','image/jpeg',100);
insert into cart_items(id,cart_id,product_id,design_mode,turnaround,skip_proof) values ('51000000-0000-0000-0000-000000000001','50000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','upload','express',true);
select count(*) own_cart_files from job_files;
commit;
begin; set local role authenticated; set local request.jwt.claim.sub='00000000-0000-0000-0000-00000000000f';
select count(*) other_user_cart_files from job_files where cart_id is not null;
commit;
