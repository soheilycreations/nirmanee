import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getCatalog } from "@/features/catalog/queries";
import { fromPrice, pick } from "@/features/catalog/types";
import { CategoryIcon } from "@/components/shop/CategoryIcon";
import { buttonClass } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { formatLKR } from "@/lib/format";
import { pageMetadata } from "@/lib/seo/metadata";
import { whatsappUrl } from "@/lib/site";

export const revalidate = 3600;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return pageMetadata({ locale, path: "/services", title: t("servicesTitle"), description: t("servicesDescription") });
}

export default async function ServicesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const { categories, products } = await getCatalog();

  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
          <h1 className="text-display-sm sm:text-display-md">{t("services.title")}</h1>
          <p className="mt-2 max-w-2xl text-ink-700">{t("services.subtitle")}</p>
          <nav aria-label={t("services.jumpTo")} className="mt-5">
            <ul className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:flex-wrap">
              {categories.map((c) => (
                <li key={c.slug} className="shrink-0">
                  <a href={`#${c.slug}`} className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-bg px-4 text-sm font-medium hover:border-brand-300">
                    <CategoryIcon slug={c.slug} className="size-4" /> {pick(c.name, locale)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>

      <div className="mx-auto max-w-6xl divide-y divide-line px-4">
        {categories.map((c) => {
          const name = pick(c.name, locale);
          const examples = products.filter((p) => p.categorySlug === c.slug).slice(0, 4);
          return (
            <section key={c.slug} id={c.slug} aria-labelledby={`${c.slug}-title`} className="scroll-mt-20 py-10 sm:py-12">
              <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr] lg:gap-12">
                <div>
                  <span className="flex size-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                    <CategoryIcon slug={c.slug} className="size-6" />
                  </span>
                  <h2 id={`${c.slug}-title`} className="mt-4 text-2xl sm:text-display-sm">{name}</h2>
                  <p className="mt-2 text-ink-700">{pick(c.description, locale)}</p>
                  <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                    {examples.length > 0 && (
                      <Link href={`/shop/${c.slug}`} className={buttonClass()}>
                        {t("services.shopCategory", { category: name })} <ArrowRight className="size-4" aria-hidden="true" />
                      </Link>
                    )}
                    <a href={whatsappUrl(t("services.quoteMessage", { service: name }))} target="_blank" rel="noopener noreferrer" className={buttonClass({ variant: "secondary" })}>
                      <WhatsAppIcon className="size-5 text-whatsapp" /> {t("services.askQuote")}
                    </a>
                  </div>
                </div>
                <div>
                  <h3 className="font-sans text-sm font-semibold uppercase tracking-wider text-ink-500">{t("services.examples")}</h3>
                  {examples.length > 0 ? (
                    <ul className="mt-3 divide-y divide-line rounded-card border border-line bg-surface">
                      {examples.map((p) => {
                        const price = fromPrice(p);
                        return (
                          <li key={p.slug}>
                            <Link href={`/products/${p.slug}`} className="flex min-h-14 items-center justify-between gap-3 px-4 py-3 hover:bg-paper-100">
                              <span className="font-medium">{pick(p.name, locale)}</span>
                              {price !== null && (
                                <span className="shrink-0 text-sm text-ink-700">
                                  {p.pricingMode === "per_sqft" ? t("common.perSqft", { price: formatLKR(price) }) : t("common.from", { price: formatLKR(price) })}
                                </span>
                              )}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="mt-3 rounded-card border border-dashed border-paper-400 p-4 text-ink-700">{t("services.noProducts")}</p>
                  )}
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
