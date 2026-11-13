import type { Metadata } from "next";
import { ArrowRight, Clock } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getCatalog } from "@/features/catalog/queries";
import { pick } from "@/features/catalog/types";
import { CategoryIcon } from "@/components/shop/CategoryIcon";
import { buttonClass } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { ProductMiniCard } from "@/components/shop/ProductMiniCard";
import { ProductVisual } from "@/components/shop/ProductVisual";
import { productSampleFor } from "@/lib/assets";
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
          const inCategory = products.filter((p) => p.categorySlug === c.slug);
          const examples = inCategory.slice(0, 4);
          const lead = inCategory[0];
          const leadSample = lead ? (lead.images[0]?.key ?? productSampleFor(lead.slug, false)) : null;
          // Typical turnaround from the real production days of this category's products.
          const days = inCategory.map((p) => p.productionDays);
          const minDays = days.length > 0 ? Math.min(...days) : null;
          const maxDays = days.length > 0 ? Math.max(...days) : null;
          return (
            <section key={c.slug} id={c.slug} aria-labelledby={`${c.slug}-title`} className="scroll-mt-20 py-10 sm:py-12">
              <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr] lg:gap-12">
                <div>
                  <ProductVisual
                    image={leadSample ? { key: leadSample, alt: c.name } : undefined}
                    alt={lead ? pick(lead.name, locale) : name}
                    categorySlug={c.slug}
                    placeholderLabel={t("common.photoComingSoon")}
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    sampleLabel={leadSample && !lead?.images[0] ? t("common.sampleImage") : undefined}
                    className="aspect-[16/9] rounded-card"
                  />
                  <h2 id={`${c.slug}-title`} className="mt-5 flex items-center gap-3 text-2xl sm:text-display-sm">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                      <CategoryIcon slug={c.slug} className="size-5" />
                    </span>
                    {name}
                  </h2>
                  <p className="mt-2 text-ink-700">{pick(c.description, locale)}</p>
                  {minDays !== null && maxDays !== null && (
                    <p className="mt-3 flex items-center gap-2 text-sm font-medium text-ink-700">
                      <Clock className="size-4 shrink-0 text-brand-600" aria-hidden="true" />
                      {t("services.turnaround", { range: minDays === maxDays ? String(minDays) : `${minDays}–${maxDays}`, count: maxDays })}
                    </p>
                  )}
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
                    <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                      {examples.map((p) => (
                        <li key={p.slug}><ProductMiniCard product={p} /></li>
                      ))}
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
