/**
 * Pricing engine — pure, dependency-free, shared by the product page (live
 * preview) and server actions (authoritative). Keep this file free of path
 * aliases and runtime-only TypeScript syntax: it is unit-tested with
 * `node --test` (type stripping).
 *
 *   fixed:     unit = base_price
 *   per_sqft:  unit = max(w·h/144, min_sqft) · (price_per_sqft + Σ per_sqft modifiers)
 *   then       unit = (unit + Σ flat) · (1 + Σ percent / 100)
 *   lines      = unit · quantity
 *   tier       = best quantity tier discount on lines
 *   express    = (lines − tier) · express_surcharge_percent / 100
 *   design fee = once per line when "Design it for me"
 *   total      = lines − tier + express + design fee     (whole rupees)
 */

export type PricingMode = "fixed" | "per_sqft" | "quote";
export type ModifierType = "flat" | "percent" | "per_sqft";
export type DesignMode = "upload" | "design_for_me" | "template";
export type Turnaround = "standard" | "express";

export const CUSTOM_SIZE_VALUE = "__custom";

export interface PricingOptionValue {
  value: string;
  modifierType: ModifierType;
  priceModifier: number;
  widthIn: number | null;
  heightIn: number | null;
}

export interface PricingOption {
  code: string;
  type: "size" | "material" | "finish" | "color" | "text" | "photo_slots";
  isRequired: boolean;
  config: {
    allow_custom?: boolean;
    min_width_in?: number;
    max_width_in?: number;
    min_height_in?: number;
    max_height_in?: number;
    print_width_in?: number;
    print_height_in?: number;
  };
  values: PricingOptionValue[];
}

export interface PricingProduct {
  orderType: "fixed" | "quote";
  pricingMode: PricingMode;
  basePrice: number | null;
  pricePerSqft: number | null;
  minSqft: number | null;
  designFee: number;
  expressDays: number | null;
  expressSurchargePercent: number;
  options: PricingOption[];
  tiers: { minQuantity: number; discountPercent: number }[];
}

export interface PricingSelection {
  values: Record<string, string>;
  customSize?: { widthIn: number; heightIn: number } | null;
  quantity: number;
  designMode: DesignMode;
  turnaround: Turnaround;
}

export type PricingError =
  | { code: "missing_option"; option: string }
  | { code: "invalid_value"; option: string }
  | { code: "invalid_size"; option: string }
  | { code: "invalid_quantity" }
  | { code: "express_unavailable" }
  | { code: "no_price" };

export interface PriceQuote {
  ok: true;
  unitPrice: number;
  quantity: number;
  linesSubtotal: number;
  tierDiscountPercent: number;
  tierDiscount: number;
  expressFee: number;
  designFee: number;
  total: number;
  areaSqft: number | null;
  /** Quote products: shown as an estimate, final price set by staff. */
  isEstimate: boolean;
  /** Physical print size used for resolution checks (inches). */
  printSize: { widthIn: number; heightIn: number } | null;
  nextTier: { minQuantity: number; discountPercent: number } | null;
}

export type PriceResult = PriceQuote | { ok: false; error: PricingError };

const MAX_QUANTITY = 100_000;
const money = (n: number) => Math.round(n);

