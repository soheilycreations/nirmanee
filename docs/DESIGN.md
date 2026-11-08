# Design system proposal

Goal: a **premium-but-warm print studio** — the confidence of a professional press, the warmth of a
family shop in Kalutara that hand-checks every proof. Must work equally well in **English and
Sinhala**, on cheap Android phones over mobile data, and for staff on a desktop kanban.

Brand anchors from the existing logo: royal blue `#0070C0`, indigo `#2E3192`, black/grey bar.

---

## Direction A — "Ink & Paper" ✅ recommended

**Idea:** the product is printed paper. Warm off-white "paper" surfaces, deep warm-navy "ink" text,
the logo blue as the single strong action colour, and a marigold accent borrowed from Sri Lankan
festivity (Vesak lanterns, gift wrap) for warmth and highlights.

### Colour

| Role | Token | Hex | Use |
|---|---|---|---|
| Page background | `paper-100` / `bg` | `#FAF6EF` | body |
| Surface | `paper-50` / `surface` | `#FFFDF9` | cards, inputs, sheets |
| Sunken band | `paper-200` / `sunken` | `#F2EBDF` | alternating sections, chat background |
| Line | `paper-300` / `line` | `#E5DBCB` | borders, dividers |
| Text | `ink-900` / `fg` | `#141A2E` | headings, body (16:1 on bg) |
| Muted text | `ink-500` / `fg-muted` | `#646A80` | captions (5.0:1 on bg) |
| Primary | `brand-500` / `primary` | `#0070C0` | buttons, links, focus (5.1:1 on white) |
| Primary hover | `brand-600` | `#005C9F` | |
| Depth | `royal-500` | `#2E3192` | dark sections, footer, staff sidebar |
| Accent | `accent-500` | `#E8A33D` | badges, highlights, illustrations (bg only) |
| Accent text | `accent-700` | `#9E6514` | accent text on light bg |
| Success / Warning / Danger | `success-600` / `warning-600` / `danger-600` | `#2F7D4F` / `#8F5A0B` / `#B42318` | with `*-50` tints |

Ratio guide: ~70 % paper, 20 % ink, 8 % brand blue, 2 % marigold. One primary button per view.

**Job status colours** (`status-*` tokens) give the kanban and status pills a consistent language:
quote = violet, awaiting payment = amber-brown, new = brand blue, artwork = royal, proof sent =
marigold (needs customer), changes = burnt orange, approved = green, printing/QC = teal,
ready/dispatched = deep green, delivered = slate, cancelled = grey.

### Typography

| Role | Latin | Sinhala | Token |
|---|---|---|---|
| Display / headings | **Fraunces** (soft optical-size serif, SOFT axis ↑ for warmth) | **Abhaya Libre** (serif, designed for Sinhala) | `font-display`, `font-sinhala-display` |
| Body / UI | **Inter** | **Noto Sans Sinhala** | `font-sans`, `font-sinhala` |

- Stacks list Latin first and the Sinhala face second; browsers fall back **per glyph**, so mixed
  strings ("Photo Frame — ඡායාරූප රාමු") render correctly with no extra markup.
- Under `:lang(si)` headings switch to Abhaya Libre, line-height rises to **1.75** (body) / **1.35**
  (headings) for stacked vowel signs (ු ූ ්‍ර), and letter-spacing is reset to 0 (never track Sinhala).
- Scale (16 px base, ~1.25): body 16/1.6, small 14, caption 12 (Latin only; Sinhala min 13);
  display-sm 28, display-md 36, display-lg 48, display-xl 64 (desktop hero only).
- Weights: Fraunces 600 for headings, Inter 400/500/600. Avoid `font-black`/900 — reads as cheap.
- All four fonts self-hosted via `next/font` (Sinhala faces not preloaded; ~30 KB each subset).

### Spacing & layout

- 4 px base (Tailwind default `--spacing: 0.25rem`). Section padding: 64 px mobile / 96 px desktop.
- Content width 1200 px (`max-w-6xl`+), text measure ≤ 68 ch.
- Grid: 4 columns mobile, 8 tablet, 12 desktop; 16 px gutters mobile, 24 px desktop.
- Touch targets ≥ 44 px.

### Radius & elevation

| Token | Value | Use |
|---|---|---|
| `rounded-control` | 12 px | buttons, inputs, chips |
| `rounded-media` | 16 px | product images |
| `rounded-card` | 20 px | cards, panels |
| `rounded-sheet` | 28 px | modals, bottom sheets, hero media |
| `shadow-card` | soft warm 2-layer | resting cards |
| `shadow-lift` | | hover / dragged kanban card |
| `shadow-focus` | 3 px blue ring | focus |

Replace today's mix of `rounded-[2.5rem]`, `rounded-2xl`, `rounded-3xl`, heavy glows and blur orbs.

### Buttons

