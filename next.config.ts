import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const r2Public = process.env.NEXT_PUBLIC_R2_PUBLIC_URL ? new URL(process.env.NEXT_PUBLIC_R2_PUBLIC_URL) : null;

// id -> new URL, from the hardcoded catalogue of the first prototype.
const LEGACY_PRODUCT_IDS: [string, string][] = [
  ["1", "/products/black-board-frame-engraving"],
  ["2", "/products/mdf-sublimation-clock"],
  ["3", "/products/wood-slice-engraving"],
  ["4", "/products/magnet-pine-wood-frame"],
  ["5", "/products/custom-love-wooden-frame"],
  ["6", "/products/photo-frame-with-light"],
  ["7", "/products/hexagon-glass-photo-frame"],
  ["8", "/products/anniversary-glass-clock-frame"],
  ["9", "/shop/digital-printing"],
  ["10", "/products/crystal-photo-block"],
  ["11", "/products/custom-t-shirt"],
  ["12", "/products/edible-cake-print"],
];

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: r2Public
      ? [{ protocol: r2Public.protocol.replace(":", "") as "https" | "http", hostname: r2Public.hostname }]
      : [],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    return [
      // Old prototype URLs: only the ids that existed are redirected; any other
      // /product/<x> falls through to the localised 404.
      ...LEGACY_PRODUCT_IDS.map(([id, destination]) => ({ source: `/product/${id}`, destination, permanent: true })),
      { source: "/admin/pos", destination: "/admin", permanent: false },
    ];
  },
};

export default withNextIntl(nextConfig);
