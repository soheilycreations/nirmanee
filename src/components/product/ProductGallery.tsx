"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";

/** Main photo + thumbnails (public/products/<slug>/1.webp, 2.webp, … then DB images). */
export function ProductGallery({ images }: { images: { src: string; alt: string }[] }) {
  const t = useTranslations("product");
  const [active, setActive] = useState(0);
  const current = images[Math.min(active, images.length - 1)];
  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-sheet bg-paper-200 sm:aspect-square">
        <Image src={current.src} alt={current.alt} fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
        {images.length > 1 && (
          <span className="absolute bottom-3 right-3 rounded-full bg-ink-900/70 px-2.5 py-0.5 text-xs font-medium text-white">
            {t("photoOf", { n: active + 1, total: images.length })}
          </span>
        )}
      </div>
      {images.length > 1 && (
        <ul className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
          {images.map((img, i) => (
            <li key={img.src} className="shrink-0">
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={t("showPhoto", { n: i + 1 })}
                aria-current={i === active ? "true" : undefined}
                className={cn("relative block size-16 overflow-hidden rounded-control border-2", i === active ? "border-primary" : "border-transparent hover:border-line")}
              >
                <Image src={img.src} alt="" fill sizes="64px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