| Variant | Style |
|---|---|
| Primary | `bg-primary text-on-primary rounded-control h-12 px-6 font-semibold`, hover `bg-primary-hover`, active translate-y-px |
| Secondary | `bg-surface text-fg border border-line`, hover `border-ink-300` |
| Ghost | text `brand-600`, hover `bg-brand-50` |
| Accent (rare: "Upload photos", promo) | `bg-accent-500 text-ink-900` |
| Destructive | `bg-danger-600 text-white` |
| Sizes | sm 36 px, md 44 px, lg 52 px; icon-only square with `aria-label` |

Loading state keeps width (spinner replaces label). Disabled = `paper-300` bg, `ink-300` text.

### Cards

- **Product card:** `bg-surface rounded-card shadow-card p-3`; image `rounded-media aspect-square`
  on `paper-200` background (photos of real products, not cut-outs on blue blobs); name (Fraunces
  18), "from Rs. 1,450" (Inter 600), small "Custom design included" line with icon. Hover:
  `shadow-lift`, image scale 1.03.
- **Job card (kanban):** surface, 4 px left border in the status colour, job number mono-ish
  (`tabular-nums`), customer, due date (red when overdue), designer avatar, revision dots ●●○.
- **Proof card (chat):** large image, "Proof v2" chip, two full-width buttons: **Approve** (primary)
  and **Request changes** (secondary), plus "1 of 2 free revisions used".
- **Chat bubbles:** customer = `brand-50` right; staff = `surface` left with name; system =
  centred caption chip on `sunken`; internal notes = dashed `accent-300` border + "Staff only".

### Photography & imagery

- **Real work, real light:** photograph actual Nirmanee products on warm neutral backdrops (paper,
  linen, light wood) with soft window light; consistent 1:1 for products, 4:5 for lifestyle.
- Show **hands and process** — the laser cutting wood, a designer at the screen, a mug coming off
  the press, packing for courier. Builds trust in "a real studio makes this for you".
- Lifestyle shots in Sri Lankan homes/offices (a framed wedding photo on a wall, a mug on a desk).
- No AI-generated product renders, no stock photos of products we don't make, no WhatsApp flyers as
  product images (crop the product out or reshoot).
- Files: descriptive kebab-case names (`magic-mug-white-11oz-front.jpg`), WebP/AVIF via
  `next/image`, max 2400 px source.
- Illustrations: simple line icons (lucide, 1.5 stroke) in ink; marigold used sparingly as fill.

### Voice

Warm, clear, reassuring: "We'll send you a proof before anything is printed." Short sentences,
Sinhala written natively (not machine-translated).

---

## Direction B — "Studio Workshop"

**Idea:** the maker's bench. Kraft paper, charcoal, and a terracotta signal colour — tactile,
artisanal, closer to laser-engraved wood and craft gifts. The logo blue is reduced to the logo
itself.

| Role | Hex |
|---|---|
| Background (kraft-light) | `#F4EDE3` |
| Surface | `#FFFFFF` |
| Text (charcoal) | `#1E1E1C` |
| Muted | `#6B655C` |
| Primary (terracotta) | `#B5482A` (5.35:1 on white) |
| Secondary (deep olive) | `#3F4A2E` |
| Accent (logo blue, small doses) | `#0070C0` |

- **Typography:** display **Bricolage Grotesque** (characterful grotesk) + body **DM Sans**;
  Sinhala **Noto Sans Sinhala** for both (headings 700) — a single Sinhala family, simpler but less
  expressive.
- **Shape:** smaller radius (8 px controls / 12 px cards), 1 px charcoal borders instead of
  shadows, subtle paper-grain texture on hero bands.
- **Photography:** top-down flat-lays on kraft/wood, visible tools, high texture.
- **Pros:** very distinctive, great for wood/laser/gift products. **Cons:** drifts away from the
  existing blue brand equity (signage, WhatsApp flyers, logo), terracotta clashes with the logo,
  feels less "precise/professional" for banners, plan printing and corporate clients.

---

## Recommendation

**Direction A — Ink & Paper.** It keeps the logo's blue as the hero colour (customers already know
it from the shop and WhatsApp), adds warmth through paper neutrals and marigold rather than
replacing the brand, and the Fraunces/Abhaya Libre + Inter/Noto Sans Sinhala pairing gives proper
bilingual typography with a serif display in both scripts.

### Implementation status

- ✅ Tokens for Direction A implemented in `src/app/globals.css` (`@theme`) — Tailwind v4 has no
  `tailwind.config.*`; the `@theme` block is the config. Utilities like `bg-paper-100`,
  `text-ink-900`, `bg-primary`, `rounded-card`, `shadow-card`, `font-display` are available.
- ✅ Fonts loaded via `next/font` in `src/app/layout.tsx`; body uses `font-sans` (Inter +
  Noto Sans Sinhala). Sinhala line-height and heading rules under `:lang(si)`.
- ✅ Legacy `sky-*`/`slate-*` values retained and body colours unchanged, so existing pages look the
  same until the P1 redesign.
- ⏭ Next (P1): build `components/ui` primitives (Button, Card, Input, Badge, StatusPill) on these
  tokens, then redesign pages. Remove legacy colours when no page uses them.
