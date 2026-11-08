import type { MetadataRoute } from "next";
import { getCatalog } from "@/features/catalog/queries";
import { routing } from "@/i18n/routing";
import { siteUrl } from "@/lib/env";
import { localizedPath } from "@/lib/seo/metadata";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const { categories, products } = await getCatalog();
  const paths: { path: string; priority: number; changeFrequency: "daily" | "weekly" | "monthly" }[] = [
    { path: "/", priority: 1, changeFrequency: "weekly" },
    { path: "/shop", priority: 0.9, changeFrequency: "daily" },
    { path: "/services", priority: 0.8, changeFrequency: "monthly" },
    { path: "/about", priority: 0.5, changeFrequency: "monthly" },
    { path: "/contact", priority: 0.6, changeFrequency: "monthly" },
    ...categories.map((c) => ({ path: `/shop/${c.slug}`, priority: 0.8, changeFrequency: "weekly" as const })),
    ...products.map((p) => ({ path: `/products/${p.slug}`, priority: 0.7, changeFrequency: "weekly" as const })),
  ];
  return paths.map(({ path, priority, changeFrequency }) => ({
    url: `${base}${localizedPath(routing.defaultLocale, path)}`,
    changeFrequency,
    priority,
    alternates: {
      languages: Object.fromEntries(routing.locales.map((l) => [l === "si" ? "si-LK" : "en-LK", `${base}${localizedPath(l, path)}`])),
    },
  }));
}
