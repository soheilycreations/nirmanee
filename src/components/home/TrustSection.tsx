import Image from "next/image";
import { MapPin, Star } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { SITE_SETTINGS, hasAnyTrustInfo } from "@/config/site-settings";
import { shopPhoto } from "@/lib/assets";
import { SITE } from "@/lib/site";

/**
 * Google rating, address + map, shop photo and "serving since". Every part is
 * driven by src/config/site-settings.ts / public/brand/shop.webp and is hidden
 * until the owner fills it in (no placeholder data is ever rendered).
 */
export async function TrustSection() {
  const s = SITE_SETTINGS;
  const rating = s.googleRating;
  const photo = shopPhoto();
  if (!hasAnyTrustInfo(s) && !photo) return null;
  const t = await getTranslations("home");
  const locale = await getLocale();

  return (
    <section aria-labelledby="trust-heading" className="mx-auto max-w-6xl px-4 py-12">
      <h2 id="trust-heading" className="text-2xl sm:text-display-sm">{t("trustTitle")}</h2>
      {s.servingSince && <p className="mt-1 text-ink-700">{t("servingSince", { year: s.servingSince })}</p>}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
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
          {s.streetAddress && (
            <a href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 rounded-card border border-line bg-surface p-5 shadow-card hover:border-brand-300">
              <MapPin className="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden="true" />
              <span className="font-medium">{locale === "si" ? s.streetAddress.si : s.streetAddress.en}</span>
            </a>
          )}
          {photo && (
            <div className="relative aspect-[4/3] overflow-hidden rounded-card">
              <Image src={photo} alt={t("shopPhotoAlt")} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
            </div>
          )}
        </div>
        {s.mapEmbedUrl && (
          <iframe
            src={s.mapEmbedUrl}
            title={t("mapTitle")}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="min-h-80 w-full rounded-card border border-line"
          />
        )}
      </div>
    </section>
  );
}
