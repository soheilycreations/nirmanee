import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { CartBadge } from "@/components/cart/CartBadge";
import { whatsappUrl } from "@/lib/site";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MobileNav } from "./MobileNav";

export async function Header() {
  const t = await getTranslations();
  const items = [
    { href: "/shop", label: t("nav.shop") },
    { href: "/services", label: t("nav.services") },
    { href: "/about", label: t("nav.about") },
    { href: "/contact", label: t("nav.contact") },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/85">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4">
        <Link href="/" className="flex min-h-11 items-center gap-2.5" aria-label={t("meta.siteName")}>
          <Image src="/images/brand/nirmanee-logo.jpg" alt="" width={40} height={40} className="size-10 rounded-full" priority />
          <span className="flex flex-col leading-none">
            <span className="font-display text-xl font-semibold text-ink-900">Nirmanee</span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-600">Digital Print House</span>
          </span>
        </Link>

        <nav aria-label={t("nav.main")} className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {items.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="inline-flex h-11 items-center rounded-control px-4 text-[15px] font-medium text-ink-700 hover:bg-paper-200 hover:text-ink-900">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1">
          <LanguageSwitcher className="hidden sm:inline-flex" />
          <CartBadge />
          <MobileNav items={items} whatsappHref={whatsappUrl()} />
        </div>
      </div>
    </header>
  );
}
