# Content & details needed from the owner

Everything below is optional for the site to work, but each item switches on a
section that is **hidden until provided** (no placeholder data is ever shown).
After adding files: commit, push, redeploy (the asset manifest is rebuilt on
every build).

## 1. Photos

General rules: **WebP** preferred (JPG/PNG also fine), sRGB, real photos of your
own work (no stock), plain or lightly styled background, good daylight, no text
or prices baked into the image. Compress before upload (aim < 300 KB each, e.g.
squoosh.app, quality ~80).

| What | Where (file names) | Size / format | Notes |
|---|---|---|---|
| Product photos | `public/products/<slug>/1.webp`, `2.webp`, `3.webp` … | **1600 × 1600 px**, square | `1.webp` is the main photo (cards, shop, Google). Add 2–5 per product: front, angle, detail, in-use. Slugs listed below. |
| Recent work gallery | `public/gallery/<yyyy-mm>-<short-description>.webp` e.g. `2026-11-wedding-led-frame.webp` | **1200 × 1200 px**, square | 6–12 photos. The file name becomes the alt text ("wedding led frame"). The **first three by name** also fill the hero collage on desktop. |
| Shop photo | `public/brand/shop.webp` | **1600 × 1200 px** (4:3) | Front of the Kalutara shop or the counter. Shown in the "Visit our studio" section and on Contact. |
| Logo (vector) | `public/images/brand/nirmanee-logo.svg` (+ keep a PNG) | SVG, plus 512 × 512 PNG with transparent background | Replaces the current JPEG in header, footer, favicon and Google results. |
| Social share image (optional) | tell me and I'll wire it | 1200 × 630 px | Otherwise the generated text image is used. |

Product slugs (folder names under `public/products/`):

```
photo-mug-white-11oz          magic-colour-changing-mug     mdf-sublimation-clock
photo-frame-with-light        magnet-pine-wood-frame        hexagon-glass-photo-frame
anniversary-glass-clock-frame custom-love-wooden-frame      laser-cut-name-plate
black-board-frame-engraving   wood-slice-engraving          crystal-photo-block
flex-banner                   business-cards                plan-printing
photo-enlargement             custom-t-shirt                edible-cake-print
photo-key-tag
```

## 2. Business details → `src/config/site-settings.ts`

| Setting | Example | Unlocks |
|---|---|---|
| `streetAddress` (EN + SI) | `{ en: "No. 12, Galle Road, Kalutara", si: "අංක 12, ගාලු පාර, කළුතර" }` | Address on home trust section + Contact page |
| `mapsLink` | `https://maps.app.goo.gl/…` (Google Maps → Share → Copy link) | "Get directions" goes to your exact listing |
| `mapEmbedUrl` | Google Maps → Share → **Embed a map** → copy only the `src="…"` URL | Embedded map |
| `googleRating` | `{ rating: 4.8, reviewCount: 57, url: "https://g.page/r/…/review" }` | Google rating block (update the numbers now and then) |
| `servingSince` | `2005` | "Serving Kalutara since 2005" |
| `email` | `orders@nirmanee.lk` | Email on Contact + footer |
| `socials` | Facebook / Instagram / TikTok / YouTube URLs | Social links in footer |
| `legalDraft` | set to `false` after review | Removes the "Draft" notice on policy pages |

## 3. Texts to review

| File | What |
|---|---|
| `src/content/legal.ts` | Privacy policy, Terms of service, Refund & reprint policy — **EN + SI drafts**. Please check: cancellation fee (Rs 500 artwork preparation), file retention (12 months), refund time (7–14 working days), 48-hour claim window. A lawyer's look is recommended. |
| `src/content/faq.ts` | 9 FAQ answers, EN + SI. |
| `messages/si.json` | All Sinhala UI text. |
| `supabase/seed/catalog.json` | Product names/descriptions (EN + SI). |

## 4. Prices & settings to confirm (placeholders today)

| Item | Current placeholder | Where to change |
|---|---|---|
| All 19 product prices, option surcharges, bulk tiers | see `supabase/seed/catalog.json` | Supabase table editor: `products`, `product_option_values`, `product_price_tiers` |
| Banner eyelets | **Rs 20 per running foot** of perimeter | `product_option_values` (flex-banner → finish → eyelets) |
| Banner rate / minimum | Rs 90 / sq ft, minimum 6 sq ft | `products` (flex-banner) |
| Delivery zones | Kalutara Rs 350 · Western Rs 450 · Rest Rs 600 | `delivery_zones` |
| Extra revision fee | Rs 500 | `app_settings.revision_fee_lkr` |
| Hero promise "Ready in 24–48h" | shown on home | `messages/en.json` → `home.heroPromise` (+ si) |
