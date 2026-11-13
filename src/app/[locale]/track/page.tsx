import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { IntlIsland } from "@/i18n/IntlIsland";
import { TrackForm } from "@/components/content/TrackForm";
import { pageMetadata } from "@/lib/seo/metadata";

export const revalidate = 3600;

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
    <div className="mx-auto max-w-lg px-4 py-10 sm:py-14">
      <h1 className="text-display-sm sm:text-display-md">{t("title")}</h1>
      <p className="mt-2 text-ink-700">{t("lead")}</p>
      <IntlIsland namespaces={["track"]}>
        <TrackForm />
      </IntlIsland>
    </div>
  );
}
