// Scans public/products/<slug>/ (real photos 1.webp, 2.webp… and sample-N.webp AI samples) and public/gallery/ and writes
// src/generated/assets-manifest.json. Runs before `dev` and `build` so pages
// can list photos without reading the filesystem at request time (on Vercel,
// public/ is served by the CDN and is not available to ISR functions).
import { readdirSync, statSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { splitProductFiles } from "./lib/product-files.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const IMG = /\.(webp|jpe?g|png|avif)$/i;
const natural = (a, b) => a.localeCompare(b, undefined, { numeric: true });

function images(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => IMG.test(f) && statSync(path.join(dir, f)).isFile()).sort(natural);
}

const products = {};
const samples = {};
const productsDir = path.join(root, "public/products");
if (existsSync(productsDir)) {
  for (const slug of readdirSync(productsDir).sort()) {
    const dir = path.join(productsDir, slug);
    if (!statSync(dir).isDirectory()) continue;
    const files = images(dir);
    const { real, sample } = splitProductFiles(files);
    if (real.length) products[slug] = real.map((f) => `/products/${slug}/${f}`);
    if (sample.length) samples[slug] = sample.map((f) => `/products/${slug}/${f}`);
  }
}

// Gallery alt text comes from the file name: "2026-03-wedding-led-frame.webp" -> "wedding led frame".
const gallery = images(path.join(root, "public/gallery")).map((f) => ({
  src: `/gallery/${f}`,
  alt: f.replace(IMG, "").replace(/^\d{4}-\d{2}(-\d{2})?-?/, "").replace(/[-_]+/g, " ").trim() || "Recent work",
}));

const brand = {
  heroCollage: images(path.join(root, "public/gallery")).slice(0, 3).map((f) => `/gallery/${f}`),
  shopPhoto: ["shop.webp", "shop.jpg"].map((f) => `/brand/${f}`).find((p) => existsSync(path.join(root, "public", p))) ?? null,
};

writeFileSync(path.join(root, "src/generated/assets-manifest.json"), JSON.stringify({ products, samples, gallery, brand }, null, 2) + "\n");
console.log(`assets manifest: ${Object.keys(products).length} products with photos, ${Object.keys(samples).length} with sample images, ${gallery.length} gallery images`);
