import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { CategoryIcon } from "@/components/shop/CategoryIcon";
import { pick, type Product } from "@/features/catalog/types";
import { heroCollage, productSampleFor } from "@/lib/assets";
import { resolveImageSrc } from "@/lib/images";
import { cn } from "@/lib/cn";

const POSITIONS = [
  "left-0 top-8 w-[46%] -rotate-3",
  "right-0 top-0 w-[44%] rotate-3",
  "bottom-0 left-[6%] w-[42%] rotate-2",
  "bottom-4 right-[4%] w-[46%] -rotate-2",
];

interface Tile {
  src: string;
  label: string;
}

/**
 * Right-hand hero collage (desktop). Uses photos from public/gallery/ (first
 * four by file name) as soon as they exist; until then it shows the products'
 * sample images, labelled as samples. Never stock photos.
 */
export async function HeroCollage({ products }: { products: Product[] }) {
  const t = await getTranslations("home");
  const tc = await getTranslations("common");
  const locale = await getLocale();

  const gallery = heroCollage();
  const usingSamples = gallery.length === 0;
  const tiles: Tile[] = usingSamples
    ? products
        .map((p) => {
          const src = p.images[0] ? resolveImageSrc(p.images[0].key) : productSampleFor(p.slug, false);
          return src ? { src, label: pick(p.name, locale) } : null;
        })
        .filter((x): x is Tile => x !== null)
        .slice(0, 4)
    : gallery.slice(0, 4).map((src) => ({ src, label: "" }));

  const filler = ["photo-framing", "mug-printing", "wood-engraving", "crystal-printing"];
  const slots = Array.from({ length: 4 }, (_, i) => tiles[i] ?? null);

  return (
    <figure>
      <div className="relative aspect-[5/4] w-full" role="img" aria-label={t("collageAlt")}>
        {slots.map((tile, i) => (
          <div key={i} className={cn("absolute aspect-square overflow-hidden rounded-sheet border-4 border-surface bg-paper-200 shadow-lift", POSITIONS[i])}>
            {tile ? (
              <Image src={tile.src} alt="" fill sizes="(max-width: 1024px) 0px, 20vw" priority={i < 2} className="object-cover" />
            ) : (
              <div className="flex size-full items-center justify-center bg-gradient-to-br from-brand-50 to-paper-200">
                <CategoryIcon slug={filler[i]} className="size-14 text-ink-700/50" />
              </div>
            )}
          </div>
        ))}
      </div>
      {usingSamples && <figcaption className="mt-2 text-center text-xs text-ink-500">{tc("sampleImage")}</figcaption>}
    </figure>
  );
}
