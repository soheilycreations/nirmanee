import "server-only";
import { cache } from "react";
import seed from "../../../supabase/seed/catalog.json";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fromPrice, type Catalog, type Category, type OptionConfig, type OptionType, type Product, type ProductOption } from "./types";
import type { ModifierType, PricingMode } from "@/lib/pricing";

const num = (v: unknown): number | null => (v === null || v === undefined ? null : Number(v));

// ---------------------------------------------------------------------------
// Supabase source
// ---------------------------------------------------------------------------
interface DbValue {
  id: string; value: string; label_en: string; label_si: string | null; modifier_type: ModifierType;
  price_modifier: number | string; width_in: number | string | null; height_in: number | string | null;
  swatch_hex: string | null; is_default: boolean; is_active: boolean; sort_order: number;
}
interface DbOption {
  id: string; type: OptionType; code: string; label_en: string; label_si: string | null; is_required: boolean;
  config: OptionConfig; sort_order: number; product_option_values: DbValue[];
}
interface DbProduct {
  id: string; slug: string; name_en: string; name_si: string | null;
  short_description_en: string | null; short_description_si: string | null;
  description_en: string | null; description_si: string | null;
  order_type: "fixed" | "quote"; pricing_mode: PricingMode;
  base_price: number | string | null; price_per_sqft: number | string | null; min_sqft: number | string | null;
  production_days: number; express_days: number | null; express_surcharge_percent: number; design_fee: number | string;
  allow_customer_artwork: boolean; allow_design_service: boolean; requires_artwork: boolean;
  images: { key: string; alt_en?: string; alt_si?: string }[]; specs: { label_en: string; value_en: string }[];
  is_featured: boolean; sort_order: number;
  category: { id: string; slug: string };
  product_options: DbOption[];
  product_price_tiers: { min_quantity: number; discount_percent: number | string }[];
  product_templates: { id: string; name_en: string; name_si: string | null; preview_key: string; is_active: boolean; sort_order: number }[];
}

const PRODUCT_SELECT = `
  id, slug, name_en, name_si, short_description_en, short_description_si, description_en, description_si,
  order_type, pricing_mode, base_price, price_per_sqft, min_sqft, production_days, express_days,
  express_surcharge_percent, design_fee, allow_customer_artwork, allow_design_service, requires_artwork,
  images, specs, is_featured, sort_order,
  category:categories!inner(id, slug),
  product_options(id, type, code, label_en, label_si, is_required, config, sort_order,
    product_option_values(id, value, label_en, label_si, modifier_type, price_modifier, width_in, height_in, swatch_hex, is_default, is_active, sort_order)),
  product_price_tiers(min_quantity, discount_percent),
  product_templates(id, name_en, name_si, preview_key, is_active, sort_order)
`;

function mapDbProduct(p: DbProduct): Product {
  const options: ProductOption[] = [...p.product_options]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((o) => ({
      id: o.id,
      code: o.code,
      type: o.type,
      label: { en: o.label_en, si: o.label_si },
      isRequired: o.is_required,
      config: o.config ?? {},
      values: [...o.product_option_values]
        .filter((v) => v.is_active)
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((v) => ({
          id: v.id,
          value: v.value,
          label: { en: v.label_en, si: v.label_si },
          modifierType: v.modifier_type,
          priceModifier: Number(v.price_modifier),
          widthIn: num(v.width_in),
          heightIn: num(v.height_in),
          swatchHex: v.swatch_hex,
          isDefault: v.is_default,
        })),
    }));
  return {
    id: p.id,
    slug: p.slug,
    categoryId: p.category.id,
    categorySlug: p.category.slug,
    name: { en: p.name_en, si: p.name_si },
    shortDescription: { en: p.short_description_en ?? "", si: p.short_description_si },
    description: { en: p.description_en ?? "", si: p.description_si },
    orderType: p.order_type,
    pricingMode: p.pricing_mode,
    basePrice: num(p.base_price),
    pricePerSqft: num(p.price_per_sqft),
    minSqft: num(p.min_sqft),
    productionDays: p.production_days,
    expressDays: p.express_days,
    expressSurchargePercent: p.express_surcharge_percent,
    designFee: Number(p.design_fee),
    allowCustomerArtwork: p.allow_customer_artwork,
    allowDesignService: p.allow_design_service,
    requiresArtwork: p.requires_artwork,
    images: (p.images ?? []).map((i) => ({ key: i.key, alt: { en: i.alt_en ?? p.name_en, si: i.alt_si ?? null } })),
    specs: (p.specs ?? []).map((s) => ({ label: s.label_en, value: s.value_en })),
    isFeatured: p.is_featured,
    sortOrder: p.sort_order,
    options,
    tiers: p.product_price_tiers.map((t) => ({ minQuantity: t.min_quantity, discountPercent: Number(t.discount_percent) })),
    templates: [...p.product_templates]
      .filter((t) => t.is_active)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((t) => ({ id: t.id, name: { en: t.name_en, si: t.name_si }, previewKey: t.preview_key })),
  };
}

