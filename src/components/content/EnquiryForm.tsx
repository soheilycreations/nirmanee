"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { buttonClass } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { whatsappUrl } from "@/lib/site";

const MAX_MESSAGE = 600;

/** Short enquiry form with no backend: it composes the message and opens WhatsApp. */
export function EnquiryForm() {
  const t = useTranslations("contact");
  const id = useId();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const text = message.trim();
    if (!text) {
      setError(true);
      return;
    }
    setError(false);
    const who = name.trim();
    const body = [who ? t("formGreetingNamed", { name: who.slice(0, 80) }) : t("formGreeting"), text.slice(0, MAX_MESSAGE)].join("\n");
    window.open(whatsappUrl(body), "_blank", "noopener,noreferrer");
  }

  const field = "mt-1 w-full rounded-control border border-line bg-surface px-3 text-[16px] focus:border-brand-400 focus:outline-none";
  return (
    <form onSubmit={submit} noValidate className="space-y-4 rounded-card border border-line bg-surface p-5 shadow-card">
      <div>
        <h2 className="font-sans text-lg font-semibold">{t("formTitle")}</h2>
        <p className="mt-1 text-sm text-ink-700">{t("formLead")}</p>
      </div>
      <label className="block" htmlFor={`${id}-name`}>
        <span className="text-sm font-semibold">{t("formName")}</span>
        <input id={`${id}-name`} value={name} onChange={(e) => setName(e.target.value.slice(0, 80))} autoComplete="name" className={`${field} h-11`} />
      </label>
      <label className="block" htmlFor={`${id}-message`}>
        <span className="text-sm font-semibold">{t("formMessage")}</span>
        <textarea
          id={`${id}-message`}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value.slice(0, MAX_MESSAGE));
            if (error) setError(false);
          }}
          rows={4}
          required
          aria-invalid={error}
          aria-describedby={error ? `${id}-error` : undefined}
          placeholder={t("formPlaceholder")}
          className={`${field} py-2`}
        />
        {error && <span id={`${id}-error`} role="alert" className="mt-1 block text-sm text-danger-600">{t("formError")}</span>}
      </label>
      <button type="submit" className={buttonClass({ variant: "whatsapp", full: true })}>
        <WhatsAppIcon /> {t("formSubmit")}
      </button>
      <p className="text-xs text-ink-500">{t("formNote")}</p>
    </form>
  );
}
