import Image from "next/image";
import { Clock, MapPin, Navigation, Phone, Star } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { SITE_SETTINGS } from "@/config/site-settings";
import { buttonClass } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { shopPhoto } from "@/lib/assets";
import { SITE, whatsappUrl } from "@/lib/site";

/**
 * The studio's visual column: Google map when `mapEmbedUrl` is set, otherwise
 * the shop photo, otherwise a plain "Kalutara" panel with a directions button —
 * so the column is never empty. Uses only data from site-settings / public/brand.
 */
export async function StudioVisual({ className = "" }: { className?: string }) {
  const t = await getTranslations("home");
  const embed = SITE_SETTINGS.mapEmbedUrl;
  const photo = shopPhoto();
  if (embed) {
    return (
      <iframe
        src={embed}
        title={t("mapTitle")}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className={`min-h-80 w-full rounded-card border border-line ${className}`}
      />
    );
  }
  if (photo) {
    return (
      <div className={`relative min-h-64 overflow-hidden rounded-card ${className}`}>
        <Image src={photo} alt={t("shopPhotoAlt")} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
      </div>
    );
  }
  return (
    <div className={`flex min-h-64 flex-col items-center justify-center gap-4 rounded-card border border-line bg-gradient-to-br from-brand-50 to-paper-200 p-8 text-center ${className}`}>
      <MapPin className="size-12 text-brand-600" strokeWidth={1.5} aria-hidden="true" />
      <p className="font-display text-xl">{t("studioPlace")}</p>
      <a href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer" className={buttonClass({ variant: "secondary" })}>
        <Navigation className="size-4" aria-hidden="true" /> {t("getDirections")}
      </a>
    </div>
  );
}

/** "Visit our Kalutara studio": hours, tap-to-call / WhatsApp, directions, optional rating, plus the visual column. */
export async function StudioBlock() {
  const s = SITE_SETTINGS;
  const t = await getTranslations("home");
  const locale = await getLocale();
  const rating = s.googleRating;
  const photo = shopPhoto();
  const address = s.streetAddress ? (locale === "si" ? s.streetAddress.si : s.streetAddress.en) : t("studioPlace");

  return (
    <section aria-labelledby="studio-heading" className="mx-auto max-w-6xl px-4 py-12">
      <h2 id="studio-heading" className="text-2xl sm:text-display-sm">{t("trustTitle")}</h2>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          {rating && (
            <a href={rating.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 rounded-card border border-line bg-surface p-5 shadow-card hover:border-brand-300">
              <span className="font-display text-4xl text-ink-900">{rating.rating.toFixed(1)}</span>
              <span>
                <span className="flex gap-0.5 text-accent-500" aria-hidden="true">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} className="size-4" fill={i < Math.round(rating.rating) ? "currentColor" : "none"} />
                  ))}
                </span>
                <span className="block text-sm font-semibold">{t("googleRating", { rating: rating.rating.toFixed(1) })} · {t("googleReviews", { count: rating.reviewCount })}</span>
                <span className="block text-sm text-brand-600 underline">{t("readReviews")}</span>
              </span>
            </a>
          )}
          <div className="rounded-card border border-line bg-surface p-5 shadow-card">
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden="true" />
                <span className="font-medium">{address}</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden="true" />
                <span>
                  <span className="font-medium">{t("studioHoursDays")}</span>
                  <span className="block text-ink-700">{t("studioHoursTime")}</span>
                </span>
              </li>
            </ul>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className={buttonClass({ variant: "whatsapp", full: true })}>
                <WhatsAppIcon /> {SITE.whatsappDisplay}
              </a>
              <a href={`tel:${SITE.phone}`} className={buttonClass({ variant: "secondary", full: true })}>
                <Phone className="size-4" aria-hidden="true" /> {SITE.phoneDisplay}
              </a>
              <a href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer" className={buttonClass({ variant: "secondary", full: true, className: "sm:col-span-2" })}>
                <Navigation className="size-4" aria-hidden="true" /> {t("getDirections")}
              </a>
            </div>
          </div>
          {s.mapEmbedUrl && photo && (
            <div className="relative hidden aspect-[16/7] overflow-hidden rounded-card lg:block">
              <Image src={photo} alt={t("shopPhotoAlt")} fill sizes="50vw" className="object-cover" />
            </div>
          )}
        </div>
        <StudioVisual className="lg:h-full" />
      </div>
    </section>
  );
}
