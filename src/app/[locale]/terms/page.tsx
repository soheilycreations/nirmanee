import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { LegalPage } from "@/components/content/LegalPage";
import { legalDoc } from "@/content/legal";
import { pageMetadata } from "@/lib/seo/metadata";

export const revalidate = 3600;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const doc = legalDoc("terms", locale);
  return pageMetadata({ locale, path: "/terms", title: doc.title, description: doc.description });
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LegalPage slug="terms" locale={locale} />;
}
