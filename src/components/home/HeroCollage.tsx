import Image from "next/image";
import { CategoryIcon } from "@/components/shop/CategoryIcon";
import { heroCollage } from "@/lib/assets";

const PLACEHOLDER_TILES = [
  { slug: "photo-framing", className: "from-accent-50 to-paper-200" },
  { slug: "mug-printing", className: "from-brand-50 to-paper-200" },
  { slug: "wood-engraving", className: "from-accent-100 to-paper-300" },
];

/**
 * Right-hand hero image slot: up to 3 photos from public/gallery/ (first three
 * by file name). Until photos exist, neutral illustrated tiles are shown —
 * never stock photos.
 */
export function HeroCollage({ alt }: { alt: string }) {
  const photos = heroCollage();
  const positions = [
    "left-0 top-6 w-[58%] -rotate-3",
    "right-0 top-0 w-[48%] rotate-3",
    "bottom-0 left-[22%] w-[52%] rotate-1",
  ];
  return (
    <div className="relative aspect-[5/4] w-full" role="img" aria-label={alt}>
      {(photos.length > 0 ? photos : PLACEHOLDER_TILES.map((t) => t.slug)).slice(0, 3).map((item, i) => (
        <div key={item} className={`absolute aspect-square overflow-hidden rounded-sheet border-4 border-surface shadow-lift ${positions[i]}`}>
          {photos.length > 0 ? (
            <Image src={item} alt="" fill sizes="(max-width: 1024px) 0px, 30vw" priority={i === 0} className="object-cover" />
          ) : (
            <div className={`flex size-full items-center justify-center bg-gradient-to-br ${PLACEHOLDER_TILES[i].className}`}>
              <CategoryIcon slug={item} className="size-16 text-ink-700/50" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