async function loadFromSupabase(): Promise<Catalog | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const [cats, prods] = await Promise.all([
    supabase.from("categories").select("id, slug, name_en, name_si, description_en, description_si, sort_order").order("sort_order"),
    supabase.from("products").select(PRODUCT_SELECT).order("sort_order"),
  ]);
  if (cats.error) throw new Error(`categories query failed: ${cats.error.message}`);
  if (prods.error) throw new Error(`products query failed: ${prods.error.message}`);
  const categories: Category[] = cats.data.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: { en: c.name_en, si: c.name_si },
    description: { en: c.description_en ?? "", si: c.description_si },
    sortOrder: c.sort_order,
  }));
  const products = (prods.data as unknown as DbProduct[]).map(mapDbProduct);
  return { categories, products, source: "supabase" };
}

// ---------------------------------------------------------------------------
// Seed source (demo mode — no Supabase env). Same shapes, deterministic ids.
// ---------------------------------------------------------------------------
interface SeedValue {
  value: string; label_en: string; label_si?: string; modifier_type?: ModifierType; price_modifier?: number;
  width_in?: number; height_in?: number; swatch_hex?: string; is_default?: boolean;
}
interface SeedOption {
  code: string; type: OptionType; label_en: string; label_si?: string; is_required?: boolean; config?: OptionConfig; values?: SeedValue[];
}
interface SeedProduct {
  slug: string; category: string; featured?: boolean; sort_order?: number; name_en: string; name_si?: string;
  short_en?: string; short_si?: string; description_en?: string; description_si?: string;
  order_type: "fixed" | "quote"; pricing_mode: PricingMode; base_price?: number; price_per_sqft?: number; min_sqft?: number;
  production_days: number; express_days?: number | null; express_surcharge_percent?: number; design_fee?: number;
  allow_customer_artwork?: boolean; allow_design_service?: boolean; requires_artwork?: boolean;
  images?: { key: string; alt_en?: string; alt_si?: string }[];
  specs?: [string, string][]; tiers?: [number, number][]; options?: SeedOption[];
  templates?: { name_en: string; name_si?: string; preview_key: string }[];
}

