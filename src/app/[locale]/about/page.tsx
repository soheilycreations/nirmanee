import type { Metadata } from "next";
import Image from "next/image";
import { BadgeCheck, PenTool, Printer } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getCatalog } from "@/features/catalog/queries";
import { pick } from "@/features/catalog/types";
import { CategoryIcon } from "@/components/shop/CategoryIcon";
import { OUR_STORY } from "@/content/about";
import { buttonClass } from "@/components/ui/button";
import { pageMetadata } from "@/lib/seo/metadata";

export const revalidate = 3600;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return pageMetadata({ locale, path: "/about", title: t("aboutTitle"), description: t("aboutDescription") });
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const { categories, products } = await getCatalog();
  const story = OUR_STORY ? (locale === "si" && OUR_STORY.si.length > 0 ? OUR_STORY.si : OUR_STORY.en) : [];
  const steps = [
    { icon: PenTool, tint: "bg-royal-100 text-royal-500", title: t("how1Title"), text: t("how1") },
    { icon: BadgeCheck, tint: "bg-accent-100 text-accent-700", title: t("how2Title"), text: t("how2") },
    { icon: Printer, tint: "bg-success-50 text-success-600", title: t("how3Title"), text: t("how3") },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <h1 className="text-display-sm sm:text-display-md">{t("title")}</h1>
      <p className="mt-4 text-lg text-ink-700">{t("lead")}</p>
      <Image
        src="/brand/shop-wide.webp"
        alt={t("shopPhotoAlt")}
        width={2400}
        height={800}
        sizes="(max-width: 768px) 100vw, 768px"
        priority
        className="mt-8 aspect-[3/1] w-full rounded-sheet object-cover shadow-card"
      />

      {story.length > 0 && (
        <section className="mt-10" aria-labelledby="story">
          <h2 id="story" className="text-2xl">{t("storyTitle")}</h2>
          <div className="mt-3 space-y-3 text-ink-700">
            {story.map((para) => (<p key={para}>{para}</p>))}
          </div>
        </section>
      )}

      <section className="mt-10" aria-labelledby="how">
        <h2 id="how" className="text-2xl">{t("howTitle")}</h2>
        <ol className="mt-5 grid gap-4 sm:grid-cols-3">
          {steps.map((step, i) => (
            <li key={step.title} className="relative rounded-card border border-line bg-surface p-5 shadow-card">
              <div className={`relative flex size-14 items-center justify-center rounded-full ${step.tint}`}>
                <step.icon className="size-7" strokeWidth={1.5} aria-hidden="true" />
                <span className="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full bg-ink-900 text-xs font-bold text-white">{i + 1}</span>
              </div>
              <h3 className="mt-3 font-sans text-base font-semibold">{step.title}</h3>
              <p className="mt-1 text-sm text-ink-700">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-10" aria-labelledby="what">
        <h2 id="what" className="text-2xl">{t("whatTitle")}</h2>
        <p className="mt-3 text-ink-700">{t("whatText")}</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {categories.map((c) => {
            const hasProducts = products.some((p) => p.categorySlug === c.slug);
            return (
              <li key={c.slug}>
                <Link
                  href={hasProducts ? `/shop/${c.slug}` : `/services#${c.slug}`}
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm font-medium hover:border-brand-300 hover:text-brand-700"
                >
                  <CategoryIcon slug={c.slug} className="size-4" /> {pick(c.name, locale)}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-10 rounded-card bg-surface p-6 shadow-card" aria-labelledby="visit">
        <h2 id="visit" className="text-2xl">{t("visitTitle")}</h2>
        <p className="mt-2 text-ink-700">{t("visitText")}</p>
        <Link href="/contact" className={buttonClass({ className: "mt-5" })}>{t("contactCta")}</Link>
      </section>
    </div>
  );
}
