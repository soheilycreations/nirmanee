-- Catalog content patch (2026-11-13): product specs + Digital Printing blurb.
-- Idempotent: safe to run more than once in the Supabase SQL Editor. Touches only
-- products.specs and categories.description_en/si, matched by slug. Prices, options and images are NOT changed.
-- Spec values flagged `specs_review` in supabase/seed/catalog.json are drafts for the owner to confirm.

begin;

update public.categories set description_en = 'Full-colour business cards on premium art card, with fast turnaround. Need something else printed? Message us on WhatsApp.', description_si = 'ප්‍රීමියම් කාඩ්බෝඩ් මත පූර්ණ වර්ණ විසිටින් කාඩ් — ඉක්මන් සේවාව. වෙනත් මුද්‍රණයක් අවශ්‍යද? WhatsApp හරහා අපට පණිවිඩයක් එවන්න.'
where slug = 'digital-printing';

update public.products set specs = '[{"label_en": "Size", "value_en": "11 oz / 330 ml"}, {"label_en": "Material", "value_en": "Glossy white ceramic"}, {"label_en": "Finish", "value_en": "Glossy, full-wrap sublimation print"}, {"label_en": "Care", "value_en": "Dishwasher & microwave safe"}]'::jsonb where slug = 'photo-mug-white-11oz';
update public.products set specs = '[{"label_en": "Size", "value_en": "11 oz / 330 ml"}, {"label_en": "Material", "value_en": "Ceramic"}, {"label_en": "Finish", "value_en": "Black until a hot drink reveals your photo"}, {"label_en": "Care", "value_en": "Hand wash only"}]'::jsonb where slug = 'magic-colour-changing-mug';
update public.products set specs = '[{"label_en": "Size", "value_en": "Round 8 in or square 10 in"}, {"label_en": "Material", "value_en": "Gloss MDF"}, {"label_en": "Finish", "value_en": "Glossy sublimation print"}, {"label_en": "Battery", "value_en": "1 × AA (not included)"}]'::jsonb where slug = 'mdf-sublimation-clock';
update public.products set specs = '[{"label_en": "Size", "value_en": "8 × 10, 10 × 12 or 12 × 18 in"}, {"label_en": "Material", "value_en": "Wooden frame"}, {"label_en": "Finish", "value_en": "Backlit photo print"}, {"label_en": "Power", "value_en": "USB / adapter"}]'::jsonb where slug = 'photo-frame-with-light';
update public.products set specs = '[{"label_en": "Size", "value_en": "4 × 6 or 6 × 8 in"}, {"label_en": "Material", "value_en": "Natural pine"}, {"label_en": "Finish", "value_en": "Natural wood with magnetic back"}]'::jsonb where slug = 'magnet-pine-wood-frame';
update public.products set specs = '[{"label_en": "Size", "value_en": "Hexagon with desk stand"}, {"label_en": "Material", "value_en": "Sublimation glass"}, {"label_en": "Finish", "value_en": "Glossy glass print"}]'::jsonb where slug = 'hexagon-glass-photo-frame';
update public.products set specs = '[{"label_en": "Size", "value_en": "Desk frame with small clock"}, {"label_en": "Material", "value_en": "Glass"}, {"label_en": "Finish", "value_en": "Sublimation print on glass"}, {"label_en": "Battery", "value_en": "Button cell (included)"}]'::jsonb where slug = 'anniversary-glass-clock-frame';
update public.products set specs = '[{"label_en": "Size", "value_en": "Holds one couple photo"}, {"label_en": "Material", "value_en": "MDF / wood"}, {"label_en": "Finish", "value_en": "Laser-cut hearts and names"}]'::jsonb where slug = 'custom-love-wooden-frame';
update public.products set specs = '[{"label_en": "Size", "value_en": "12 × 6 or 18 × 8 in"}, {"label_en": "Material", "value_en": "Painted MDF or acrylic"}, {"label_en": "Finish", "value_en": "Laser-cut"}]'::jsonb where slug = 'laser-cut-name-plate';
update public.products set specs = '[{"label_en": "Size", "value_en": "8 × 10, 10 × 12 or 12 × 18 in"}, {"label_en": "Material", "value_en": "MDF or natural pine"}, {"label_en": "Finish", "value_en": "Black finish, laser-engraved photo"}]'::jsonb where slug = 'black-board-frame-engraving';
update public.products set specs = '[{"label_en": "Size", "value_en": "Varies (each slice is natural)"}, {"label_en": "Material", "value_en": "Natural wood with bark edge"}, {"label_en": "Finish", "value_en": "Laser-engraved"}]'::jsonb where slug = 'wood-slice-engraving';
update public.products set specs = '[{"label_en": "Size", "value_en": "Small 3 × 4, medium 4 × 6 or large 6 × 8 in"}, {"label_en": "Material", "value_en": "Optical crystal"}, {"label_en": "Finish", "value_en": "Photo printed inside the crystal"}, {"label_en": "Includes", "value_en": "Gift box"}]'::jsonb where slug = 'crystal-photo-block';
update public.products set specs = '[{"label_en": "Size", "value_en": "2 × 4 ft and up, or any custom size"}, {"label_en": "Material", "value_en": "Standard or star flex (heavy duty)"}, {"label_en": "Finish", "value_en": "Eyelets, pole pockets or cut only"}, {"label_en": "Print", "value_en": "Solvent / eco-solvent, outdoor"}, {"label_en": "Max width", "value_en": "10 ft seamless"}]'::jsonb where slug = 'flex-banner';
update public.products set specs = '[{"label_en": "Size", "value_en": "3.5 × 2 in"}, {"label_en": "Material", "value_en": "300 or 350 gsm art card"}, {"label_en": "Finish", "value_en": "Matte, gloss or matte laminated"}, {"label_en": "Quantity", "value_en": "100 cards per pack"}]'::jsonb where slug = 'business-cards';
update public.products set specs = '[{"label_en": "Size", "value_en": "A3, A2, A1 or A0"}, {"label_en": "Material", "value_en": "Plotter paper"}, {"label_en": "Finish", "value_en": "Black & white or colour"}, {"label_en": "Files", "value_en": "PDF preferred (vector)"}]'::jsonb where slug = 'plan-printing';
update public.products set specs = '[{"label_en": "Size", "value_en": "8 × 12, 12 × 18, 16 × 24 or 20 × 30 in"}, {"label_en": "Material", "value_en": "Photo paper or canvas"}, {"label_en": "Finish", "value_en": "Matte, gloss or canvas"}]'::jsonb where slug = 'photo-enlargement';
update public.products set specs = '[{"label_en": "Size", "value_en": "S, M, L, XL or XXL"}, {"label_en": "Material", "value_en": "100% cotton"}, {"label_en": "Finish", "value_en": "Printed front, or front & back"}]'::jsonb where slug = 'custom-t-shirt';
update public.products set specs = '[{"label_en": "Size", "value_en": "Round 8 in or A4"}, {"label_en": "Material", "value_en": "Edible icing sheet"}, {"label_en": "Finish", "value_en": "Food-safe edible ink"}, {"label_en": "Storage", "value_en": "Keep dry, use within 3 months"}]'::jsonb where slug = 'edible-cake-print';
update public.products set specs = '[{"label_en": "Size", "value_en": "Standard key-tag size"}, {"label_en": "Material", "value_en": "MDF or acrylic"}, {"label_en": "Finish", "value_en": "Double-sided print"}]'::jsonb where slug = 'photo-key-tag';

commit;

-- Check: every product should list 3+ specs.
select slug, jsonb_array_length(specs) as spec_count from public.products order by slug;
