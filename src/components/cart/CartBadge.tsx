"use client";

import { ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart } from "./CartProvider";

export function CartBadge() {
  const t = useTranslations("nav");
  const { count } = useCart();
  const n = count ?? 0;
  return (
    <Link
      href="/cart"
      aria-label={t("cartWithCount", { count: n })}
      className="relative inline-flex size-11 items-center justify-center rounded-control text-ink-900 hover:bg-paper-200"
    >
      <ShoppingBag className="size-6" aria-hidden="true" strokeWidth={1.75} />
      {n > 0 && (
        <span className="absolute right-1 top-1 flex min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-white">
          {n}
        </span>
      )}
    </Link>
  );
}
