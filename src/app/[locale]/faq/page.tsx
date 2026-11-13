import type { Metadata } from "next";
import { ChevronDown } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { FAQ_GROUPS, faqItems } from "@/content/faq";
import { fillPlaceholders } from "@/content/legal";
import { legalPlaceholders } from "@/components/content/LegalPage";
import { buttonClass } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { JsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { whatsappUrl } from "@/lib/site";

export const revalidate = 3600;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return pageMetadata({ locale, path: "/faq", title: t("faqTitle"), description: t("faqDescription") });
}

export default async function FaqPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("faq");
  const values = await legalPlaceholders();
  const items = faqItems(locale).map((i) => ({ q: i.q, a: fillPlaceholders(i.a, values), group: i.group }));

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <h1 className="text-display-sm sm:text-display-md">{t("title")}</h1>
      <p className="mt-2 text-ink-700">{t("subtitle")}</p>
      <nav aria-label={t("jumpTo")} className="mt-6">
        <ul className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          {FAQ_GROUPS.map((g) => (
            <li key={g} className="shrink-0">
              <a href={`#${g}`} className="inline-flex h-11 items-center rounded-full border border-line bg-surface px-4 text-sm font-medium hover:border-brand-300">{t(`groups.${g}`)}</a>
            </li>
          ))}
        </ul>
      </nav>
      {FAQ_GROUPS.map((g, gi) => (
        <section key={g} id={g} aria-labelledby={`${g}-title`} className="mt-8 scroll-mt-20">
          <h2 id={`${g}-title`} className="text-xl">{t(`groups.${g}`)}</h2>
          <div className="mt-3 divide-y divide-line rounded-card border border-line bg-surface">
            {items.filter((i) => i.group === g).map((item, ii) => (
              <details key={item.q} open={gi === 0 && ii === 0} className="group px-4">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 py-3 font-semibold [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <ChevronDown className="size-5 shrink-0 text-ink-500 transition-transform group-open:rotate-180" aria-hidden="true" />
                </summary>
                <p className="pb-4 text-ink-700">{item.a}</p>
              </details>
            ))}
          </div>
          {g === "delivery" && (
            <p className="mt-3 text-sm text-ink-700">
              {t("returnsPrompt")}{" "}
              <Link href="/returns" className="inline-flex min-h-11 items-center font-semibold text-brand-600 underline">{t("returnsLink")}</Link>
            </p>
          )}
        </section>
      ))}
      <div className="mt-8 flex flex-col items-start gap-3 rounded-card bg-sunken p-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-semibold">{t("more")}</p>
        <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className={buttonClass({ variant: "whatsapp" })}>
          <WhatsAppIcon /> {t("ask")}
        </a>
      </div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
        }}
      />
    </div>
  );
}
