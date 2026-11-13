import type { Category, Product } from "./types";

/**
 * Hand-picked "goes well with" categories (nearest first). Anything not listed
 * here is appended afterwards in catalogue order, so a row can always be filled.
 */
const RELATED: Record<string, string[]> = {
  "mug-printing": ["custom-souvenirs", "photo-framing", "t-shirt-printing"],
  "photo-framing": ["crystal-printing", "wood-engraving", "photo-enlargement", "mug-printing"],
  "laser-cutting": ["wood-engraving", "custom-souvenirs", "photo-framing"],
  "wood-engraving": ["laser-cutting", "photo-framing", "crystal-printing"],
  "crystal-printing": ["photo-framing", "wood-engraving", "photo-enlargement"],
  banners: ["digital-printing", "plan-printing", "photo-enlargement"],
  "digital-printing": ["banners", "plan-printing", "custom-souvenirs"],
  "plan-printing": ["digital-printing", "banners", "photo-enlargement"],
  "photo-enlargement": ["photo-framing", "banners", "crystal-printing"],
  "t-shirt-printing": ["mug-printing", "custom-souvenirs", "banners"],
  "edible-print": ["custom-souvenirs", "mug-printing", "photo-framing"],
  "custom-souvenirs": ["mug-printing", "laser-cutting", "t-shirt-printing"],
};

/** Other categories that have at least one product, most related first. */
export function relatedCategories(current: string, categories: Category[], products: Product[]): Category[] {
  const hasProducts = (slug: string) => products.some((p) => p.categorySlug === slug);
  const preferred = RELATED[current] ?? [];
  const rank = (slug: string) => {
    const i = preferred.indexOf(slug);
    return i === -1 ? preferred.length : i;
  };
  return categories
    .filter((c) => c.slug !== current && hasProducts(c.slug))
    .sort((a, b) => rank(a.slug) - rank(b.slug) || a.sortOrder - b.sortOrder);
}

/** Same-category products first, then products from related categories (featured first), up to `limit`. */
export function relatedProducts(product: Product, categories: Category[], products: Product[], limit = 4): { items: Product[]; sameCategoryOnly: boolean } {
  const same = products.filter((p) => p.categorySlug === product.categorySlug && p.slug !== product.slug);
  const items = same.slice(0, limit);
  if (items.length >= limit) return { items, sameCategoryOnly: true };
  for (const c of relatedCategories(product.categorySlug, categories, products)) {
    const inCat = products.filter((p) => p.categorySlug === c.slug).sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured) || a.sortOrder - b.sortOrder);
    for (const p of inCat) {
      if (items.length >= limit) break;
      items.push(p);
    }
    if (items.length >= limit) break;
  }
  return { items, sameCategoryOnly: items.length === same.length };
}
