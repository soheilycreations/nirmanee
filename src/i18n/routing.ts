import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "si"],
  defaultLocale: "en",
  // English at "/", Sinhala at "/si/..."
  localePrefix: "as-needed",
  // The URL alone decides the language: "/" and "/en/…" are always English,
  // "/si/…" always Sinhala. No cookie/Accept-Language redirects, which also
  // keeps every page cacheable (static/ISR) regardless of visitor.
  localeDetection: false,
  localeCookie: false,
});

export type AppLocale = (typeof routing.locales)[number];
