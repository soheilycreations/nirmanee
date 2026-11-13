import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone, Truck } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buttonClass } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { pageMetadata } from "@/lib/seo/metadata";
import { SITE_SETTINGS } from "@/config/site-settings";
import { TrustSection } from "@/components/home/TrustSection";
import { SITE, whatsappUrl } from "@/lib/site";

export const revalidate = 3600;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return pageMetadata({ locale, path: "/contact", title: t("contactTitle"), description: t("contactDescription") });
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");

  const card = "rounded-card border border-line bg-surface p-5 shadow-card";
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
      <h1 className="text-display-sm sm:text-display-md">{t("title")}</h1>
      <p className="mt-3 max-w-2xl text-lg text-ink-700">{t("lead")}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <section className={card} aria-labelledby="c-wa">
          <h2 id="c-wa" className="flex items-center gap-2 font-sans text-lg font-semibold"><WhatsAppIcon className="size-5 text-whatsapp" />{t("whatsappTitle")}</h2>
          <p className="mt-1 text-ink-700">{SITE.whatsappDisplay}</p>
          <a href={whatsappUrl(t("whatsappMessage"))} target="_blank" rel="noopener noreferrer" className={buttonClass({ variant: "whatsapp", full: true, className: "mt-4" })}>
            <WhatsAppIcon /> {SITE.whatsappDisplay}
          </a>
        </section>

        <section className={card} aria-labelledby="c-phone">
          <h2 id="c-phone" className="flex items-center gap-2 font-sans text-lg font-semibold"><Phone className="size-5 text-brand-600" aria-hidden="true" />{t("phoneTitle")}</h2>
          <p className="mt-1 text-ink-700">{SITE.phoneDisplay}</p>
          <a href={`tel:${SITE.phone}`} className={buttonClass({ variant: "secondary", full: true, className: "mt-4" })}>
            <Phone className="size-4" aria-hidden="true" /> {SITE.phoneDisplay}
          </a>
        </section>

        <section className={card} aria-labelledby="c-hours">
          <h2 id="c-hours" className="flex items-center gap-2 font-sans text-lg font-semibold"><Clock className="size-5 text-brand-600" aria-hidden="true" />{t("hoursTitle")}</h2>
          <p className="mt-1 text-ink-700">{t("hoursValue")}</p>
        </section>

        <section className={card} aria-labelledby="c-loc">
          <h2 id="c-loc" className="flex items-center gap-2 font-sans text-lg font-semibold"><MapPin className="size-5 text-brand-600" aria-hidden="true" />{t("locationTitle")}</h2>
          <p className="mt-1 text-ink-700">
            {SITE_SETTINGS.streetAddress ? (locale === "si" ? SITE_SETTINGS.streetAddress.si : SITE_SETTINGS.streetAddress.en) : t("locationValue")}
          </p>
          <a href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer" className={buttonClass({ variant: "secondary", full: true, className: "mt-4" })}>
            <MapPin className="size-4" aria-hidden="true" /> {t("directions")}
          </a>
        </section>

        {SITE.email && (
          <section className={card} aria-labelledby="c-mail">
            <h2 id="c-mail" className="flex items-center gap-2 font-sans text-lg font-semibold"><Mail className="size-5 text-brand-600" aria-hidden="true" />{t("emailTitle")}</h2>
            <a href={`mailto:${SITE.email}`} className="mt-1 inline-flex min-h-11 items-center text-brand-600 underline">{SITE.email}</a>
          </section>
        )}

        <section className={`${card} sm:col-span-2`} aria-labelledby="c-del">
          <h2 id="c-del" className="flex items-center gap-2 font-sans text-lg font-semibold"><Truck className="size-5 text-brand-600" aria-hidden="true" />{t("deliveryTitle")}</h2>
          <p className="mt-1 text-ink-700">{t("deliveryText")}</p>
        </section>
      </div>
      <div className="-mx-4 mt-6">
        <TrustSection />
      </div>
    </div>
  );
}
