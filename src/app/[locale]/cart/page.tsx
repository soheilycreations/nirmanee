import type { Metadata } from "next";
import { Paperclip, ShoppingBag, Store, Trash2, Truck } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getCatalog } from "@/features/catalog/queries";
import { pick, type Product } from "@/features/catalog/types";
import { getCartLines, type CartLine } from "@/features/cart/store";
import { removeCartItemAction, updateCartQuantityAction } from "@/features/cart/actions";
import { ProductVisual } from "@/components/shop/ProductVisual";
import { buttonClass } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { computePrice, CUSTOM_SIZE_VALUE, type PriceResult } from "@/lib/pricing";
import { formatLKR, formatSize } from "@/lib/format";
import { pageMetadata } from "@/lib/seo/metadata";
import { whatsappUrl } from "@/lib/site";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return pageMetadata({ locale, path: "/cart", title: t("cartTitle"), description: t("shopDescription"), noindex: true });
}

interface PricedLine {
  line: CartLine;
  product: Product | null;
  price: PriceResult | null;
  details: string[];
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
  const [lines, { products }] = await Promise.all([getCartLines(), getCatalog()]);

  const priced: PricedLine[] = lines.map((line) => {
    const product = products.find((p) => p.slug === line.productSlug) ?? null;
    if (!product) return { line, product: null, price: null, details: [] };
    const values = Object.fromEntries(
      line.selections
        .filter((s) => product.options.find((o) => o.code === s.code && o.type !== "text"))
        .map((s) => [s.code, s.value]),
    );
    const usesCustom = Object.values(values).includes(CUSTOM_SIZE_VALUE);
    const price = computePrice(product, {
      values,
      customSize: usesCustom && line.widthIn && line.heightIn ? { widthIn: line.widthIn, heightIn: line.heightIn } : null,
      quantity: line.quantity,
      designMode: line.designMode,
      turnaround: line.turnaround,
    });
    return { line, product, price, details: describe(line, product, locale) };
  });

  const subtotal = priced.reduce((sum, p) => sum + (p.price?.ok ? p.price.total : 0), 0);
  const hasEstimate = priced.some((p) => p.price?.ok && p.price.isEstimate);

  if (lines.length === 0) {
    return (
      <section className="mx-auto max-w-xl px-4 py-20 text-center">
        <ShoppingBag className="mx-auto size-12 text-ink-300" aria-hidden="true" />
        <h1 className="mt-4 text-display-sm">{t("cart.empty")}</h1>
        <p className="mt-2 text-ink-700">{t("cart.emptyText")}</p>
        <Link href="/shop" className={buttonClass({ size: "lg", className: "mt-6" })}>{t("cart.continue")}</Link>
      </section>
    );
  }

