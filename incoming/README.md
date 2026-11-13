# incoming/

Drop zone for **raw assets** that still need processing. Nothing here is served by the
website — files only go live once they are processed into `public/`.

## What to drop here

| Drop this | Naming | Ends up in |
|---|---|---|
| Real product photos | `<product-slug>/1.jpg`, `2.jpg`, … (any format: jpg, png, heic, webp) | `public/products/<slug>/1.webp`, `2.webp`, … |
| AI sample images (only when no real photo exists yet) | `<product-slug>/sample-1.jpg` | `public/products/<slug>/sample-1.webp` |
| Brand photos (shop, team, workshop) | descriptive kebab-case, e.g. `workshop-laser-cutter.jpg` | `public/brand/` |
| Logo / vector files | `nirmanee-logo.svg`, `.ai`, `.pdf` | `public/images/brand/` |

`<product-slug>` is the product's `slug` in `supabase/seed/catalog.json`
(e.g. `photo-mug`), so check it there first.

## Rules

- Highest resolution you have, original file, no watermarks, no filters. We resize and compress.
- Real photos of **our own work** only. Never stock photos presented as ours.
- **Real photos always win.** As soon as `public/products/<slug>/1.webp` exists, the site ignores
  `sample-*.webp` for that product. Sample images are shown with a small "Sample image" label
  (English / Sinhala), are never used in the product gallery, and are never put in structured data
  or social previews.
- Add alt text ideas in the filename or a note (e.g. `1.jpg` = "front of a printed mug") so we can
  write English + Sinhala alt text.
- Do not drop customer artwork or anything containing people's personal details.

## Processing targets

- Product photos: WebP, square or 4:3, ≥ 1200 px on the long edge, under 200 KB each.
- Shop photos: `public/brand/shop.webp` (1600×1200) and `public/brand/shop-wide.webp` (2400×800), each under 300 KB.
- After adding files under `public/products/` or `public/brand/`, the manifest
  (`src/generated/assets-manifest.json`) is rebuilt automatically before `npm run dev` and
  `npm run build` (`scripts/build-assets-manifest.mjs`); commit the updated manifest.

Once processed, delete the originals from this folder (or keep them out of git — large
binaries belong in cloud storage, not the repo).
