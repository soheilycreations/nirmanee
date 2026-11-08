import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ShopView, parseSort } from "@/components/shop/ShopView";
import { getCategory } from "@/features/catalog/queries";
import { pick } from "@/features/catalog/types";
import { pageMetadata } from "@/lib/seo/metadata";

type Props = {
  params: Promise<{ locale: string; category: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale, category: slug } = await params;
  const sp = await searchParams;
  const category = await getCategory(slug);
  if (!category) return {};
  const t = await getTranslations({ locale, namespace: "meta" });
  const name = pick(category.name, locale);
  return pageMetadata({
    locale,
    path: `/shop/${category.slug}`,
    title: `${name} — Kalutara`,
    description: t("categoryDescription", { name, description: pick(category.description, locale) }),
    noindex: Boolean(sp.q || sp.sort),
  });
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { locale, category: slug } = await params;
  setRequestLocale(locale);
  const category = await getCategory(slug);
  if (!category) notFound();
  const sp = await searchParams;
  return <ShopView category={category} q={typeof sp.q === "string" ? sp.q.slice(0, 100) : ""} sort={parseSort(sp.sort)} />;
}
