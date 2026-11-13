import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

/** Namespaces every page's client components need (header, mobile nav, toasts). */
export const BASE_NAMESPACES = ["common", "nav", "toast"] as const;

/**
 * Provides ONLY the given translation namespaces (plus the base ones) to the
 * client components inside it, instead of shipping the whole catalogue.
 */
export async function IntlIsland({ namespaces, children }: { namespaces: readonly string[]; children: React.ReactNode }) {
  const all = (await getMessages()) as Record<string, unknown>;
  const picked: Record<string, unknown> = {};
  for (const ns of new Set([...BASE_NAMESPACES, ...namespaces])) {
    if (ns in all) picked[ns] = all[ns];
  }
  return <NextIntlClientProvider messages={picked as never}>{children}</NextIntlClientProvider>;
}
