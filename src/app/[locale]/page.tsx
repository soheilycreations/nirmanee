import type { Metadata } from "next";
import { ArrowRight, BadgeCheck, MessageCircle, Palette, Printer, ShieldCheck, Store, Truck, Upload } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getCategories, getFeaturedProducts } from "@/features/catalog/queries";
import { pick } from "@/features/catalog/types";
import { ProductCard } from "@/components/shop/ProductCard";
import { CategoryIcon } from "@/components/shop/CategoryIcon";
import { buttonClass } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { pageMetadata } from "@/lib/seo/metadata";
import { whatsappUrl } from "@/lib/site";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return pageMetadata({ locale, path: "/", title: `${t("siteName")} — ${t("homeTitle")}`, description: t("homeDescription"), absoluteTitle: true });
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const [featured, categories] = await Promise.all([getFeaturedProducts(8), getCategories()]);

  const steps = [
    { icon: Upload, title: t("home.step1Title"), text: t("home.step1Text") },
    { icon: Palette, title: t("home.step2Title"), text: t("home.step2Text") },
    { icon: Printer, title: t("home.step3Title"), text: t("home.step3Text") },
    { icon: Truck, title: t("home.step4Title"), text: t("home.step4Text") },
  ];
  const trust = [
    { icon: ShieldCheck, title: t("home.trustProof"), text: t("home.trustProofText") },
    { icon: Store, title: t("home.trustPickup"), text: t("home.trustPickupText") },
    { icon: MessageCircle, title: t("home.trustWhatsapp"), text: t("home.trustWhatsappText") },
  ];

  return (
    <>
      {/* Compact hero: products must be visible on the first mobile screen. */}
      <section className="border-b border-line bg-gradient-to-b from-surface to-bg">
        <div className="mx-auto max-w-6xl px-4 pb-6 pt-6 sm:pb-10 sm:pt-10 lg:pb-14 lg:pt-14">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">{t("home.heroEyebrow")}</p>
          <h1 className="mt-2 max-w-3xl text-[1.75rem] leading-tight sm:text-display-md lg:text-display-lg">{t("home.heroTitle")}</h1>
          <p className="mt-2 max-w-2xl text-[15px] text-ink-700 sm:mt-3 sm:text-lg">{t("home.heroSubtitle")}</p>
          <div className="mt-4 flex gap-2 sm:mt-6 sm:gap-3">
            <Link href="/shop" className={buttonClass({ size: "lg", className: "flex-1 whitespace-nowrap px-4 sm:flex-none sm:px-6" })}>
              {t("home.heroCtaShop")} <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className={buttonClass({ variant: "secondary", size: "lg", className: "min-w-0 flex-1 px-4 sm:flex-none sm:px-6" })}>
              <WhatsAppIcon className="size-5 text-whatsapp" /> <span className="truncate">{t("home.heroCtaWhatsapp")}</span>
            </a>
          </div>
        </div>
      </section>

      {/* Category chips */}
      <nav aria-label={t("home.categories")} className="mx-auto max-w-6xl px-4 pt-4">
        <ul className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          {categories.map((c) => (
            <li key={c.slug} className="shrink-0">
              <Link href={`/shop/${c.slug}`} className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm font-medium text-ink-700 hover:border-brand-300 hover:text-brand-700">
                <CategoryIcon slug={c.slug} className="size-4" /> {pick(c.name, locale)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Featured products */}
      <section aria-labelledby="featured-heading" className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
        <div className="flex items-end justify-between gap-4">
          <h2 id="featured-heading" className="text-2xl sm:text-display-sm">{t("home.featured")}</h2>
          <Link href="/shop" className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">
            {t("common.viewAll")} <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {featured.map((p, i) => (
            <li key={p.slug}><ProductCard product={p} priority={i < 2} /></li>
          ))}
        </ul>
      </section>

      {/* How it works */}
      <section aria-labelledby="how-heading" className="bg-sunken">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <h2 id="how-heading" className="text-2xl sm:text-display-sm">{t("home.howTitle")}</h2>
          <p className="mt-2 text-ink-700">{t("home.howSubtitle")}</p>
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <li key={s.title} className="rounded-card bg-surface p-5 shadow-card">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                    <s.icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="text-sm font-semibold text-accent-700">0{i + 1}</span>
                </div>
                <h3 className="mt-4 font-sans text-lg font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-ink-700">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Trust */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <ul className="grid gap-4 sm:grid-cols-3">
          {trust.map((item) => (
            <li key={item.title} className="flex gap-3">
              <item.icon className="mt-0.5 size-6 shrink-0 text-success-600" aria-hidden="true" />
              <div>
                <p className="font-semibold">{item.title}</p>
                <p className="text-sm text-ink-700">{item.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Services */}
      <section aria-labelledby="services-heading" className="border-t border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <h2 id="services-heading" className="text-2xl sm:text-display-sm">{t("home.servicesTitle")}</h2>
          <p lang="si" className="mt-2 text-ink-700">{t("home.servicesSubtitle")}</p>
          <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/services#${c.slug}`} className="flex min-h-16 items-center gap-3 rounded-control border border-line bg-bg p-3 hover:border-brand-300">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface text-brand-600">
                    <CategoryIcon slug={c.slug} className="size-5" />
                  </span>
                  <span className="text-sm font-medium leading-snug">{pick(c.name, locale)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-col items-start gap-4 rounded-sheet bg-royal-900 p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-10">
          <div>
            <h2 className="flex items-center gap-2 text-2xl text-white"><BadgeCheck className="size-6 text-accent-300" aria-hidden="true" />{t("home.ctaTitle")}</h2>
            <p className="mt-2 max-w-xl text-paper-300">{t("home.ctaText")}</p>
          </div>
          <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className={buttonClass({ variant: "whatsapp", size: "lg" })}>
            <WhatsAppIcon /> {t("home.ctaButton")}
          </a>
        </div>
      </section>
    </>
  );
}
