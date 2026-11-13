import assert from "node:assert/strict";
import test from "node:test";
import { isSampleFile, pickSample, splitProductFiles } from "../../scripts/lib/product-files.mjs";

test("only sample-N files are samples; numbered photos are real", () => {
  assert.equal(isSampleFile("sample-1.webp"), true);
  assert.equal(isSampleFile("sample-12.webp"), true);
  assert.equal(isSampleFile("1.webp"), false);
  assert.equal(isSampleFile("2.webp"), false);
  assert.equal(isSampleFile("my-sample-1.webp"), false);
});

test("samples are split out of a product's files, so they never reach the gallery", () => {
  const { real, sample } = splitProductFiles(["1.webp", "2.webp", "sample-1.webp"]);
  assert.deepEqual(real, ["1.webp", "2.webp"]);
  assert.deepEqual(sample, ["sample-1.webp"]);
});

test("real photos win: no sample when the product has any real photo", () => {
  assert.equal(pickSample(["/products/mug/sample-1.webp"], true), null);
});

test("sample is the fallback when there is no real photo", () => {
  assert.equal(pickSample(["/products/mug/sample-1.webp"], false), "/products/mug/sample-1.webp");
});

test("nothing indexed gives no sample (placeholder)", () => {
  assert.equal(pickSample(undefined, false), null);
  assert.equal(pickSample([], false), null);
});
