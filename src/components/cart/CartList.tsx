"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Minus, Paperclip, Plus, Store, Trash2, Truck } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { removeCartItemRequest, updateCartQuantityRequest } from "@/features/cart/client";
import type { Product } from "@/features/catalog/types";
import { computePrice, type DesignMode, type Turnaround } from "@/lib/pricing";
import { formatLKR } from "@/lib/format";
import { whatsappUrl } from "@/lib/site";
import { buttonClass } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { useToast } from "@/components/ui/Toaster";
import { useCart } from "./CartProvider";

export interface CartListLine {
  id: string;
  name: string;
  href: string | null;
  visual: React.ReactNode;
  details: string[];
  quantity: number;
  designMode: DesignMode;
  turnaround: Turnaround;
  skipProof: boolean;
  notes: string | null;
  fileCount: number;
  product: Product | null;
  values: Record<string, string>;
  customSize: { widthIn: number; heightIn: number } | null;
}

export interface CartZone {
  code: string;
  name: string;
  fee: number;
  etaMinDays: number;
  etaMaxDays: number;
}

const UNDO_MS = 6000;
const QTY_DEBOUNCE_MS = 600;

export function CartList({ initialLines, zones, cartRef }: { initialLines: CartListLine[]; zones: CartZone[]; cartRef: string | null }) {
  const t = useTranslations("cart");
  const tt = useTranslations("toast");
  const toast = useToast();
  const cart = useCart();
  const [lines, setLines] = useState(initialLines);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const removeTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const qtyTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const confirmedQty = useRef(new Map(initialLines.map((l) => [l.id, l.quantity])));

  // Keep the header badge in sync with what the server rendered (unless adds are still saving).
  useEffect(() => {
    if (cart.pending === 0) cart.set(initialLines.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only on first render
  }, []);

  // Commit pending removals if the visitor leaves the page before "Undo" expires.
  useEffect(() => {
    const timers = removeTimers.current;
    return () => {
      timers.forEach((timer, id) => {
        clearTimeout(timer);
        void removeCartItemRequest(id);
      });
      timers.clear();
    };
  }, []);

  const visible = lines.filter((l) => !hidden.has(l.id));

  const priced = useMemo(
    () =>
      visible.map((l) => ({
        line: l,
        price: l.product
          ? computePrice(l.product, { values: l.values, customSize: l.customSize, quantity: l.quantity, designMode: l.designMode, turnaround: l.turnaround })
          : null,
      })),
    [visible],
  );
  const subtotal = priced.reduce((sum, p) => sum + (p.price?.ok ? p.price.total : 0), 0);
  const hasEstimate = priced.some((p) => p.price?.ok && p.price.isEstimate);

  function changeQty(id: string, qty: number) {
    const quantity = Math.min(100_000, Math.max(1, Math.floor(qty) || 1));
    setLines((ls) => ls.map((l) => (l.id === id ? { ...l, quantity } : l)));
    const existing = qtyTimers.current.get(id);
    if (existing) clearTimeout(existing);
    qtyTimers.current.set(
      id,
      setTimeout(async () => {
        qtyTimers.current.delete(id);
        const res = await updateCartQuantityRequest(id, quantity);
        if (res.ok) {
          confirmedQty.current.set(id, quantity);
        } else {
          const back = confirmedQty.current.get(id) ?? 1;
          setLines((ls) => ls.map((l) => (l.id === id ? { ...l, quantity: back } : l)));
          toast.show({ message: tt("updateFailed"), tone: "error" });
        }
      }, QTY_DEBOUNCE_MS),
    );
  }

  function remove(line: CartListLine) {
    setHidden((h) => new Set(h).add(line.id));
    cart.adjust(-1);
    const undo = () => {
      const timer = removeTimers.current.get(line.id);
      if (timer) clearTimeout(timer);
      removeTimers.current.delete(line.id);
      setHidden((h) => {
        const next = new Set(h);
        next.delete(line.id);
        return next;
      });
      cart.adjust(1);
    };
    toast.show({ message: tt("removed", { name: line.name }), action: { label: tt("undo"), onClick: undo }, durationMs: UNDO_MS });
    removeTimers.current.set(
      line.id,
      setTimeout(async () => {
        removeTimers.current.delete(line.id);
        const res = await removeCartItemRequest(line.id);
        if (res.ok) {
          setLines((ls) => ls.filter((l) => l.id !== line.id));
        } else {
          undo();
          toast.show({ message: tt("updateFailed"), tone: "error" });
        }
      }, UNDO_MS),
    );
  }

  const designLabel = (m: DesignMode) => t(`design.${m}`);
  const turnaroundLabel = (x: Turnaround) => (x === "express" ? t("turnaroundExpress") : t("turnaroundStandard"));

  const whatsappMessage = [
    t("whatsappIntro"),
    "",
    ...priced.flatMap(({ line, price }, i) => {
      const rows = [
        `${i + 1}. ${line.name} — ${t("waQty", { qty: line.quantity })}`,
        ...line.details.map((d) => `   • ${d}`),
        `   • ${t("waDesign", { mode: designLabel(line.designMode) })}`,
        `   • ${t("waTurnaround", { mode: turnaroundLabel(line.turnaround) })}`,
      ];
      if (line.skipProof) rows.push(`   • ${t("skipProofTag")}`);
      if (line.fileCount > 0) rows.push(`   • ${t("waFiles", { count: line.fileCount })}`);
      if (line.notes) rows.push(`   • ${t("waNotes", { notes: line.notes.slice(0, 300) })}`);
      if (price?.ok) rows.push(`   • ${t("waPrice", { price: formatLKR(price.total) })}${price.isEstimate ? ` (${t("waEstimate")})` : ""}`);
      return [...rows, ""];
    }),
    t("whatsappTotal", { total: formatLKR(subtotal) }),
    ...(cartRef ? [t("waRef", { ref: cartRef })] : []),
  ].join("\n");

  if (visible.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-display-sm font-display">{t("empty")}</p>
        <p className="mt-2 text-ink-700">{t("emptyText")}</p>
        <Link href="/shop" className={buttonClass({ size: "lg", className: "mt-6" })}>{t("continue")}</Link>
      </div>
    );
  }

  return (
    <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <ul className="space-y-3">
        {priced.map(({ line, price }) => (
          <li key={line.id} className="flex gap-3 rounded-card border border-line bg-surface p-3 shadow-card sm:gap-4 sm:p-4">
            {line.href ? <Link href={line.href} className="shrink-0">{line.visual}</Link> : <div className="shrink-0">{line.visual}</div>}
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-sans text-base font-semibold leading-snug">
                  {line.href ? <Link href={line.href} className="hover:text-brand-700">{line.name}</Link> : line.name}
                </h2>
                <p className="shrink-0 font-semibold">{price?.ok ? formatLKR(price.total) : "—"}</p>
              </div>
              {!line.product && <p className="text-sm text-danger-600">{t("unavailableItem")}</p>}
              {line.details.length > 0 && <p className="mt-1 text-sm text-ink-700">{line.details.join(" · ")}</p>}
              <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                <span className="rounded-full bg-brand-50 px-2 py-0.5 font-medium text-brand-700">{designLabel(line.designMode)}</span>
                {line.turnaround === "express" && <span className="rounded-full bg-accent-100 px-2 py-0.5 font-medium text-accent-700">{t("expressTag")}</span>}
                {line.skipProof && <span className="rounded-full bg-paper-200 px-2 py-0.5 font-medium text-ink-700">{t("skipProofTag")}</span>}
                {price?.ok && price.isEstimate && <span className="rounded-full bg-warning-50 px-2 py-0.5 font-medium text-warning-600">{t("estimateTag")}</span>}
              </div>
              <p className="mt-2 flex items-center gap-1 text-xs text-ink-500">
                <Paperclip className="size-3.5" aria-hidden="true" /> {t("files", { count: line.fileCount })}
              </p>
              {line.notes && <p className="mt-1 line-clamp-2 text-xs italic text-ink-500">“{line.notes}”</p>}

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <div className="inline-flex items-center rounded-control border border-line bg-surface" role="group" aria-label={t("quantity")}>
                  <button type="button" onClick={() => changeQty(line.id, line.quantity - 1)} disabled={line.quantity <= 1} aria-label={`${t("quantity")} −`} className="inline-flex size-11 items-center justify-center text-ink-700 hover:text-brand-600 disabled:text-ink-300">
                    <Minus className="size-4" aria-hidden="true" />
                  </button>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={100000}
                    value={line.quantity}
                    aria-label={t("quantity")}
                    onChange={(e) => changeQty(line.id, Number(e.target.value))}
                    className="h-11 w-14 border-x border-line bg-transparent text-center text-[16px] font-semibold focus:outline-none"
                  />
                  <button type="button" onClick={() => changeQty(line.id, line.quantity + 1)} aria-label={`${t("quantity")} +`} className="inline-flex size-11 items-center justify-center text-ink-700 hover:text-brand-600">
                    <Plus className="size-4" aria-hidden="true" />
                  </button>
                </div>
                <button type="button" onClick={() => remove(line)} aria-label={t("removeItem", { name: line.name })} className="inline-flex h-11 items-center gap-1.5 rounded-control px-3 text-sm font-medium text-danger-600 hover:bg-danger-50">
                  <Trash2 className="size-4" aria-hidden="true" /> {t("remove")}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <section className="rounded-card border border-line bg-surface p-5 shadow-card" aria-labelledby="summary">
          <div className="flex items-center justify-between text-lg font-semibold">
            <h2 id="summary" className="font-sans text-lg">{t("subtotal")}</h2>
            <span>{formatLKR(subtotal)}</span>
          </div>
          {hasEstimate && <p className="mt-2 text-xs text-ink-500">{t("estimateNote")}</p>}
          {cartRef && <p className="mt-2 text-xs text-ink-500">{t("cartRef", { ref: cartRef })}</p>}

          <h3 className="mt-5 font-sans text-sm font-semibold">{t("deliveryTitle")}</h3>
          <ul className="mt-2 divide-y divide-line text-sm">
            <li className="flex items-center justify-between gap-3 py-2">
              <span className="flex items-center gap-2"><Store className="size-4 shrink-0 text-brand-600" aria-hidden="true" />{t("deliveryPickup")}</span>
              <span className="font-semibold text-success-600">{t("free")}</span>
            </li>
            {zones.map((z) => (
              <li key={z.code} className="flex items-center justify-between gap-3 py-2">
                <span className="flex items-center gap-2"><Truck className="size-4 shrink-0 text-brand-600" aria-hidden="true" />{z.name}</span>
                <span className="text-right text-ink-700">{t("zoneLine", { fee: formatLKR(z.fee), min: z.etaMinDays, max: z.etaMaxDays })}</span>
              </li>
            ))}
          </ul>
          <p className="mt-1 text-xs text-ink-500">{t("deliveryChooseLater")}</p>

          <div className="mt-5 rounded-control bg-accent-50 p-3">
            <p className="text-sm font-semibold text-ink-900">{t("checkoutSoon")}</p>
            <p className="mt-1 text-xs text-ink-700">{t("checkoutSoonText")}</p>
          </div>
          <a href={whatsappUrl(whatsappMessage)} target="_blank" rel="noopener noreferrer" className={buttonClass({ variant: "whatsapp", size: "lg", full: true, className: "mt-4" })}>
            <WhatsAppIcon /> {t("sendWhatsapp")}
          </a>
          <Link href="/shop" className={buttonClass({ variant: "ghost", full: true, className: "mt-2" })}>{t("continue")}</Link>
        </section>
      </aside>
    </div>
  );
}
