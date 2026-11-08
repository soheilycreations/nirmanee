import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { fontVariables } from "../fonts";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFab } from "@/components/layout/WhatsAppFab";
import { JsonLd, localBusinessJsonLd } from "@/lib/seo/jsonld";
import { isSupabaseConfigured, siteUrl } from "@/lib/env";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: t("siteName"), template: `%s | ${t("siteName")}` },
    description: t("homeDescription"),
    applicationName: "Nirmanee Digital Print House",
    icons: { icon: "/images/brand/nirmanee-logo.jpg", apple: "/images/brand/nirmanee-logo.jpg" },
    formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = { themeColor: "#0070c0" };

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("common");
  const demo = !isSupabaseConfigured();

  return (
    <html lang={locale} className={fontVariables}>
      <body className="flex min-h-screen flex-col antialiased">
        <NextIntlClientProvider>
          <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-control focus:bg-surface focus:px-4 focus:py-3 focus:shadow-lift">
            {t("skipToContent")}
          </a>
          {demo && (
            <p className="bg-accent-100 px-4 py-1.5 text-center text-xs text-accent-700">{t("demoBanner")}</p>
          )}
          <Header />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
          <WhatsAppFab />
          <JsonLd data={localBusinessJsonLd()} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
