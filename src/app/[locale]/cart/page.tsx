import type { Metadata } from "next";
import { ShoppingBag } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { IntlIsland } from "@/i18n/IntlIsland";
import { getNavCategories, getCatalog } from "@/features/catalog/queries";
import { pick, type Product } from "@/features/catalog/types";
import { getCartLines, getCartReference, type CartLine } from "@/features/cart/store";
import { getDeliveryZones } from "@/features/settings/queries";
import { CartList, type CartListLine } from "@/components/cart/CartList";
import { CartPendingSync } from "@/components/cart/CartPendingSync";
import { CategoryIcon } from "@/components/shop/CategoryIcon";
import { ProductVisual } from "@/components/shop/ProductVisual";
import { buttonClass } from "@/components/ui/button";
import { CUSTOM_SIZE_VALUE } from "@/lib/pricing";
import { formatSize } from "@/lib/format";
import { pageMetadata } from "@/lib/seo/metadata";

// Per-visitor content: always rendered on request.
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return pageMetadata({ locale, path: "/cart", title: t("cartTitle"), description: t("shopDescription"), noindex: true });
}

function describe(line: CartLine, product: Product, locale: string): string[] {
  const out: string[] = [];
  for (const sel of line.selections) {
    const option = product.options.find((o) => o.code === sel.code);
    if (!option) continue;
    const label = pick(option.label, locale);
    if (option.type === "text") out.push(`${label}: “${sel.value}”`);
    else if (sel.value === CUSTOM_SIZE_VALUE && line.widthIn && line.heightIn)
      out.push(`${label}: ${formatSize(line.widthIn, line.heightIn, option.config.unit ?? "in")}`);
    else {
      const value = option.values.find((v) => v.value === sel.value);
      out.push(`${label}: ${value ? pick(value.label, locale) : sel.value}`);
    }
  }
  return out;
}

export default async function CartPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const [lines, { products }, zones, cartRef] = await Promise.all([getCartLines(), getCatalog(), getDeliveryZones(), getCartReference()]);

  if (lines.length === 0) {
    const categories = (await getNavCategories()).slice(0, 6);
    return (
      <section className="mx-auto max-w-xl px-4 py-16 text-center sm:py-20">
        <span className="mx-auto flex size-20 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <ShoppingBag className="size-9" strokeWidth={1.5} aria-hidden="true" />
        </span>
        <IntlIsland namespaces={["cart"]}>
          <CartPendingSync />
        </IntlIsland>
        <h1 className="mt-4 text-display-sm">{t("cart.empty")}</h1>
        <p className="mt-2 text-ink-700">{t("cart.emptyText")}</p>
        <Link href="/shop" className={buttonClass({ size: "lg", className: "mt-6" })}>{t("cart.continue")}</Link>
        {categories.length > 0 && (
          <nav aria-label={t("cart.emptyCategories")} className="mt-10">
            <h2 className="font-sans text-sm font-semibold uppercase tracking-wider text-ink-500">{t("cart.emptyCategories")}</h2>
            <ul className="mt-3 flex flex-wrap justify-center gap-2">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link href={`/shop/${c.slug}`} className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm font-medium hover:border-brand-300 hover:text-brand-700">
                    <CategoryIcon slug={c.slug} className="size-4" /> {pick(c.name, locale)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </section>
    );
  }

  const listLines: CartListLine[] = lines.map((line) => {
    const product = products.find((p) => p.slug === line.productSlug) ?? null;
    const name = product ? pick(product.name, locale) : line.productSlug;
    const values = product
      ? Object.fromEntries(
          line.selections.filter((s) => product.options.find((o) => o.code === s.code && o.type !== "text")).map((s) => [s.code, s.value]),
        )
      : {};
    const usesCustom = Object.values(values).includes(CUSTOM_SIZE_VALUE);
    return {
      id: line.id,
      name,
      href: product ? `/products/${product.slug}` : null,
      visual: product ? (
        <ProductVisual image={product.images[0]} alt={name} categorySlug={product.categorySlug} placeholderLabel="" sizes="96px" className="size-20 rounded-media sm:size-24" />
      ) : (
        <div className="size-20 rounded-media bg-paper-200 sm:size-24" />
      ),
      details: product ? describe(line, product, locale) : [],
      quantity: line.quantity,
      designMode: line.designMode,
      turnaround: line.turnaround,
      skipProof: line.skipProof,
      notes: line.notes,
      fileCount: line.files.length,
      product,
      values,
      customSize: usesCustom && line.widthIn && line.heightIn ? { widthIn: line.widthIn, heightIn: line.heightIn } : null,
    };
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <h1 className="text-display-sm sm:text-display-md">{t("cart.title")}</h1>
      <IntlIsland namespaces={["cart"]}>
        <CartPendingSync />
        <CartList
          key={listLines.map((l) => `${l.id}:${l.quantity}`).join(",")}
          initialLines={listLines}
          zones={zones.map((z) => ({ code: z.code, name: pick({ en: z.name.en, si: z.name.si }, locale), fee: z.fee, etaMinDays: z.etaMinDays, etaMaxDays: z.etaMaxDays }))}
          cartRef={cartRef}
        />
      </IntlIsland>
    </div>
  );
}
