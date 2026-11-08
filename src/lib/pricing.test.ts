import { test } from "node:test";
import assert from "node:assert/strict";
import { computePrice, effectivePpi, resolutionVerdict, CUSTOM_SIZE_VALUE, type PricingProduct } from "./pricing.ts";

const mug: PricingProduct = {
  orderType: "fixed",
  pricingMode: "fixed",
  basePrice: 1200,
  pricePerSqft: null,
  minSqft: null,
  designFee: 300,
  expressDays: 1,
  expressSurchargePercent: 50,
  tiers: [
    { minQuantity: 6, discountPercent: 5 },
    { minQuantity: 12, discountPercent: 10 },
  ],
  options: [
    {
      code: "inner_color",
      type: "color",
      isRequired: true,
      config: {},
      values: [
        { value: "white", modifierType: "flat", priceModifier: 0, widthIn: null, heightIn: null },
        { value: "red", modifierType: "flat", priceModifier: 150, widthIn: null, heightIn: null },
      ],
    },
    { code: "photos", type: "photo_slots", isRequired: false, config: { print_width_in: 8, print_height_in: 3.5 }, values: [] },
  ],
};

const banner: PricingProduct = {
  orderType: "quote",
  pricingMode: "per_sqft",
  basePrice: null,
  pricePerSqft: 90,
  minSqft: 6,
  designFee: 1000,
  expressDays: 1,
  expressSurchargePercent: 30,
  tiers: [],
  options: [
    {
      code: "size",
      type: "size",
      isRequired: true,
      config: { allow_custom: true, min_width_in: 12, max_width_in: 600, min_height_in: 12, max_height_in: 600 },
      values: [{ value: "2x4ft", modifierType: "flat", priceModifier: 0, widthIn: 48, heightIn: 24 }],
    },
    {
      code: "material",
      type: "material",
      isRequired: true,
      config: {},
      values: [
        { value: "standard", modifierType: "flat", priceModifier: 0, widthIn: null, heightIn: null },
        { value: "star", modifierType: "per_sqft", priceModifier: 30, widthIn: null, heightIn: null },
      ],
    },
    {
      code: "finish",
      type: "finish",
      isRequired: true,
      config: {},
      values: [
        { value: "eyelets", modifierType: "per_running_ft", priceModifier: 20, widthIn: null, heightIn: null },
        { value: "none", modifierType: "flat", priceModifier: 0, widthIn: null, heightIn: null },
      ],
    },
  ],
};

test("fixed product with flat modifier", () => {
  const r = computePrice(mug, { values: { inner_color: "red" }, quantity: 1, designMode: "upload", turnaround: "standard" });
  assert.ok(r.ok);
  assert.equal(r.unitPrice, 1350);
  assert.equal(r.total, 1350);
  assert.deepEqual(r.printSize, { widthIn: 8, heightIn: 3.5 });
});

test("quantity tier, express and design fee", () => {
  const r = computePrice(mug, { values: { inner_color: "white" }, quantity: 12, designMode: "design_for_me", turnaround: "express" });
  assert.ok(r.ok);
  assert.equal(r.linesSubtotal, 14400);
  assert.equal(r.tierDiscountPercent, 10);
  assert.equal(r.tierDiscount, 1440);
  assert.equal(r.expressFee, 6480); // 50% of 12,960
  assert.equal(r.designFee, 300);
  assert.equal(r.total, 12960 + 6480 + 300);
  assert.equal(r.nextTier, null);
});

test("next tier hint", () => {
  const r = computePrice(mug, { values: { inner_color: "white" }, quantity: 3, designMode: "upload", turnaround: "standard" });
  assert.ok(r.ok);
  assert.deepEqual(r.nextTier, { minQuantity: 6, discountPercent: 5 });
});

test("required option missing", () => {
  const r = computePrice(mug, { values: {}, quantity: 1, designMode: "upload", turnaround: "standard" });
  assert.deepEqual(r, { ok: false, error: { code: "missing_option", option: "inner_color" } });
});

test("invalid value and quantity", () => {
  assert.equal(computePrice(mug, { values: { inner_color: "gold" }, quantity: 1, designMode: "upload", turnaround: "standard" }).ok, false);
  assert.equal(computePrice(mug, { values: { inner_color: "white" }, quantity: 0, designMode: "upload", turnaround: "standard" }).ok, false);
  assert.equal(computePrice(mug, { values: { inner_color: "white" }, quantity: 1.5, designMode: "upload", turnaround: "standard" }).ok, false);
});

test("per sqft with min area, per_sqft modifier and eyelets per running foot", () => {
  // 2x4 ft = 8 sqft; (90 + 30) * 8 = 960; perimeter 12 ft * 20 = 240 -> 1200
  const r = computePrice(banner, { values: { size: "2x4ft", material: "star", finish: "eyelets" }, quantity: 1, designMode: "upload", turnaround: "standard" });
  assert.ok(r.ok);
  assert.equal(r.areaSqft, 8);
  assert.equal(r.total, 1200);
  assert.equal(r.isEstimate, true);
});

test("custom size respects min sqft and limits", () => {
  // 12x12 in = 1 sqft -> billed 6 sqft: 6 * 90 = 540; perimeter 4 ft * 20 = 80 -> 620
  const r = computePrice(banner, {
    values: { size: CUSTOM_SIZE_VALUE, material: "standard", finish: "eyelets" },
    customSize: { widthIn: 12, heightIn: 12 },
    quantity: 1, designMode: "upload", turnaround: "standard",
  });
  assert.ok(r.ok);
  assert.equal(r.areaSqft, 6);
  assert.equal(r.total, 620);

  const tooBig = computePrice(banner, {
    values: { size: CUSTOM_SIZE_VALUE, material: "standard", finish: "eyelets" },
    customSize: { widthIn: 700, heightIn: 12 },
    quantity: 1, designMode: "upload", turnaround: "standard",
  });
  assert.deepEqual(tooBig, { ok: false, error: { code: "invalid_size", option: "size" } });
});

test("express unavailable", () => {
  const r = computePrice({ ...mug, expressDays: null }, { values: { inner_color: "white" }, quantity: 1, designMode: "upload", turnaround: "express" });
  assert.deepEqual(r, { ok: false, error: { code: "express_unavailable" } });
});

test("effective ppi and verdict", () => {
  assert.equal(effectivePpi({ widthPx: 2400, heightPx: 3000 }, { widthIn: 10, heightIn: 8 }), 300);
  assert.equal(resolutionVerdict(300, false), "good");
  assert.equal(resolutionVerdict(160, false), "ok");
  assert.equal(resolutionVerdict(90, false), "low");
  assert.equal(resolutionVerdict(60, true), "ok");
});

test("eyelets scale with perimeter, not area", () => {
  const big = computePrice(banner, {
    values: { size: CUSTOM_SIZE_VALUE, material: "standard", finish: "eyelets" },
    customSize: { widthIn: 120, heightIn: 36 }, // 10 x 3 ft = 30 sqft, perimeter 26 ft
    quantity: 1, designMode: "upload", turnaround: "standard",
  });
  assert.ok(big.ok);
  assert.equal(big.total, 30 * 90 + 26 * 20);
  const cutOnly = computePrice(banner, {
    values: { size: CUSTOM_SIZE_VALUE, material: "standard", finish: "none" },
    customSize: { widthIn: 120, heightIn: 36 }, quantity: 1, designMode: "upload", turnaround: "standard",
  });
  assert.ok(cutOnly.ok);
  assert.equal(cutOnly.total, 2700);
});
