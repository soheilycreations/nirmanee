import { computePrice, CUSTOM_SIZE_VALUE, type DesignMode, type ModifierType, type PricingMode, type PricingProduct } from "@/lib/pricing";

export type Locale = "en" | "si";

export interface Localized {
  en: string;
  si: string | null;
}

export function pick(text: Localized, locale: string): string {
  return locale === "si" && text.si ? text.si : text.en;
}

export interface Category {
  id: string;
  slug: string;
  name: Localized;
  description: Localized;
  sortOrder: number;
}

export type OptionType = "size" | "material" | "finish" | "color" | "text" | "photo_slots";

export interface OptionConfig {
  allow_custom?: boolean;
  unit?: "in" | "ft";
  min_width_in?: number;
  max_width_in?: number;
  min_height_in?: number;
  max_height_in?: number;
  max_length?: number;
  count?: number;
  print_width_in?: number;
  print_height_in?: number;
}

export interface OptionValue {
  id: string;
  value: string;
  label: Localized;
  modifierType: ModifierType;
  priceModifier: number;
  widthIn: number | null;
  heightIn: number | null;
  swatchHex: string | null;
  isDefault: boolean;
}

export interface ProductOption {
  id: string;
  code: string;
  type: OptionType;
  label: Localized;
  isRequired: boolean;
  config: OptionConfig;
  values: OptionValue[];
}

export interface ProductTemplate {
  id: string;
  name: Localized;
  previewKey: string;
  /** Photos the layout needs, and which text fields it shows ("name", "message", "date"). */
  photoSlots: number;
  textFields: string[];
}

export function parseTemplateConfig(config: unknown): { photoSlots: number; textFields: string[] } {
  const c = (config ?? {}) as { photo_slots?: unknown; text_fields?: unknown };
  return {
    photoSlots: typeof c.photo_slots === "number" ? c.photo_slots : 1,
    textFields: Array.isArray(c.text_fields) ? c.text_fields.filter((f): f is string => typeof f === "string") : [],
  };
}

export interface ProductImage {
  key: string;
  alt: Localized;
}

export interface Product extends PricingProduct {
  id: string;
  slug: string;
  categoryId: string;
  categorySlug: string;
  name: Localized;
  shortDescription: Localized;
  description: Localized;
  pricingMode: PricingMode;
  productionDays: number;
  allowCustomerArtwork: boolean;
  allowDesignService: boolean;
  requiresArtwork: boolean;
  images: ProductImage[];
  specs: { label: string; value: string }[];
  isFeatured: boolean;
  sortOrder: number;
  options: ProductOption[];
  templates: ProductTemplate[];
}

export interface Catalog {
  categories: Category[];
  products: Product[];
  source: "supabase" | "seed";
}

export function availableDesignModes(product: Product): DesignMode[] {
  const modes: DesignMode[] = [];
  if (product.allowCustomerArtwork) modes.push("upload");
  if (product.allowDesignService) modes.push("design_for_me");
  if (product.templates.length > 0) modes.push("template");
  return modes.length > 0 ? modes : ["upload"];
}

/** Lowest possible price for "from Rs X" labels. */
export function fromPrice(product: Product): number | null {
  if (product.pricingMode === "fixed" && product.basePrice !== null) {
    let min = product.basePrice;
    for (const o of product.options) {
      const flats = o.values.filter((v) => v.modifierType === "flat").map((v) => v.priceModifier);
      if (o.isRequired && flats.length > 0) min += Math.min(...flats);
    }
    return min;
  }
  if (product.pricingMode === "per_sqft" && product.pricePerSqft !== null) {
    return product.pricePerSqft;
  }
  return null;
}

/**
 * Cheapest possible order (quantity 1, standard turnaround, own artwork):
 * greedily picks, for each required option, the value giving the lowest total.
 * For per-sq-ft products this is the minimum billable size — used for sorting.
 */
export function minimumPrice(product: Product): number | null {
  if (product.pricingMode === "quote") return null;
  const values: Record<string, string> = {};
  for (const o of product.options) {
    if (o.type === "text" || o.type === "photo_slots" || o.values.length === 0) continue;
    if (o.isRequired) values[o.code] = (o.values.find((v) => v.isDefault) ?? o.values[0]).value;
  }
  const total = (v: Record<string, string>) => {
    const r = computePrice(product, { values: v, customSize: null, quantity: 1, designMode: "upload", turnaround: "standard" });
    return r.ok ? r.total : Number.POSITIVE_INFINITY;
  };
  for (const o of product.options) {
    if (!(o.code in values)) continue;
    let best = values[o.code];
    let bestTotal = total(values);
    for (const v of o.values) {
      if (v.value === CUSTOM_SIZE_VALUE) continue;
      const t = total({ ...values, [o.code]: v.value });
      if (t < bestTotal) {
        best = v.value;
        bestTotal = t;
      }
    }
    values[o.code] = best;
  }
  const result = total(values);
  return Number.isFinite(result) ? result : null;
}
