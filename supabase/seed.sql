-- Seed data for local development (`supabase db reset` runs this after migrations).
-- Sinhala names are a first draft — have a native speaker review before launch.
insert into public.categories (slug, name_en, name_si, sort_order) values
  ('digital-printing',   'Digital Printing',     'ඩිජිටල් මුද්‍රණය',            10),
  ('photo-framing',      'Photo Framing',        'ඡායාරූප රාමු',                20),
  ('mug-printing',       'Mug & Sublimation',    'මග් සහ සබ්ලිමේෂන් මුද්‍රණය',   30),
  ('crystal-printing',   'Crystal Printing',     'ක්‍රිස්ටල් මුද්‍රණය',            40),
  ('laser-cutting',      'Laser Cutting',        'ලේසර් කැපීම',                 50),
  ('wood-engraving',     'Wood Engraving',       'ලී මත කැටයම්',                60),
  ('banners',            'Banners & Large Format','බැනර් මුද්‍රණය',              70),
  ('plan-printing',      'Plan Printing',        'සැලසුම් මුද්‍රණය',             80),
  ('photo-enlargement',  'Photo Enlargement',    'ඡායාරූප විශාලනය',             90),
  ('t-shirt-printing',   'T-Shirt Printing',     'ටී-ෂර්ට් මුද්‍රණය',            100),
  ('edible-print',       'Edible Print',         'කෑමට ගත හැකි මුද්‍රණ',          110),
  ('custom-souvenirs',   'Custom Souvenirs',     'සිහිවටන භාණ්ඩ',               120)
on conflict (slug) do nothing;
