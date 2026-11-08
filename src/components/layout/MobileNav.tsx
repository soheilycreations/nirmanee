"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { buttonClass } from "@/components/ui/button";
import { cn } from "@/lib/cn";

export interface NavItem {
  href: string;
  label: string;
}

export function MobileNav({ items, whatsappHref }: { items: NavItem[]; whatsappHref: string }) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // true on the client, false during SSR — the portal needs document.body.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  // Close when the route changes.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const trigger = triggerRef.current;
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
      trigger?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={t("nav.openMenu")}
        className="inline-flex size-11 items-center justify-center rounded-control text-ink-900 hover:bg-paper-200 lg:hidden"
      >
        <Menu className="size-6" aria-hidden="true" />
      </button>

      {mounted &&
        createPortal(
          <div className={cn("fixed inset-0 z-[60] lg:hidden", open ? "visible" : "invisible")} aria-hidden={!open}>
            <div
              className={cn("absolute inset-0 bg-ink-900/40 transition-opacity", open ? "opacity-100" : "opacity-0")}
              onClick={() => setOpen(false)}
            />
            <div
              id="mobile-nav"
              role="dialog"
              aria-modal="true"
              aria-label={t("nav.main")}
              className={cn(
                "absolute inset-y-0 right-0 flex w-[min(20rem,85vw)] flex-col bg-surface shadow-lift transition-transform duration-200",
                open ? "translate-x-0" : "translate-x-full",
              )}
            >
              <div className="flex items-center justify-between border-b border-line px-4 py-2">
                <LanguageSwitcher className="-ml-3" />
                <button
                  ref={closeRef}
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label={t("nav.closeMenu")}
                  className="inline-flex size-11 items-center justify-center rounded-control hover:bg-paper-200"
                >
                  <X className="size-6" aria-hidden="true" />
                </button>
              </div>
              <nav aria-label={t("nav.main")} className="flex-1 overflow-y-auto px-2 py-3">
                <ul>
                  {items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex min-h-12 items-center rounded-control px-3 text-lg font-medium",
                          pathname === item.href ? "bg-brand-50 text-brand-700" : "text-ink-900 hover:bg-paper-200",
                        )}
                        aria-current={pathname === item.href ? "page" : undefined}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="border-t border-line p-4">
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className={buttonClass({ variant: "whatsapp", size: "lg", full: true })}>
                  <WhatsAppIcon /> {t("common.chatOnWhatsapp")}
                </a>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
