-- =============================================================================
-- 1. Flex banner eyelets: per running foot of perimeter (admin-editable value;
--    Rs 20/ft is a placeholder until the owner confirms).
-- 2. Templates: 4 simple layouts for the photo mug and for photo frames
--    (single photo, photo + name, 2-photo collage, photo + date/message).
--    The three earlier mug templates are deactivated (kept for history).
-- =============================================================================
begin;

update public.product_option_values v
   set modifier_type = 'per_running_ft', price_modifier = 20
  from public.product_options o
  join public.products p on p.id = o.product_id
 where v.option_id = o.id and p.slug = 'flex-banner' and o.code = 'finish' and v.value = 'eyelets';

update public.product_templates t
   set is_active = false
  from public.products p
 where t.product_id = p.id and p.slug = 'photo-mug-white-11oz'
   and t.preview_key in ('/templates/mug-birthday.svg', '/templates/mug-love.svg', '/templates/mug-logo.svg');

insert into public.product_templates (product_id, name_en, name_si, preview_key, config, sort_order)
select p.id, t.name_en, t.name_si, t.preview_key, t.config::jsonb, t.sort_order
from public.products p
cross join (values
  ('Single photo',      'තනි ඡායාරූපය',          '/templates/mug-single-photo.svg',  '{"photo_slots":1,"text_fields":[]}',                  10),
  ('Photo + name',      'ඡායාරූපය + නම',         '/templates/mug-photo-name.svg',    '{"photo_slots":1,"text_fields":["name"]}',            20),
  ('2-photo collage',   'ඡායාරූප 2ක කොලාජය',     '/templates/mug-collage-2.svg',     '{"photo_slots":2,"text_fields":[]}',                  30),
  ('Photo + message',   'ඡායාරූපය + පණිවිඩය',    '/templates/mug-photo-message.svg', '{"photo_slots":1,"text_fields":["message","date"]}',  40)
) as t(name_en, name_si, preview_key, config, sort_order)
where p.slug = 'photo-mug-white-11oz'
  and not exists (select 1 from public.product_templates x where x.product_id = p.id and x.preview_key = t.preview_key);

insert into public.product_templates (product_id, name_en, name_si, preview_key, config, sort_order)
select p.id, t.name_en, t.name_si, t.preview_key, t.config::jsonb, t.sort_order
from public.products p
cross join (values
  ('Single photo',      'තනි ඡායාරූපය',          '/templates/frame-single-photo.svg', '{"photo_slots":1,"text_fields":[]}',               10),
  ('Photo + name',      'ඡායාරූපය + නම',         '/templates/frame-photo-name.svg',   '{"photo_slots":1,"text_fields":["name"]}',         20),
  ('2-photo collage',   'ඡායාරූප 2ක කොලාජය',     '/templates/frame-collage-2.svg',    '{"photo_slots":2,"text_fields":[]}',               30),
  ('Photo + date',      'ඡායාරූපය + දිනය',       '/templates/frame-photo-date.svg',   '{"photo_slots":1,"text_fields":["date","message"]}', 40)
) as t(name_en, name_si, preview_key, config, sort_order)
where p.slug in ('photo-frame-with-light', 'magnet-pine-wood-frame')
  and not exists (select 1 from public.product_templates x where x.product_id = p.id and x.preview_key = t.preview_key);

commit;
