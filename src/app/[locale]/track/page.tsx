import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { IntlIsland } from "@/i18n/IntlIsland";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { buttonClass } from "@/components/ui/button";
import { whatsappUrl } from "@/lib/site";
import { TrackForm } from "@/components/content/TrackForm";
import { pageMetadata } from "@/lib/seo/metadata";

export const revalidate = 3600;

/** Customer-facing job stages in the order they normally happen (copy lives in messages/*.json → track.statuses). */
const STATUS_KEYS = ["awaiting_payment", "artwork_in_progress", "proof_sent", "changes_requested", "approved", "printing", "quality_check", "ready", "delivered"] as const;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return pageMetadata({ locale, path: "/track", title: t("trackTitle"), description: t("trackDescription"), noindex: true });
}

export default async function TrackPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("track");
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
      <h1 className="text-display-sm sm:text-display-md">{t("title")}</h1>
      <p className="mt-2 text-ink-700">{t("lead")}</p>
      <IntlIsland namespaces={["track"]}>
        <TrackForm />
      </IntlIsland>

      <section aria-labelledby="statuses" className="mt-12">
        <h2 id="statuses" className="text-xl">{t("statusTitle")}</h2>
        <p className="mt-1 text-sm text-ink-700">{t("statusLead")}</p>
        <ol className="mt-4 divide-y divide-line rounded-card border border-line bg-surface">
          {STATUS_KEYS.map((key, i) => (
            <li key={key} className="flex gap-3 px-4 py-3">
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700">{i + 1}</span>
              <div>
                <p className="font-semibold">{t(`statuses.${key}.name`)}</p>
                <p className="text-sm text-ink-700">{t(`statuses.${key}.text`)}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-6 flex flex-col items-start gap-3 rounded-card bg-sunken p-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-semibold">{t("helpNote")}</p>
        <a href={whatsappUrl(t("helpMessage"))} target="_blank" rel="noopener noreferrer" className={buttonClass({ variant: "whatsapp" })}>
          <WhatsAppIcon /> {t("helpButton")}
        </a>
      </div>
    </div>
  );
}
