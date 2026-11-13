// Naming rule for product photos in public/products/<slug>/ (shared by the manifest script and its tests).
//   1.webp, 2.webp …       real photos (gallery)
//   sample-1.webp …        AI sample images (labelled, only shown when there is no real photo, never in the gallery)
export const SAMPLE_FILE = /^sample-\d+\./i;

export function isSampleFile(name) {
  return SAMPLE_FILE.test(name);
}

/** Split a folder's image file names into real photos and AI samples. */
export function splitProductFiles(names) {
  return { real: names.filter((n) => !isSampleFile(n)), sample: names.filter(isSampleFile) };
}

/** The sample to show for a product: only when it has no real photo. */
export function pickSample(samples, hasRealPhoto) {
  return hasRealPhoto ? null : (samples?.[0] ?? null);
}
