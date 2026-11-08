import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { siteUrl } from "@/lib/env";

/** Public path for a locale ("as-needed": English has no prefix). */
export function localizedPath(locale: string, path: string): string {
  const clean = path === "/" ? "" : path;
  return locale === routing.defaultLocale ? clean || "/" : `/${locale}${clean}`;
}

export function pageMetadata(opts: {
  locale: string;
  path: string;
  title: string;
  description: string;
  absoluteTitle?: boolean;
  noindex?: boolean;
  image?: string;
}): Metadata {
  const languages = Object.fromEntries(routing.locales.map((l) => [l === "si" ? "si-LK" : "en-LK", localizedPath(l, opts.path)]));
  return {
    title: opts.absoluteTitle ? { absolute: opts.title } : opts.title,
    description: opts.description,
    alternates: {
      canonical: localizedPath(opts.locale, opts.path),
      languages: { ...languages, "x-default": localizedPath(routing.defaultLocale, opts.path) },
    },
    openGraph: {
      type: "website",
      siteName: "Nirmanee Digital Print House",
      locale: opts.locale === "si" ? "si_LK" : "en_LK",
      url: `${siteUrl()}${localizedPath(opts.locale, opts.path)}`,
      title: opts.title,
      description: opts.description,
      ...(opts.image ? { images: [{ url: opts.image }] } : {}),
    },
    twitter: { card: "summary_large_image", title: opts.title, description: opts.description },
    robots: opts.noindex ? { index: false, follow: true } : undefined,
  };
}
