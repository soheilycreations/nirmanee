import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
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

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <h1 className="text-display-sm sm:text-display-md">{t("title")}</h1>
      <p className="mt-4 text-lg text-ink-700">{t("lead")}</p>

      <section className="mt-10" aria-labelledby="how">
        <h2 id="how" className="text-2xl">{t("howTitle")}</h2>
        <ul className="mt-4 space-y-3">
          {[t("how1"), t("how2"), t("how3")].map((line) => (
            <li key={line} className="flex gap-3">
              <CheckCircle2 className="mt-1 size-5 shrink-0 text-success-600" aria-hidden="true" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10" aria-labelledby="what">
        <h2 id="what" className="text-2xl">{t("whatTitle")}</h2>
        <p className="mt-3 text-ink-700">{t("whatText")}</p>
      </section>

      <section className="mt-10 rounded-card bg-surface p-6 shadow-card" aria-labelledby="visit">
        <h2 id="visit" className="text-2xl">{t("visitTitle")}</h2>
        <p className="mt-2 text-ink-700">{t("visitText")}</p>
        <Link href="/contact" className={buttonClass({ className: "mt-5" })}>{t("contactCta")}</Link>
      </section>
    </div>
  );
}
