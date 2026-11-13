import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { IntlIsland } from "@/i18n/IntlIsland";
import { getCatalog, searchProducts } from "@/features/catalog/queries";
import { relatedCategories } from "@/features/catalog/related";
import { minimumPrice, pick, type Category } from "@/features/catalog/types";
import { ProductCard } from "./ProductCard";
import { CategoryChips } from "./CategoryChips";
import { CategoryIcon } from "./CategoryIcon";
import { ShopGrid, type ShopGridItem } from "./ShopGrid";
import { cn } from "@/lib/cn";

const crumb = "inline-flex min-h-11 items-center hover:text-brand-600";

export async function ShopView({ category }: { category: Category | null }) {
  const t = await getTranslations();
  const locale = await getLocale();
  const [{ categories, products: allProducts }, products] = await Promise.all([
    getCatalog(),
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

  // Thin category pages get a row of neighbouring categories instead of a lonely card.
  const related = category && products.length < 3 ? relatedCategories(category.slug, categories, allProducts).slice(0, 4) : [];

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

      <CategoryChips label={t("shop.categoriesLabel")}>
          <li className="shrink-0">
            <Link href="/shop" aria-current={!category ? "page" : undefined} className={chip(!category)}>{t("shop.all")}</Link>
          </li>
          {categories.map((c) => (
            <li key={c.slug} className="shrink-0">
              <Link href={`/shop/${c.slug}`} aria-current={c.slug === category?.slug ? "page" : undefined} className={chip(c.slug === category?.slug)}>
                {pick(c.name, locale)}
              </Link>
            </li>
          ))}
      </CategoryChips>

      <IntlIsland namespaces={["shop"]}>
        <ShopGrid items={items} />
      </IntlIsland>

      {related.length > 0 && category && (
        <section aria-labelledby="related-cats" className="mt-12">
          <h2 id="related-cats" className="text-xl sm:text-2xl">{t("shop.relatedTitle")}</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((c) => {
              const count = allProducts.filter((p) => p.categorySlug === c.slug).length;
              return (
                <li key={c.slug}>
                  <Link href={`/shop/${c.slug}`} className="flex h-full gap-3 rounded-card border border-line bg-surface p-4 shadow-card transition-shadow hover:shadow-lift">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                      <CategoryIcon slug={c.slug} className="size-5" />
                    </span>
                    <span>
                      <span className="block font-semibold leading-snug">{pick(c.name, locale)}</span>
                      <span className="block text-sm text-ink-500">{t("shop.productCount", { count })}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
