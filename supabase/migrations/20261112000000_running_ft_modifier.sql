-- New price modifier: charged per running foot of the print's perimeter
-- (e.g. banner eyelets / hemming). Kept in its own migration: a new enum value
-- must be committed before other statements can use it.
alter type public.price_modifier_type add value if not exists 'per_running_ft';
