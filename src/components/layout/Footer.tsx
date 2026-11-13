import Image from "next/image";
import { Clock, MapPin, Phone } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getNavCategories } from "@/features/catalog/queries";
import { SITE_SETTINGS } from "@/config/site-settings";
import { pick } from "@/features/catalog/types";
import { SITE, whatsappUrl } from "@/lib/site";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";

export async function Footer() {
  const t = await getTranslations();
  const locale = await getLocale();
  const categories = (await getNavCategories()).slice(0, 6);
  const socials = Object.entries(SITE_SETTINGS.socials).filter((e): e is [string, string] => Boolean(e[1]));
  const linkClass = "inline-flex min-h-11 items-center text-paper-300 hover:text-white";

  return (
    <footer className="mt-auto bg-royal-900 text-paper-300">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <div className="flex items-center gap-3">
            <Image src="/images/brand/nirmanee-logo.jpg" alt="" width={44} height={44} className="size-11 rounded-full" />
            <span className="font-display text-xl font-semibold text-white">Nirmanee</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed">{t("footer.tagline")}</p>
        </div>

        <nav aria-label={t("footer.explore")}>
          <h2 className="font-sans text-sm font-semibold uppercase tracking-wider text-white">{t("footer.explore")}</h2>
          <ul className="mt-3 text-sm">
            <li><Link className={linkClass} href="/shop">{t("nav.shop")}</Link></li>
            <li><Link className={linkClass} href="/services">{t("nav.services")}</Link></li>
            <li><Link className={linkClass} href="/about">{t("nav.about")}</Link></li>
            <li><Link className={linkClass} href="/contact">{t("nav.contact")}</Link></li>
            <li><Link className={linkClass} href="/cart">{t("nav.cart")}</Link></li>
          </ul>
        </nav>

        <nav aria-label={t("footer.popular")}>
          <h2 className="font-sans text-sm font-semibold uppercase tracking-wider text-white">{t("footer.popular")}</h2>
          <ul className="mt-3 text-sm">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link className={linkClass} href={`/shop/${c.slug}`}>{pick(c.name, locale)}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={t("footer.help")}>
          <h2 className="font-sans text-sm font-semibold uppercase tracking-wider text-white">{t("footer.help")}</h2>
          <ul className="mt-3 text-sm">
            <li><Link className={linkClass} href="/faq">{t("footer.faq")}</Link></li>
            <li><Link className={linkClass} href="/track">{t("footer.track")}</Link></li>
            <li><Link className={linkClass} href="/returns">{t("footer.returns")}</Link></li>
            <li><Link className={linkClass} href="/terms">{t("footer.terms")}</Link></li>
            <li><Link className={linkClass} href="/privacy">{t("footer.privacy")}</Link></li>
          </ul>
        </nav>

        <div>
          <h2 className="font-sans text-sm font-semibold uppercase tracking-wider text-white">{t("footer.visit")}</h2>
          <ul className="mt-3 space-y-1 text-sm">
            <li>
              <a className={`${linkClass} gap-2`} href={whatsappUrl()} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon className="size-4" /> {SITE.whatsappDisplay}
              </a>
            </li>
            <li>
              <a className={`${linkClass} gap-2`} href={`tel:${SITE.phone}`}>
                <Phone className="size-4" aria-hidden="true" /> {SITE.phoneDisplay}
              </a>
            </li>
            <li className="flex min-h-11 items-center gap-2"><Clock className="size-4 shrink-0" aria-hidden="true" /> {t("footer.hours")}</li>
            <li>
              <a className={`${linkClass} gap-2`} href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer">
                <MapPin className="size-4" aria-hidden="true" /> {t("footer.location")}
              </a>
            </li>
          </ul>
          {socials.length > 0 && (
            <ul aria-label={t("footer.follow")} className="mt-3 flex flex-wrap gap-x-4 text-sm">
              {socials.map(([name, url]) => (
                <li key={name}>
                  <a className={`${linkClass} capitalize`} href={url} target="_blank" rel="noopener noreferrer">{name}</a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-paper-400">{t("footer.rights", { year: new Date().getFullYear() })}</p>
      </div>
    </footer>
  );
}
