"use client";

import { useLocale, useTranslations } from "next-intl";
import { Languages } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

export function LanguageSwitcher({ className }: { className?: string }) {
  const t = useTranslations("common");
  const locale = useLocale();
  // Concrete path without the locale prefix (no `pathnames` config is used).
  const pathname = usePathname();
  const target = locale === "si" ? "en" : "si";

  return (
    <Link
      href={pathname}
      locale={target}
      hrefLang={target}
      lang={target}
      aria-label={t("switchLanguageLabel")}
      className={cn(
        "inline-flex h-11 items-center gap-1.5 rounded-control px-3 text-sm font-medium text-ink-700 hover:bg-paper-200",
        className,
      )}
    >
      <Languages className="size-4" aria-hidden="true" />
      {t("switchLanguage")}
    </Link>
  );
}
