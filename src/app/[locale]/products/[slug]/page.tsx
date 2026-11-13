import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getCatalog, getProductBySlug } from "@/features/catalog/queries";
import { routing } from "@/i18n/routing";
import { IntlIsland } from "@/i18n/IntlIsland";
import { ProductGallery } from "@/components/product/ProductGallery";
import { OrderJourney } from "@/components/home/OrderJourney";
import { resolveImageSrc } from "@/lib/images";
import { fromPrice, pick } from "@/features/catalog/types";
import { relatedProducts } from "@/features/catalog/related";
import { getPublicSettings } from "@/features/settings/queries";
import { productSampleFor } from "@/lib/assets";
import { ProductVisual } from "@/components/shop/ProductVisual";
import { ProductCard } from "@/components/shop/ProductCard";
import { DeliveryLine } from "@/components/shop/DeliveryLine";
import { Customizer } from "@/components/product/Customizer";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { formatLKR } from "@/lib/format";
import { isUploadConfigured, siteUrl } from "@/lib/env";
import { JsonLd } from "@/lib/seo/jsonld";
import { localizedPath, pageMetadata } from "@/lib/seo/metadata";
import { whatsappUrl } from "@/lib/site";

// Static (ISR): all products are pre-rendered; new products render on first visit.
export const revalidate = 3600;

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  const { products } = await getCatalog();
  return routing.locales.flatMap((locale) => products.map((p) => ({ locale, slug: p.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  const name = pick(product.name, locale);
  return pageMetadata({
    locale,
    path: `/products/${product.slug}`,
    title: `${name} — Kalutara`,
    description: pick(product.shortDescription, locale) || pick(product.description, locale).slice(0, 160),
  });
}

export default async function ProductPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const product = await getProductBySlug(slug);
  if (!product) notFound(); // real 404 for unknown products

  const t = await getTranslations();
  const [{ categories, products }, settings] = await Promise.all([getCatalog(), getPublicSettings()]);
  const category = categories.find((c) => c.slug === product.categorySlug);
  const name = pick(product.name, locale);
  const price = fromPrice(product);
  const sample = productSampleFor(product.slug, product.images.length > 0);
  // Same category first, topped up from related categories; hidden when fewer than 3.
  const { items: relatedItems, sameCategoryOnly } = relatedProducts(product, categories, products);
  const related = relatedItems.length >= 3 ? relatedItems : [];
  const url = `${siteUrl()}${localizedPath(locale, `/products/${product.slug}`)}`;

  // Product structured data — no ratings until real reviews exist.
  const productJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description: pick(product.description, locale),
    sku: product.slug,
    category: category ? pick(category.name, locale) : undefined,
    brand: { "@type": "Brand", name: "Nirmanee Digital Print House" },
    url,
    ...(product.images[0] ? { image: product.images.map((i) => `${i.key.startsWith("/") ? siteUrl() : ""}${resolveImageSrc(i.key)}`) } : {}),
    ...(price !== null && product.orderType === "fixed"
      ? {
          offers: {
            "@type": "Offer",
            priceCurrency: "LKR",
            price: price.toFixed(2),
            availability: "https://schema.org/InStock",
            url,
            seller: { "@id": `${siteUrl()}/#business` },
          },
        }
      : {}),
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: t("nav.shop"), item: `${siteUrl()}${localizedPath(locale, "/shop")}` },
      ...(category ? [{ "@type": "ListItem", position: 2, name: pick(category.name, locale), item: `${siteUrl()}${localizedPath(locale, `/shop/${category.slug}`)}` }] : []),
      { "@type": "ListItem", position: category ? 3 : 2, name, item: url },
    ],
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pb-32 pt-4 sm:pt-8 lg:pb-16">
      <nav aria-label={t("product.breadcrumb")} className="text-sm text-ink-500">
        <ol className="flex flex-wrap items-center gap-1">
          <li><Link href="/shop" className="inline-flex min-h-11 items-center hover:text-brand-600">{t("nav.shop")}</Link></li>
          {category && (
            <>
              <li aria-hidden="true">/</li>
              <li><Link href={`/shop/${category.slug}`} className="inline-flex min-h-11 items-center hover:text-brand-600">{pick(category.name, locale)}</Link></li>
            </>
          )}
        </ol>
      </nav>

      <div className="mt-2 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-12">
        <div className="lg:sticky lg:top-24 lg:self-start">
          {product.images.length > 0 ? (
            <IntlIsland namespaces={["product"]}>
              <ProductGallery images={product.images.map((img) => ({ src: resolveImageSrc(img.key), alt: pick(img.alt, locale) }))} />
            </IntlIsland>
          ) : (
            <ProductVisual
              image={sample ? { key: sample, alt: product.name } : undefined}
              alt={name}
              categorySlug={product.categorySlug}
              placeholderLabel={t("common.photoComingSoon")}
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
              sampleLabel={sample ? t("common.sampleImage") : undefined}
              className="aspect-[4/3] rounded-sheet sm:aspect-square"
            />
          )}
          <div className="mt-6 hidden lg:block">
            <ProductDetails product={product} locale={locale} />
          </div>
        </div>

        <div>
          <h1 className="text-[1.75rem] leading-tight sm:text-display-sm">{name}</h1>
          <p className="mt-2 text-ink-700">{pick(product.shortDescription, locale)}</p>
          {price !== null && (
            <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xl font-semibold">
              <span>{product.pricingMode === "per_sqft" ? t("common.perSqft", { price: formatLKR(price) }) : t("common.from", { price: formatLKR(price) })}</span>{" "}
              {product.orderType === "quote" && <span className="rounded-full bg-accent-100 px-2.5 py-0.5 text-xs font-semibold text-accent-700">{t("common.quoteBadge")}</span>}
            </p>
          )}
          <DeliveryLine days={product.productionDays} className="mt-3" />

          <div className="mt-8">
            <IntlIsland namespaces={["product", "uploader"]}>
              <Customizer product={product} uploadsEnabled={isUploadConfigured()} revisionFee={settings.revision_fee_lkr} />
            </IntlIsland>
          </div>

          <a
            href={whatsappUrl(t("product.whatsappMessage", { product: name }))}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-whatsapp hover:underline"
          >
            <WhatsAppIcon className="size-4" /> {t("product.whatsappAsk")}
          </a>

          <div className="mt-8 lg:hidden">
            <ProductDetails product={product} locale={locale} />
          </div>

          <div className="mt-10 rounded-card border border-line bg-surface p-5">
            <OrderJourney freeRevisions={settings.free_revisions} compact headingLevel={2} />
          </div>
        </div>
      </div>

      {related.length > 0 && category && (
        <section aria-labelledby="related" className="mt-16">
          <h2 id="related" className="text-2xl">{sameCategoryOnly ? t("product.relatedTitle", { category: pick(category.name, locale) }) : t("product.relatedMixedTitle")}</h2>
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {related.map((p) => (<li key={p.slug}><ProductCard product={p} /></li>))}
          </ul>
        </section>
      )}

      <JsonLd data={productJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
    </div>
  );
}

async function ProductDetails({ product, locale }: { product: NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>; locale: string }) {
  const t = await getTranslations("product");
  return (
    <section aria-labelledby="details" className="space-y-4">
      <h2 id="details" className="text-xl">{t("details")}</h2>
      <p className="text-ink-700">{pick(product.description, locale)}</p>
      {product.specs.length > 0 && (
        <div>
          <h3 className="font-sans text-sm font-semibold uppercase tracking-wider text-ink-500">{t("specs")}</h3>
          <dl className="mt-2 divide-y divide-line rounded-card border border-line bg-surface text-sm">
            {product.specs.map((s) => (
              <div key={s.label} className="flex justify-between gap-4 px-4 py-2.5">
                <dt className="text-ink-500">{s.label}</dt>
                <dd className="text-right font-medium">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </section>
  );
}
