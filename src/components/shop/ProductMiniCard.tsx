import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { fromPrice, pick, type Product } from "@/features/catalog/types";
import { productSampleFor } from "@/lib/assets";
import { formatLKR } from "@/lib/format";
import { ProductVisual } from "./ProductVisual";

/** Compact product row: thumbnail, name and price. Used where full cards would be too heavy (Services). */
export async function ProductMiniCard({ product }: { product: Product }) {
  const t = await getTranslations("common");
  const locale = await getLocale();
  const name = pick(product.name, locale);
  const price = fromPrice(product);
  const sample = productSampleFor(product.slug, product.images.length > 0);
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex items-center gap-3 rounded-card border border-line bg-surface p-2.5 shadow-card transition-shadow hover:shadow-lift"
    >
      <ProductVisual
        image={product.images[0] ?? (sample ? { key: sample, alt: product.name } : undefined)}
        alt={name}
        categorySlug={product.categorySlug}
        placeholderLabel=""
        sizes="72px"
        className="size-16 shrink-0 rounded-media sm:size-[4.5rem]"
      />
      <span className="min-w-0">
        <span className="block text-sm font-semibold leading-snug group-hover:text-brand-700">{name}</span>
        {price !== null && (
          <span className="mt-0.5 block text-sm text-ink-700">
            {product.pricingMode === "per_sqft" ? t("perSqft", { price: formatLKR(price) }) : t("from", { price: formatLKR(price) })}
          </span>
        )}
      </span>
    </Link>
  );
}