function loadFromSeed(): Catalog {
  const data = seed as unknown as {
    categories: { slug: string; name_en: string; name_si?: string; description_en?: string; description_si?: string; sort_order: number }[];
    products: SeedProduct[];
  };
  const categories: Category[] = data.categories.map((c) => ({
    id: `seed-cat-${c.slug}`,
    slug: c.slug,
    name: { en: c.name_en, si: c.name_si ?? null },
    description: { en: c.description_en ?? "", si: c.description_si ?? null },
    sortOrder: c.sort_order,
  }));
  const products: Product[] = data.products.map((p) => ({
    id: `seed-${p.slug}`,
    slug: p.slug,
    categoryId: `seed-cat-${p.category}`,
    categorySlug: p.category,
    name: { en: p.name_en, si: p.name_si ?? null },
    shortDescription: { en: p.short_en ?? "", si: p.short_si ?? null },
    description: { en: p.description_en ?? "", si: p.description_si ?? null },
    orderType: p.order_type,
    pricingMode: p.pricing_mode,
    basePrice: p.base_price ?? null,
    pricePerSqft: p.price_per_sqft ?? null,
    minSqft: p.min_sqft ?? null,
    productionDays: p.production_days,
    expressDays: p.express_days ?? null,
    expressSurchargePercent: p.express_surcharge_percent ?? 50,
    designFee: p.design_fee ?? 0,
    allowCustomerArtwork: p.allow_customer_artwork ?? true,
    allowDesignService: p.allow_design_service ?? true,
    requiresArtwork: p.requires_artwork ?? true,
    images: (p.images ?? []).map((i) => ({ key: i.key, alt: { en: i.alt_en ?? p.name_en, si: i.alt_si ?? null } })),
    specs: (p.specs ?? []).map(([label, value]) => ({ label, value })),
    isFeatured: Boolean(p.featured),
    sortOrder: p.sort_order ?? 0,
    tiers: (p.tiers ?? []).map(([minQuantity, discountPercent]) => ({ minQuantity, discountPercent })),
    options: (p.options ?? []).map((o) => ({
      id: `seed-${p.slug}-${o.code}`,
      code: o.code,
      type: o.type,
      label: { en: o.label_en, si: o.label_si ?? null },
      isRequired: o.is_required ?? true,
      config: o.config ?? {},
      values: (o.values ?? []).map((v) => ({
        id: `seed-${p.slug}-${o.code}-${v.value}`,
        value: v.value,
        label: { en: v.label_en, si: v.label_si ?? null },
        modifierType: v.modifier_type ?? "flat",
        priceModifier: v.price_modifier ?? 0,
        widthIn: v.width_in ?? null,
        heightIn: v.height_in ?? null,
        swatchHex: v.swatch_hex ?? null,
        isDefault: Boolean(v.is_default),
      })),
    })),
    templates: (p.templates ?? []).map((t, i) => ({
      id: `seed-${p.slug}-tpl-${i + 1}`,
      name: { en: t.name_en, si: t.name_si ?? null },
      previewKey: t.preview_key,
    })),
  }));
  return { categories, products, source: "seed" };
}

// ---------------------------------------------------------------------------
// Public API (memoised per request)
// ---------------------------------------------------------------------------
export const getCatalog = cache(async (): Promise<Catalog> => {
  return (await loadFromSupabase()) ?? loadFromSeed();
});

export async function getCategories(): Promise<Category[]> {
  return (await getCatalog()).categories;
}

export async function getCategory(slug: string): Promise<Category | null> {
  return (await getCategories()).find((c) => c.slug === slug) ?? null;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return (await getCatalog()).products.find((p) => p.slug === slug) ?? null;
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const { products } = await getCatalog();
  const featured = products.filter((p) => p.isFeatured);
  return (featured.length > 0 ? featured : products).slice(0, limit);
}

export type ShopSort = "featured" | "price-asc" | "price-desc" | "name";

export async function searchProducts(opts: { category?: string; q?: string; sort?: ShopSort; locale: string }): Promise<Product[]> {
  const { products, categories } = await getCatalog();
  const order = new Map(categories.map((c) => [c.slug, c.sortOrder]));
  let list = products;
  if (opts.category) list = list.filter((p) => p.categorySlug === opts.category);
  const q = opts.q?.trim().toLowerCase();
  if (q) {
    list = list.filter((p) =>
      [p.name.en, p.name.si ?? "", p.shortDescription.en, p.shortDescription.si ?? "", p.categorySlug]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }
  // Per-sq-ft products sort by their minimum billable order, not the rate.
  const price = (p: Product) => {
    const from = fromPrice(p);
    if (from === null) return Number.MAX_SAFE_INTEGER;
    return p.pricingMode === "per_sqft" ? from * Math.max(p.minSqft ?? 1, 1) : from;
  };
  const sorted = [...list];
  switch (opts.sort) {
    case "price-asc":
      sorted.sort((a, b) => price(a) - price(b));
      break;
    case "price-desc":
      sorted.sort((a, b) => price(b) - price(a));
      break;
    case "name":
      sorted.sort((a, b) => (opts.locale === "si" && a.name.si && b.name.si ? a.name.si.localeCompare(b.name.si) : a.name.en.localeCompare(b.name.en)));
      break;
    default:
      sorted.sort(
        (a, b) =>
          Number(b.isFeatured) - Number(a.isFeatured) ||
          (order.get(a.categorySlug) ?? 0) - (order.get(b.categorySlug) ?? 0) ||
          a.sortOrder - b.sortOrder,
      );
  }
  return sorted;
}