  const whatsappLines = [
    t("cart.whatsappIntro"),
    ...priced.map(({ line, product, price, details }, i) => {
      const name = product ? pick(product.name, "en") : line.productSlug;
      const parts = [`${i + 1}. ${name} × ${line.quantity}`, ...details, t(`cart.design.${line.designMode}`)];
      if (line.turnaround === "express") parts.push(t("cart.expressTag"));
      if (price?.ok) parts.push(formatLKR(price.total));
      return parts.join(" · ");
    }),
    t("cart.whatsappTotal", { total: formatLKR(subtotal) }),
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <h1 className="text-display-sm sm:text-display-md">{t("cart.title")}</h1>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <ul className="space-y-3">
          {priced.map(({ line, product, price, details }) => {
            const name = product ? pick(product.name, locale) : line.productSlug;
            return (
              <li key={line.id} className="flex gap-3 rounded-card border border-line bg-surface p-3 shadow-card sm:gap-4 sm:p-4">
                {product ? (
                  <Link href={`/products/${product.slug}`} className="shrink-0">
                    <ProductVisual image={product.images[0]} alt={name} categorySlug={product.categorySlug} placeholderLabel="" sizes="96px" className="size-20 rounded-media sm:size-24" />
                  </Link>
                ) : (
                  <div className="size-20 shrink-0 rounded-media bg-paper-200 sm:size-24" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-sans text-base font-semibold leading-snug">
                      {product ? <Link href={`/products/${product.slug}`} className="hover:text-brand-700">{name}</Link> : name}
                    </h2>
                    <p className="shrink-0 font-semibold">{price?.ok ? formatLKR(price.total) : "—"}</p>
                  </div>
                  {!product && <p className="text-sm text-danger-600">{t("cart.unavailableItem")}</p>}
                  {details.length > 0 && <p className="mt-1 text-sm text-ink-700">{details.join(" · ")}</p>}
                  <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                    <span className="rounded-full bg-brand-50 px-2 py-0.5 font-medium text-brand-700">{t(`cart.design.${line.designMode}`)}</span>
                    {line.turnaround === "express" && <span className="rounded-full bg-accent-100 px-2 py-0.5 font-medium text-accent-700">{t("cart.expressTag")}</span>}
                    {line.skipProof && <span className="rounded-full bg-paper-200 px-2 py-0.5 font-medium text-ink-700">{t("cart.skipProofTag")}</span>}
                    {price?.ok && price.isEstimate && <span className="rounded-full bg-warning-50 px-2 py-0.5 font-medium text-warning-600">{t("cart.estimateTag")}</span>}
                  </div>
                  <p className="mt-2 flex items-center gap-1 text-xs text-ink-500">
                    <Paperclip className="size-3.5" aria-hidden="true" /> {t("cart.files", { count: line.files.length })}
                  </p>
                  {line.notes && <p className="mt-1 line-clamp-2 text-xs italic text-ink-500">“{line.notes}”</p>}

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <form action={updateCartQuantityAction} className="flex items-center gap-2">
                      <input type="hidden" name="lineId" value={line.id} />
                      <label className="text-sm">
                        <span className="sr-only">{t("cart.quantity")}</span>
                        <input type="number" name="quantity" min={1} max={100000} defaultValue={line.quantity} inputMode="numeric" className="h-11 w-20 rounded-control border border-line bg-surface px-3 text-[16px]" />
                      </label>
                      <button type="submit" className={buttonClass({ variant: "secondary", size: "sm", className: "h-11" })}>{t("cart.update")}</button>
                    </form>
                    <form action={removeCartItemAction}>
                      <input type="hidden" name="lineId" value={line.id} />
                      <button type="submit" aria-label={t("cart.removeItem", { name })} className="inline-flex h-11 items-center gap-1.5 rounded-control px-3 text-sm font-medium text-danger-600 hover:bg-danger-50">
                        <Trash2 className="size-4" aria-hidden="true" /> {t("cart.remove")}
                      </button>
                    </form>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-card border border-line bg-surface p-5 shadow-card" aria-labelledby="summary">
            <h2 id="summary" className="sr-only">{t("cart.subtotal")}</h2>
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>{t("cart.subtotal")}</span>
              <span>{formatLKR(subtotal)}</span>
            </div>
            {hasEstimate && <p className="mt-2 text-xs text-ink-500">{t("cart.estimateNote")}</p>}

            <h3 className="mt-5 font-sans text-sm font-semibold">{t("cart.deliveryTitle")}</h3>
            <ul className="mt-2 space-y-2 text-sm text-ink-700">
              <li className="flex gap-2"><Store className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden="true" />{t("cart.deliveryPickup")}</li>
              <li className="flex gap-2"><Truck className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden="true" />{t("cart.deliveryZones")}</li>
            </ul>

            <div className="mt-5 rounded-control bg-accent-50 p-3">
              <p className="text-sm font-semibold text-ink-900">{t("cart.checkoutSoon")}</p>
              <p className="mt-1 text-xs text-ink-700">{t("cart.checkoutSoonText")}</p>
            </div>
            <a href={whatsappUrl(whatsappLines.join("\n"))} target="_blank" rel="noopener noreferrer" className={buttonClass({ variant: "whatsapp", size: "lg", full: true, className: "mt-4" })}>
              <WhatsAppIcon /> {t("cart.sendWhatsapp")}
            </a>
            <Link href="/shop" className={buttonClass({ variant: "ghost", full: true, className: "mt-2" })}>{t("cart.continue")}</Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
