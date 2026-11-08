import manifest from "@/generated/assets-manifest.json";

interface Manifest {
  products: Record<string, string[]>;
  gallery: { src: string; alt: string }[];
  brand: { heroCollage: string[]; shopPhoto: string | null };
}

const data = manifest as Manifest;

/** Photos in public/products/<slug>/ (1.webp, 2.webp, …), in natural order. */
export function productImagesFor(slug: string): string[] {
  return data.products[slug] ?? [];
}

/** Recent-work photos in public/gallery/. Empty → gallery sections are hidden. */
export function galleryImages(): { src: string; alt: string }[] {
  return data.gallery;
}

export function heroCollage(): string[] {
  return data.brand.heroCollage;
}

/** public/brand/shop.webp|jpg if present. */
export function shopPhoto(): string | null {
  return data.brand.shopPhoto;
}
