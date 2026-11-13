import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getNavCategories } from "@/features/catalog/queries";
import { pick } from "@/features/catalog/types";
import { CategoryIcon } from "@/components/shop/CategoryIcon";
import { buttonClass } from "@/components/ui/button";
import { whatsappUrl } from "@/lib/site";

export default async function NotFound() {
  const t = await getTranslations();
  const locale = await getLocale();
  const categories = (await getNavCategories()).slice(0, 6);
  return (
    <section className="mx-auto max-w-xl px-4 py-16 text-center sm:py-20">
      <p className="font-display text-6xl text-brand-500">404</p>
      <h1 className="mt-4 text-display-sm">{t("notFound.title")}</h1>
      <p className="mt-3 text-fg-muted">{t("notFound.text")}</p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href="/shop" className={buttonClass({ size: "lg" })}>{t("notFound.toShop")}</Link>
        <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className={buttonClass({ variant: "secondary", size: "lg" })}>
          {t("common.whatsappUs")}
        </a>
      </div>
      {categories.length > 0 && (
        <nav aria-label={t("notFound.popular")} className="mt-10">
          <h2 className="font-sans text-sm font-semibold uppercase tracking-wider text-ink-500">{t("notFound.popular")}</h2>
          <ul className="mt-3 flex flex-wrap justify-center gap-2">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/shop/${c.slug}`} className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm font-medium hover:border-brand-300 hover:text-brand-700">
                  <CategoryIcon slug={c.slug} className="size-4" /> {pick(c.name, locale)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </section>
  );
}
