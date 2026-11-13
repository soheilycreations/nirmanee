"use client";

import { useState } from "react";
import { PackageSearch } from "lucide-react";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { buttonClass } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { whatsappUrl } from "@/lib/site";

const orderSchema = z.string().trim().regex(/^NP-\d{2}-\d{4,8}$/i);
const phoneSchema = z.string().trim().regex(/^\+?[\d\s-]{9,15}$/);

const input = "mt-1 h-11 w-full rounded-control border bg-surface px-3 text-[16px] focus:outline-none";

/**
 * Order lookup form. Until online checkout launches there are no web orders to
 * look up, so a valid submission shows the "coming soon" notice + WhatsApp link.
 */
export function TrackForm() {
  const t = useTranslations("track");
  const [order, setOrder] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<{ order?: string; phone?: string }>({});
  const [submitted, setSubmitted] = useState(false);

  return (
    <div>
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          const next = {
            order: orderSchema.safeParse(order).success ? undefined : t("errorOrder"),
            phone: phoneSchema.safeParse(phone).success ? undefined : t("errorPhone"),
          };
          setErrors(next);
          setSubmitted(!next.order && !next.phone);
        }}
        className="mt-6 space-y-4 rounded-card border border-line bg-surface p-5 shadow-card"
      >
        <label className="block text-sm font-medium">
          {t("orderNumber")}
          <input
            value={order}
            onChange={(e) => setOrder(e.target.value.toUpperCase())}
            autoComplete="off"
            placeholder="NP-26-000123"
            aria-invalid={Boolean(errors.order) || undefined}
            aria-describedby="order-help"
            className={`${input} ${errors.order ? "border-danger-600" : "border-line focus:border-brand-400"}`}
          />
          <span id="order-help" className={`mt-1 block text-xs ${errors.order ? "text-danger-600" : "text-ink-500"}`}>{errors.order ?? t("orderNumberHint")}</span>
        </label>
        <label className="block text-sm font-medium">
          {t("phone")}
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="077 123 4567"
            aria-invalid={Boolean(errors.phone) || undefined}
            aria-describedby="phone-help"
            className={`${input} ${errors.phone ? "border-danger-600" : "border-line focus:border-brand-400"}`}
          />
          {errors.phone && <span id="phone-help" className="mt-1 block text-xs text-danger-600">{errors.phone}</span>}
        </label>
        <button type="submit" className={buttonClass({ size: "lg", full: true })}>
          <PackageSearch className="size-5" aria-hidden="true" /> {t("submit")}
        </button>
      </form>

      <div aria-live="polite">
        {submitted && (
          <div className="mt-4 rounded-card bg-accent-50 p-5">
            <p className="font-semibold">{t("notAvailableTitle")}</p>
            <p className="mt-1 text-sm text-ink-700">{t("notAvailableText")}</p>
            <a
              href={whatsappUrl(t("whatsappMessage", { order: order.trim(), phone: phone.trim() }))}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClass({ variant: "whatsapp", className: "mt-3" })}
            >
              <WhatsAppIcon /> {t("askWhatsapp")}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
