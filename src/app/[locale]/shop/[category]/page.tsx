import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ShopView } from "@/components/shop/ShopView";
import { getCategories, getCategory } from "@/features/catalog/queries";
import { pick } from "@/features/catalog/types";
import { routing } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo/metadata";

export const revalidate = 3600;

type Props = { params: Promise<{ locale: string; category: string }> };

export async function generateStaticParams() {
  const categories = await getCategories();
  return routing.locales.flatMap((locale) => categories.map((c) => ({ locale, category: c.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, category: slug } = await params;
  const category = await getCategory(slug);
  if (!category) return {};
  const t = await getTranslations({ locale, namespace: "meta" });
  const name = pick(category.name, locale);
  return pageMetadata({
    locale,
    path: `/shop/${category.slug}`,
    title: `${name} — Kalutara`,
    description: t("categoryDescription", { name, description: pick(category.description, locale) }),
  });
}

export default async function CategoryPage({ params }: Props) {
  const { locale, category: slug } = await params;
  setRequestLocale(locale);
  const category = await getCategory(slug);
  if (!category) notFound();
  return <ShopView category={category} />;
}
