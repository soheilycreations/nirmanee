import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ShopView, parseSort } from "@/components/shop/ShopView";
import { pageMetadata } from "@/lib/seo/metadata";

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params;
  const sp = await searchParams;
  const t = await getTranslations({ locale, namespace: "meta" });
  // Search/sort result pages are not indexed (canonical = /shop).
  return pageMetadata({ locale, path: "/shop", title: t("shopTitle"), description: t("shopDescription"), noindex: Boolean(sp.q || sp.sort) });
}

export default async function ShopPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  return <ShopView category={null} q={typeof sp.q === "string" ? sp.q.slice(0, 100) : ""} sort={parseSort(sp.sort)} />;
}
