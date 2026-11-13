import Image from "next/image";
import { CategoryIcon } from "./CategoryIcon";
import { cn } from "@/lib/cn";
import { resolveImageSrc } from "@/lib/images";
import type { ProductImage } from "@/features/catalog/types";

const TINTS: Record<string, string> = {
  "mug-printing": "from-brand-50 to-paper-200",
  "photo-framing": "from-accent-50 to-paper-200",
  "laser-cutting": "from-paper-200 to-accent-100",
  "wood-engraving": "from-accent-100 to-paper-300",
  "crystal-printing": "from-brand-50 to-royal-100",
  banners: "from-brand-100 to-paper-200",
  "digital-printing": "from-paper-100 to-brand-50",
  "plan-printing": "from-paper-200 to-paper-100",
  "photo-enlargement": "from-royal-100 to-paper-200",
  "t-shirt-printing": "from-paper-200 to-brand-50",
  "edible-print": "from-danger-50 to-accent-50",
  "custom-souvenirs": "from-accent-50 to-brand-50",
};


/**
 * Product image, or a branded placeholder until real photography is supplied.
 */
export function ProductVisual({
  image,
  alt,
  categorySlug,
  placeholderLabel,
  sizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw",
  priority = false,
  sampleLabel,
  className,
}: {
  image: ProductImage | undefined;
  alt: string;
  categorySlug: string;
  placeholderLabel: string;
  sizes?: string;
  priority?: boolean;
  /** Set when `image` is an AI sample, not a real photo: shows a small label over it. */
  sampleLabel?: string;
  className?: string;
}) {
  if (image) {
    return (
      <div className={cn("relative overflow-hidden bg-paper-200", className)}>
        <Image src={resolveImageSrc(image.key)} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
        {sampleLabel && (
          <span className="absolute bottom-2 left-2 rounded-full bg-ink-900/75 px-2.5 py-0.5 text-[11px] font-medium text-white">{sampleLabel}</span>
        )}
      </div>
    );
  }
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center gap-2 overflow-hidden bg-gradient-to-br text-ink-500",
        TINTS[categorySlug] ?? "from-paper-200 to-paper-100",
        className,
      )}
      role="img"
      aria-label={alt}
    >
      <CategoryIcon slug={categorySlug} className="size-10 text-ink-700/70 sm:size-12" />
      <span className="rounded-full bg-surface/70 px-2.5 py-0.5 text-[11px] font-medium text-ink-500">{placeholderLabel}</span>
    </div>
  );
}
