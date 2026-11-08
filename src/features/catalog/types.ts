import type { DesignMode, ModifierType, PricingMode, PricingProduct } from "@/lib/pricing";

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
