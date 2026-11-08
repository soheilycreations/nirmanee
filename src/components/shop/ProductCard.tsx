import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { fromPrice, pick, type Product } from "@/features/catalog/types";
import { formatLKR } from "@/lib/format";
import { ProductVisual } from "./ProductVisual";

export async function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const t = await getTranslations("common");
  const locale = await getLocale();
  const name = pick(product.name, locale);
  const price = fromPrice(product);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-card border border-line bg-surface shadow-card transition-shadow hover:shadow-lift"
    >
      <div className="relative">
        <ProductVisual
          image={product.images[0]}
          alt={name}
          categorySlug={product.categorySlug}
          placeholderLabel={t("photoComingSoon")}
          priority={priority}
          className="aspect-square transition-transform duration-300 group-hover:scale-[1.02]"
        />
        {product.orderType === "quote" && (
          <span className="absolute left-2 top-2 rounded-full bg-accent-500 px-2.5 py-0.5 text-xs font-semibold text-ink-900">{t("quoteBadge")}</span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3 sm:p-4">
        <h3 className="font-sans text-[15px] font-semibold leading-snug text-ink-900 group-hover:text-brand-700">{name}</h3>
        <p className="line-clamp-2 text-sm text-ink-500">{pick(product.shortDescription, locale)}</p>
        {price !== null && (
          <p className="mt-auto pt-2 text-[15px] font-semibold text-ink-900">
            {product.pricingMode === "per_sqft" ? t("perSqft", { price: formatLKR(price) }) : t("from", { price: formatLKR(price) })}
          </p>
        )}
      </div>
    </Link>
  );
}
