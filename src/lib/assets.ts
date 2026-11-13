import manifest from "@/generated/assets-manifest.json";

interface Manifest {
  products: Record<string, string[]>;
  samples?: Record<string, string[]>;
  gallery: { src: string; alt: string }[];
  brand: { heroCollage: string[]; shopPhoto: string | null };
}

const data = manifest as Manifest;

/** Photos in public/products/<slug>/ (1.webp, 2.webp, …), in natural order. */
export function productImagesFor(slug: string): string[] {
  return data.products[slug] ?? [];
}

/**
 * AI sample image (public/products/<slug>/sample-1.webp). Used only when the product has no real photo
 * (`hasRealPhoto` false) and must be shown with a "Sample image" label. Never part of a gallery.
 */
export function productSampleFor(slug: string, hasRealPhoto: boolean): string | null {
  return hasRealPhoto ? null : (data.samples?.[slug]?.[0] ?? null);
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
