import { Star } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { SITE_SETTINGS } from "@/config/site-settings";

/** Customer reviews from SITE_SETTINGS.reviews. Hidden until the owner adds real ones. */
export async function ReviewsStrip() {
  const reviews = SITE_SETTINGS.reviews;
  if (reviews.length === 0) return null;
  const t = await getTranslations("home");
  const locale = await getLocale();
  return (
    <section aria-labelledby="reviews-heading" className="mx-auto max-w-6xl px-4 py-12">
      <h2 id="reviews-heading" className="text-2xl sm:text-display-sm">{t("reviewsTitle")}</h2>
      <ul className="no-scrollbar -mx-4 mt-6 flex snap-x gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
        {reviews.slice(0, 6).map((r) => {
          const stars = r.rating;
          return (
            <li key={`${r.author}-${r.text.en.slice(0, 20)}`} className="w-72 shrink-0 snap-start rounded-card border border-line bg-surface p-5 shadow-card md:w-auto">
              {stars && (
                <p className="flex gap-0.5 text-accent-500" role="img" aria-label={t("reviewStars", { rating: stars })}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} className="size-4" fill={i < stars ? "currentColor" : "none"} aria-hidden="true" />
                  ))}
                </p>
              )}
              <blockquote className="mt-2 text-ink-700">“{locale === "si" && r.text.si ? r.text.si : r.text.en}”</blockquote>
              <p className="mt-3 text-sm font-semibold">{r.author}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