export function computePrice(product: PricingProduct, selection: PricingSelection): PriceResult {
  const qty = selection.quantity;
  if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QUANTITY) {
    return { ok: false, error: { code: "invalid_quantity" } };
  }
  if (selection.turnaround === "express" && product.expressDays === null) {
    return { ok: false, error: { code: "express_unavailable" } };
  }

  let flat = 0;
  let percent = 0;
  let perSqft = 0;
  let printSize: { widthIn: number; heightIn: number } | null = null;

  for (const option of product.options) {
    if (option.type === "text" || option.type === "photo_slots") {
      if (option.type === "photo_slots" && option.config.print_width_in && option.config.print_height_in && !printSize) {
        printSize = { widthIn: option.config.print_width_in, heightIn: option.config.print_height_in };
      }
      continue;
    }
    const chosen = selection.values[option.code];
    if (!chosen) {
      if (option.isRequired && option.values.length > 0) {
        return { ok: false, error: { code: "missing_option", option: option.code } };
      }
      continue;
    }

    if (option.type === "size" && chosen === CUSTOM_SIZE_VALUE) {
      const c = selection.customSize;
      const cfg = option.config;
      if (
        !cfg.allow_custom || !c ||
        !(c.widthIn > 0 && c.heightIn > 0) ||
        (cfg.min_width_in !== undefined && c.widthIn < cfg.min_width_in) ||
        (cfg.max_width_in !== undefined && c.widthIn > cfg.max_width_in) ||
        (cfg.min_height_in !== undefined && c.heightIn < cfg.min_height_in) ||
        (cfg.max_height_in !== undefined && c.heightIn > cfg.max_height_in)
      ) {
        return { ok: false, error: { code: "invalid_size", option: option.code } };
      }
      printSize = { widthIn: c.widthIn, heightIn: c.heightIn };
      continue;
    }

    const value = option.values.find((v) => v.value === chosen);
    if (!value) return { ok: false, error: { code: "invalid_value", option: option.code } };
    if (option.type === "size" && value.widthIn && value.heightIn) {
      printSize = { widthIn: value.widthIn, heightIn: value.heightIn };
    }
    if (value.modifierType === "flat") flat += value.priceModifier;
    else if (value.modifierType === "percent") percent += value.priceModifier;
    else perSqft += value.priceModifier;
  }

  let unit: number;
  let areaSqft: number | null = null;
  if (product.pricingMode === "fixed") {
    if (product.basePrice === null) return { ok: false, error: { code: "no_price" } };
    unit = product.basePrice;
  } else if (product.pricingMode === "per_sqft") {
    if (product.pricePerSqft === null) return { ok: false, error: { code: "no_price" } };
    if (!printSize) return { ok: false, error: { code: "missing_option", option: "size" } };
    const rawArea = (printSize.widthIn * printSize.heightIn) / 144;
    areaSqft = Math.round(Math.max(rawArea, product.minSqft ?? 0) * 1000) / 1000;
    unit = areaSqft * (product.pricePerSqft + perSqft);
  } else {
    return { ok: false, error: { code: "no_price" } };
  }

  unit = (unit + flat) * (1 + percent / 100);
  const unitPrice = money(unit);
  const linesSubtotal = unitPrice * qty;

  const sortedTiers = [...product.tiers].sort((a, b) => a.minQuantity - b.minQuantity);
  const tier = sortedTiers.filter((t) => qty >= t.minQuantity).pop() ?? null;
  const nextTier = sortedTiers.find((t) => qty < t.minQuantity) ?? null;
  const tierDiscountPercent = tier?.discountPercent ?? 0;
  const tierDiscount = money((linesSubtotal * tierDiscountPercent) / 100);

  const afterTier = linesSubtotal - tierDiscount;
  const expressFee = selection.turnaround === "express" ? money((afterTier * product.expressSurchargePercent) / 100) : 0;
  const designFee = selection.designMode === "design_for_me" ? money(product.designFee) : 0;

  return {
    ok: true,
    unitPrice,
    quantity: qty,
    linesSubtotal,
    tierDiscountPercent,
    tierDiscount,
    expressFee,
    designFee,
    total: afterTier + expressFee + designFee,
    areaSqft,
    isEstimate: product.orderType === "quote",
    printSize,
    nextTier,
  };
}

/**
 * Effective print resolution of an image at a physical size. Orientation is
 * matched (long edge to long edge).
 */
export function effectivePpi(
  image: { widthPx: number; heightPx: number },
  print: { widthIn: number; heightIn: number },
): number {
  const imgLong = Math.max(image.widthPx, image.heightPx);
  const imgShort = Math.min(image.widthPx, image.heightPx);
  const printLong = Math.max(print.widthIn, print.heightIn);
  const printShort = Math.min(print.widthIn, print.heightIn);
  return Math.floor(Math.min(imgLong / printLong, imgShort / printShort));
}

/** "good" ≥ target, "ok" ≥ half the target, otherwise "low". */
export function resolutionVerdict(ppi: number, largeFormat: boolean): "good" | "ok" | "low" {
  const target = largeFormat ? 100 : 300;
  if (ppi >= target) return "good";
  if (ppi >= target / 2) return "ok";
  return "low";
}
