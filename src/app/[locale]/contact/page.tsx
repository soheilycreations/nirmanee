import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone, Truck } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { IntlIsland } from "@/i18n/IntlIsland";
import { buttonClass } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { EnquiryForm } from "@/components/content/EnquiryForm";
import { StudioVisual } from "@/components/home/StudioBlock";
import { pageMetadata } from "@/lib/seo/metadata";
import { SITE_SETTINGS } from "@/config/site-settings";
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
  const heading = "flex items-center gap-2 font-sans text-lg font-semibold";
  // Four cards fill two rows; email (when set) and delivery each span the full width, so the grid never has a hole.
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
      <h1 className="text-display-sm sm:text-display-md">{t("title")}</h1>
      <p className="mt-3 max-w-2xl text-lg text-ink-700">{t("lead")}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <section className={card} aria-labelledby="c-wa">
          <h2 id="c-wa" className={heading}><WhatsAppIcon className="size-5 text-whatsapp" />{t("whatsappTitle")}</h2>
          <p className="mt-1 text-sm text-ink-700">{t("whatsappHint")}</p>
          <a href={whatsappUrl(t("whatsappMessage"))} target="_blank" rel="noopener noreferrer" className={buttonClass({ variant: "whatsapp", full: true, className: "mt-4" })}>
            <WhatsAppIcon /> {SITE.whatsappDisplay}
          </a>
        </section>

        <section className={card} aria-labelledby="c-phone">
          <h2 id="c-phone" className={heading}><Phone className="size-5 text-brand-600" aria-hidden="true" />{t("phoneTitle")}</h2>
          <p className="mt-1 text-sm text-ink-700">{t("phoneHint")}</p>
          <a href={`tel:${SITE.phone}`} className={buttonClass({ variant: "secondary", full: true, className: "mt-4" })}>
            <Phone className="size-4" aria-hidden="true" /> {SITE.phoneDisplay}
          </a>
        </section>

        <section className={card} aria-labelledby="c-hours">
          <h2 id="c-hours" className={heading}><Clock className="size-5 text-brand-600" aria-hidden="true" />{t("hoursTitle")}</h2>
          <p className="mt-1 text-ink-700">{t("hoursValue")}</p>
        </section>

        <section className={card} aria-labelledby="c-loc">
          <h2 id="c-loc" className={heading}><MapPin className="size-5 text-brand-600" aria-hidden="true" />{t("locationTitle")}</h2>
          <p className="mt-1 text-ink-700">
            {SITE_SETTINGS.streetAddress ? (locale === "si" ? SITE_SETTINGS.streetAddress.si : SITE_SETTINGS.streetAddress.en) : t("locationValue")}
          </p>
          <a href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer" className={buttonClass({ variant: "secondary", full: true, className: "mt-4" })}>
            <MapPin className="size-4" aria-hidden="true" /> {t("directions")}
          </a>
        </section>

        {SITE.email && (
          <section className={`${card} sm:col-span-2`} aria-labelledby="c-mail">
            <h2 id="c-mail" className={heading}><Mail className="size-5 text-brand-600" aria-hidden="true" />{t("emailTitle")}</h2>
            <a href={`mailto:${SITE.email}`} className="mt-1 inline-flex min-h-11 items-center text-brand-600 underline">{SITE.email}</a>
          </section>
        )}

        <section className={`${card} sm:col-span-2`} aria-labelledby="c-del">
          <h2 id="c-del" className={heading}><Truck className="size-5 text-brand-600" aria-hidden="true" />{t("deliveryTitle")}</h2>
          <p className="mt-1 text-ink-700">{t("deliveryText")}</p>
        </section>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <IntlIsland namespaces={["contact"]}>
          <EnquiryForm />
        </IntlIsland>
        <StudioVisual className="lg:h-full" />
      </div>
    </div>
  );
}
