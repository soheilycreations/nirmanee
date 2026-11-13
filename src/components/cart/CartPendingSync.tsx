"use client";

import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useCart } from "./CartProvider";

/**
 * When the visitor opens the cart while an optimistic "Add to cart" is still
 * saving, show a notice and re-render the cart as soon as the save finishes.
 */
export function CartPendingSync() {
  const t = useTranslations("cart");
  const { pending } = useCart();
  const router = useRouter();
  const previous = useRef(pending);

  useEffect(() => {
    if (previous.current > 0 && pending === 0) router.refresh();
    previous.current = pending;
  }, [pending, router]);

  if (pending === 0) return null;
  return (
    <p role="status" className="mt-4 flex items-center gap-2 rounded-control bg-brand-50 p-3 text-sm font-medium text-brand-700">
      <Loader2 className="size-4 animate-spin" aria-hidden="true" /> {t("saving")}
    </p>
  );
}
