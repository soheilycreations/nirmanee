import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { IntlIsland } from "@/i18n/IntlIsland";
import { getNavCategories, searchProducts } from "@/features/catalog/queries";
import { minimumPrice, pick, type Category } from "@/features/catalog/types";
import { ProductCard } from "./ProductCard";
import { ShopGrid, type ShopGridItem } from "./ShopGrid";
import { cn } from "@/lib/cn";

const crumb = "inline-flex min-h-11 items-center hover:text-brand-600";

export async function ShopView({ category }: { category: Category | null }) {
  const t = await getTranslations();
  const locale = await getLocale();
  const [navCategories, products] = await Promise.all([
    getNavCategories(),
    searchProducts({ category: category?.slug, sort: "featured", locale }),
  ]);

  const items: ShopGridItem[] = products.map((p, i) => ({
    slug: p.slug,
    name: pick(p.name, locale),
    search: [p.name.en, p.name.si ?? "", p.shortDescription.en, p.shortDescription.si ?? "", p.categorySlug].join(" ").toLowerCase(),
    minPrice: minimumPrice(p),
    featuredRank: i,
    node: <ProductCard product={p} priority={i < 2} />,
  }));

  const chip = (active: boolean) =>
    cn("inline-flex h-11 items-center rounded-full border px-4 text-sm font-medium", active ? "border-primary bg-primary text-white" : "border-line bg-surface text-ink-700 hover:border-brand-300");

  return (
    <div className="mx-auto max-w-6xl px-4 py-4 sm:py-10">
      <nav aria-label={t("product.breadcrumb")} className="text-sm text-ink-500">
        <ol className="flex flex-wrap items-center gap-x-1">
          <li><Link href="/" className={crumb}>{t("common.home")}</Link></li>
          <li aria-hidden="true">/</li>
          <li>{category ? <Link href="/shop" className={crumb}>{t("shop.title")}</Link> : <span aria-current="page" className="inline-flex min-h-11 items-center">{t("shop.title")}</span>}</li>
          {category && (<><li aria-hidden="true">/</li><li aria-current="page" className="inline-flex min-h-11 items-center">{pick(category.name, locale)}</li></>)}
        </ol>
      </nav>

      <h1 className="mt-1 text-display-sm sm:text-display-md">{category ? pick(category.name, locale) : t("shop.title")}</h1>
      <p className="mt-2 max-w-2xl text-ink-700">{category ? pick(category.description, locale) : t("shop.subtitle")}</p>

      <nav aria-label={t("shop.categoriesLabel")} className="mt-5">
        <ul className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          <li className="shrink-0">
            <Link href="/shop" aria-current={!category ? "page" : undefined} className={chip(!category)}>{t("shop.all")}</Link>
          </li>
          {navCategories.map((c) => (
            <li key={c.slug} className="shrink-0">
              <Link href={`/shop/${c.slug}`} aria-current={c.slug === category?.slug ? "page" : undefined} className={chip(c.slug === category?.slug)}>
                {pick(c.name, locale)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <IntlIsland namespaces={["shop"]}>
        <ShopGrid items={items} />
      </IntlIsland>
    </div>
  );
}
