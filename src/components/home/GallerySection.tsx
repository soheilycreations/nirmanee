import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { galleryImages } from "@/lib/assets";

/** Recent work from public/gallery/. Hidden when the folder is empty. */
export async function GallerySection({ limit = 8 }: { limit?: number }) {
  const images = galleryImages().slice(0, limit);
  if (images.length === 0) return null;
  const t = await getTranslations("home");
  return (
    <section aria-labelledby="gallery-heading" className="mx-auto max-w-6xl px-4 py-12">
      <h2 id="gallery-heading" className="text-2xl sm:text-display-sm">{t("galleryTitle")}</h2>
      <p className="mt-1 text-ink-700">{t("gallerySubtitle")}</p>
      <ul className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 lg:gap-3">
        {images.map((img) => (
          <li key={img.src} className="relative aspect-square overflow-hidden rounded-media bg-paper-200">
            <Image src={img.src} alt={img.alt} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" className="object-cover" />
          </li>
        ))}
      </ul>
    </section>
  );
}
