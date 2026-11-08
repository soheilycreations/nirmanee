import { Search } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Link, getPathname } from "@/i18n/navigation";
import { getCategories, searchProducts, type ShopSort } from "@/features/catalog/queries";
import { pick, type Category } from "@/features/catalog/types";
import { ProductCard } from "./ProductCard";
import { buttonClass } from "@/components/ui/button";
import { whatsappUrl } from "@/lib/site";
import { cn } from "@/lib/cn";

const SORTS: ShopSort[] = ["featured", "price-asc", "price-desc", "name"];

export function parseSort(value: string | string[] | undefined): ShopSort {
  return typeof value === "string" && (SORTS as string[]).includes(value) ? (value as ShopSort) : "featured";
}

export async function ShopView({ category, q, sort }: { category: Category | null; q: string; sort: ShopSort }) {
  const t = await getTranslations();
  const locale = await getLocale();
  const [categories, products] = await Promise.all([
    getCategories(),
    searchProducts({ category: category?.slug, q, sort, locale }),
  ]);
  const basePath = category ? `/shop/${category.slug}` : "/shop";
  const formAction = getPathname({ href: basePath, locale });
  const sortLabels: Record<ShopSort, string> = {
    featured: t("shop.sortFeatured"),
    "price-asc": t("shop.sortPriceAsc"),
    "price-desc": t("shop.sortPriceDesc"),
    name: t("shop.sortName"),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
      <nav aria-label={t("product.breadcrumb")} className="text-sm text-ink-500">
        <ol className="flex flex-wrap items-center gap-1">
          <li><Link href="/" className="hover:text-brand-600">{t("common.home")}</Link></li>
          <li aria-hidden="true">/</li>
          <li>{category ? <Link href="/shop" className="hover:text-brand-600">{t("shop.title")}</Link> : <span aria-current="page">{t("shop.title")}</span>}</li>
          {category && (<><li aria-hidden="true">/</li><li aria-current="page">{pick(category.name, locale)}</li></>)}
        </ol>
      </nav>

      <h1 className="mt-3 text-display-sm sm:text-display-md">{category ? pick(category.name, locale) : t("shop.title")}</h1>
      <p className="mt-2 max-w-2xl text-ink-700">{category ? pick(category.description, locale) : t("shop.subtitle")}</p>

      {/* Category chips */}
      <nav aria-label={t("shop.categoriesLabel")} className="mt-5">
        <ul className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          <li className="shrink-0">
            <Link href="/shop" aria-current={!category ? "page" : undefined} className={cn("inline-flex h-11 items-center rounded-full border px-4 text-sm font-medium", !category ? "border-primary bg-primary text-white" : "border-line bg-surface text-ink-700 hover:border-brand-300")}>
              {t("shop.all")}
            </Link>
          </li>
          {categories.map((c) => {
            const active = c.slug === category?.slug;
            return (
              <li key={c.slug} className="shrink-0">
                <Link href={`/shop/${c.slug}`} aria-current={active ? "page" : undefined} className={cn("inline-flex h-11 items-center rounded-full border px-4 text-sm font-medium", active ? "border-primary bg-primary text-white" : "border-line bg-surface text-ink-700 hover:border-brand-300")}>
                  {pick(c.name, locale)}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Search + sort: plain GET form, works without JavaScript */}
      <form action={formAction} method="get" role="search" className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <span className="sr-only">{t("shop.searchLabel")}</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-ink-300" aria-hidden="true" />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder={t("shop.searchPlaceholder")}
            className="h-11 w-full rounded-control border border-line bg-surface pl-10 pr-3 text-[16px] placeholder:text-ink-300 focus:border-brand-400 focus:outline-none"
          />
        </label>
        <div className="flex gap-2">
          <label className="flex-1 sm:flex-none">
            <span className="sr-only">{t("shop.sortLabel")}</span>
            <select name="sort" defaultValue={sort} className="h-11 w-full rounded-control border border-line bg-surface px-3 text-[15px]">
              {SORTS.map((s) => (<option key={s} value={s}>{sortLabels[s]}</option>))}
            </select>
          </label>
          <button type="submit" className={buttonClass()}>{t("shop.search")}</button>
        </div>
      </form>

      <p className="mt-4 text-sm text-ink-500" aria-live="polite">{t("shop.results", { count: products.length })}</p>

      {products.length > 0 ? (
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p, i) => (<li key={p.slug}><ProductCard product={p} priority={i < 2} /></li>))}
        </ul>
      ) : (
        <div className="mt-6 rounded-card border border-dashed border-paper-400 bg-surface p-8 text-center">
          <h2 className="text-xl">{t("shop.emptyTitle")}</h2>
          <p className="mx-auto mt-2 max-w-md text-ink-700">{t("shop.emptyText")}</p>
          <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
            {q && <Link href={basePath} className={buttonClass({ variant: "secondary" })}>{t("shop.clear")}</Link>}
            <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className={buttonClass({ variant: "whatsapp" })}>{t("common.whatsappUs")}</a>
          </div>
        </div>
      )}
    </div>
  );
}
