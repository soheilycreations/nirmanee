"use client";

import { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import { Check, Minus, Paintbrush, Plus, ShoppingBag, Upload, LayoutTemplate } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { addToCartRequest } from "@/features/cart/client";
import { availableDesignModes, pick, type Product, type ProductOption } from "@/features/catalog/types";
import { computePrice, CUSTOM_SIZE_VALUE, perimeterFeet, type DesignMode, type ModifierType, type Turnaround } from "@/lib/pricing";
import { useCart } from "@/components/cart/CartProvider";
import { useToast } from "@/components/ui/Toaster";
import { formatLKR } from "@/lib/format";
import { buttonClass } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { Uploader, type UploadState } from "./Uploader";

function defaultValues(product: Product): Record<string, string> {
  const values: Record<string, string> = {};
  for (const o of product.options) {
    if (o.values.length === 0) continue;
    const def = o.values.find((v) => v.isDefault) ?? (o.isRequired ? o.values[0] : undefined);
    if (def) values[o.code] = def.value;
  }
  return values;
}

function modifierLabel(
  type: ModifierType,
  amount: number,
  labels: { perSqft: (p: string) => string; perRunningFt: (p: string) => string },
): string | null {
  if (amount === 0) return null;
  if (type === "percent") return `+${amount}%`;
  if (type === "per_sqft") return `+${labels.perSqft(formatLKR(amount))}`;
  if (type === "per_running_ft") return `+${labels.perRunningFt(formatLKR(amount))}`;
  return `+${formatLKR(amount)}`;
}

const chip =
  "flex min-h-11 cursor-pointer items-center gap-2 rounded-control border border-line bg-surface px-3 py-2 text-sm transition-colors " +
  "hover:border-ink-300 has-[:checked]:border-primary has-[:checked]:bg-brand-50 has-[:checked]:text-brand-700 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-focus";

export function Customizer({
  product,
  uploadsEnabled,
  revisionFee,
}: {
  product: Product;
  uploadsEnabled: boolean;
  revisionFee: number;
}) {
  const t = useTranslations("product");
  const tc = useTranslations("common");
  const tu = useTranslations("uploader");
  const tt = useTranslations("toast");
  const cart = useCart();
  const toast = useToast();
  const modLabels = {
    perSqft: (p: string) => tc("perSqft", { price: p }),
    perRunningFt: (p: string) => t("perRunningFt", { price: p }),
  };
  const locale = useLocale();
  const modes = availableDesignModes(product);
  const productName = pick(product.name, locale);

  const [designMode, setDesignMode] = useState<DesignMode>(modes[0]);
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>(() => defaultValues(product));
  const [custom, setCustom] = useState<{ w: string; h: string }>({ w: "", h: "" });
  const [quantity, setQuantity] = useState(1);
  const [turnaround, setTurnaround] = useState<Turnaround>("standard");
  const [skipProof, setSkipProof] = useState(false);
  const [notes, setNotes] = useState("");
  const [uploads, setUploads] = useState<UploadState>({ uploadedIds: [], busy: false });
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const sizeOption = product.options.find((o) => o.type === "size");
  const sizeUnit = sizeOption?.config.unit ?? "in";
  const unitFactor = sizeUnit === "ft" ? 12 : 1;
  const photoOption = product.options.find((o) => o.type === "photo_slots");
  const sizeChoice = values[sizeOption?.code ?? ""];
  const customSize = useMemo(
    () =>
      sizeChoice === CUSTOM_SIZE_VALUE && Number(custom.w) > 0 && Number(custom.h) > 0
        ? { widthIn: Number(custom.w) * unitFactor, heightIn: Number(custom.h) * unitFactor }
        : null,
    [sizeChoice, custom.w, custom.h, unitFactor],
  );

  const unitLabel = sizeUnit === "ft" ? t("unitFt") : t("unitIn");
  const fmtDim = (inches: number) => `${Number((inches / unitFactor).toFixed(2))} ${unitLabel}`;
  const sizeErrors = useMemo(() => {
    if (!sizeOption || sizeChoice !== CUSTOM_SIZE_VALUE) return [];
    const cfg = sizeOption.config;
    const errs: string[] = [];
    const w = Number(custom.w) * unitFactor;
    const h = Number(custom.h) * unitFactor;
    const fmt = (inches: number) => `${Number((inches / unitFactor).toFixed(2))} ${sizeUnit === "ft" ? t("unitFt") : t("unitIn")}`;
    if (custom.w !== "" && cfg.min_width_in !== undefined && w < cfg.min_width_in) errs.push(t("sizeMinWidth", { min: fmt(cfg.min_width_in) }));
    if (custom.w !== "" && cfg.max_width_in !== undefined && w > cfg.max_width_in) errs.push(t("sizeMaxWidth", { max: fmt(cfg.max_width_in) }));
    if (custom.h !== "" && cfg.min_height_in !== undefined && h < cfg.min_height_in) errs.push(t("sizeMinHeight", { min: fmt(cfg.min_height_in) }));
    if (custom.h !== "" && cfg.max_height_in !== undefined && h > cfg.max_height_in) errs.push(t("sizeMaxHeight", { max: fmt(cfg.max_height_in) }));
    return errs;
  }, [sizeOption, sizeChoice, custom.w, custom.h, unitFactor, sizeUnit, t]);

  const choiceValues = useMemo(() => {
    const v: Record<string, string> = {};
    for (const o of product.options) {
      if (o.type !== "text" && o.type !== "photo_slots" && values[o.code]) v[o.code] = values[o.code];
    }
    return v;
  }, [product.options, values]);

  const price = useMemo(
    () => computePrice(product, { values: choiceValues, customSize, quantity, designMode, turnaround }),
    [product, choiceValues, customSize, quantity, designMode, turnaround],
  );

  const onUploads = useCallback((s: UploadState) => setUploads(s), []);
  const setValue = (code: string, value: string) => {
    setValues((prev) => ({ ...prev, [code]: value }));
    setAdded(false);
  };

  const optionLabel = (o: ProductOption) => pick(o.label, locale);

  function validate(): string | null {
    if (designMode === "template" && !templateId) return t("errorTemplate");
    if (uploads.busy) return t("errorUploading");
    for (const o of product.options) {
      if (o.type === "text" && o.isRequired && !values[o.code]?.trim()) return t("errorText", { option: optionLabel(o) });
    }
    if (!price.ok) {
      if (price.error.code === "invalid_size") return t("errorSize");
      const err = price.error;
      if (err.code === "missing_option") {
        const o = product.options.find((x) => x.code === err.option);
        return t("errorMissing", { option: o ? optionLabel(o) : err.option });
      }
      return t("errorGeneric");
    }
    return null;
  }

  /**
   * Optimistic add: the badge and toast update immediately; the item is saved
   * in the background and both are rolled back if the server rejects it.
   */
  function submit() {
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setAdded(true);
    cart.adjust(1);
    cart.beginSave();
    const toastId = toast.show({ message: tt("added"), tone: "success", action: { label: tt("viewCart"), href: "/cart" } });

    const textValues = Object.fromEntries(
      product.options.filter((o) => o.type === "text" && values[o.code]).map((o) => [o.code, values[o.code]]),
    );
    void addToCartRequest({
      productSlug: product.slug,
      values: { ...choiceValues, ...textValues },
      customSize,
      quantity,
      designMode,
      templateId: designMode === "template" ? templateId : null,
      turnaround,
      skipProof: designMode === "upload" && skipProof,
      notes,
      fileIds: uploads.uploadedIds,
    })
      .then((res) => {
        if (res.ok) {
          cart.set(res.cartCount);
          return;
        }
        rollback();
        if (res.error === "missing_text" || res.error === "missing_option") {
          const o = product.options.find((x) => x.code === res.option);
          setError(res.error === "missing_text" ? t("errorText", { option: o ? optionLabel(o) : "" }) : t("errorMissing", { option: o ? optionLabel(o) : "" }));
        } else if (res.error === "invalid_size") {
          setError(t("errorSize"));
        } else if (res.error === "template") {
          setError(t("errorTemplate"));
        } else {
          setError(t("errorGeneric"));
        }
      })
      .catch(() => {
        rollback();
        setError(t("errorGeneric"));
      })
      .finally(() => cart.endSave());

    function rollback() {
      setAdded(false);
      cart.adjust(-1);
      toast.dismiss(toastId);
      toast.show({ message: tt("addFailed"), tone: "error" });
    }
  }

  const totalLabel = price.ok ? formatLKR(price.total) : "—";
  const isEstimate = price.ok && price.isEstimate;

  const pathMeta: Record<DesignMode, { icon: typeof Upload; title: string; text: string; fee: string }> = {
    upload: { icon: Upload, title: t("pathUpload"), text: t("pathUploadText"), fee: t("pathFree") },
    design_for_me: {
      icon: Paintbrush,
      title: t("pathDesign"),
      text: t("pathDesignText"),
      fee: product.designFee > 0 ? t("pathFee", { price: formatLKR(product.designFee) }) : t("pathFree"),
    },
    template: { icon: LayoutTemplate, title: t("pathTemplate"), text: t("pathTemplateText"), fee: t("pathFree") },
  };

  const choiceOptions = product.options.filter((o) => o.type !== "text" && o.type !== "photo_slots");
  const textOptions = product.options.filter((o) => o.type === "text");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="space-y-8"
      noValidate
    >
      {/* 1. Design path */}
      <fieldset>
        <legend className="font-sans text-lg font-semibold">{t("step1")}</legend>
        <div className={cn("mt-3 grid gap-2", modes.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2")}>
          {modes.map((mode) => {
            const m = pathMeta[mode];
            return (
              <label key={mode} className={cn(chip, "flex-col items-start gap-1 p-3")}>
                <input
                  type="radio"
                  name="design_mode"
                  value={mode}
                  checked={designMode === mode}
                  onChange={() => {
                    setDesignMode(mode);
                    setAdded(false);
                    if (mode !== "upload") setSkipProof(false);
                  }}
                  className="sr-only"
                />
                <span className="flex w-full items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-2 font-semibold text-ink-900"><m.icon className="size-4" aria-hidden="true" />{m.title}</span>
                  <span className="text-xs font-semibold text-accent-700">{m.fee}</span>
                </span>
                <span className="text-xs text-ink-500">{m.text}</span>
              </label>
            );
          })}
        </div>

        {designMode === "template" && (
          <fieldset className="mt-4">
            <legend className="text-sm font-semibold">{t("chooseTemplate")}</legend>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {product.templates.map((tpl) => (
                <label key={tpl.id} className="cursor-pointer rounded-control border border-line bg-surface p-1.5 has-[:checked]:border-primary has-[:checked]:ring-2 has-[:checked]:ring-brand-200">
                  <input type="radio" name="template" value={tpl.id} checked={templateId === tpl.id} onChange={() => setTemplateId(tpl.id)} className="sr-only" />
                  <Image src={tpl.previewKey} alt="" width={200} height={150} unoptimized className="aspect-[4/3] w-full rounded-[8px] object-cover" />
                  <span className="mt-1 block text-center text-xs font-medium">{pick(tpl.name, locale)}</span>
                </label>
              ))}
            </div>
            {(() => {
              const tpl = product.templates.find((x) => x.id === templateId);
              if (!tpl) return null;
              const fields = tpl.textFields.map((f) => t(`templateText_${f}` as "templateText_name")).join(", ");
              return (
                <p className="mt-2 text-xs text-ink-500">
                  {pick(tpl.name, locale)}: {t("templatePhotos", { count: tpl.photoSlots })}
                  {fields ? ` + ${fields}` : ""}
                </p>
              );
            })()}
          </fieldset>
        )}
      </fieldset>

      {/* 2. Options */}
      {(choiceOptions.length > 0 || textOptions.length > 0) && (
        <div className="space-y-5">
          <h2 className="font-sans text-lg font-semibold">{t("step2")}</h2>
          {choiceOptions.map((o) => (
            <fieldset key={o.code}>
              <legend className="text-sm font-semibold">{optionLabel(o)}</legend>
              {o.type === "color" ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {o.values.map((v) => (
                    <label key={v.value} className={chip}>
                      <input type="radio" name={o.code} value={v.value} checked={values[o.code] === v.value} onChange={() => setValue(o.code, v.value)} className="sr-only" />
                      <span className="size-5 rounded-full border border-ink-300" style={{ backgroundColor: v.swatchHex ?? "transparent" }} aria-hidden="true" />
                      {pick(v.label, locale)}
                      {modifierLabel(v.modifierType, v.priceModifier, modLabels) && (
                        <span className="text-xs text-ink-500">{modifierLabel(v.modifierType, v.priceModifier, modLabels)}</span>
                      )}
                    </label>
                  ))}
                </div>
              ) : (
                <div className="mt-2 flex flex-wrap gap-2">
                  {o.values.map((v) => {
                    const mod = modifierLabel(v.modifierType, v.priceModifier, modLabels);
                    return (
                      <label key={v.value} className={chip}>
                        <input type="radio" name={o.code} value={v.value} checked={values[o.code] === v.value} onChange={() => setValue(o.code, v.value)} className="sr-only" />
                        <span>{pick(v.label, locale)}</span>
                        {mod && <span className="text-xs text-ink-500">{mod}</span>}
                      </label>
                    );
                  })}
                  {o.type === "size" && o.config.allow_custom && (
                    <label className={chip}>
                      <input type="radio" name={o.code} value={CUSTOM_SIZE_VALUE} checked={values[o.code] === CUSTOM_SIZE_VALUE} onChange={() => setValue(o.code, CUSTOM_SIZE_VALUE)} className="sr-only" />
                      {t("customSize")}
                    </label>
                  )}
                </div>
              )}
              {(() => {
                const chosen = o.values.find((v) => v.value === values[o.code]);
                if (!chosen || chosen.modifierType !== "per_running_ft" || !price.ok || !price.printSize) return null;
                return (
                  <p className="mt-2 text-xs text-ink-500">
                    {t("eyeletsNote", { label: pick(chosen.label, locale), price: formatLKR(chosen.priceModifier), feet: perimeterFeet(price.printSize) })}
                  </p>
                );
              })()}
              {o.type === "size" && values[o.code] === CUSTOM_SIZE_VALUE && (
                <div className="mt-3 grid max-w-sm grid-cols-2 gap-3">
                  {(["w", "h"] as const).map((dim) => (
                    <label key={dim} className="text-sm">
                      <span className="font-medium">{dim === "w" ? t("width") : t("height")} ({sizeUnit === "ft" ? t("unitFt") : t("unitIn")})</span>
                      <input
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step="0.5"
                        value={custom[dim]}
                        onChange={(e) => setCustom((c) => ({ ...c, [dim]: e.target.value }))}
                        aria-invalid={sizeErrors.length > 0 || undefined}
                        aria-describedby={`${o.code}-size-help`}
                        className={cn(
                          "mt-1 h-11 w-full rounded-control border bg-surface px-3 text-[16px] focus:outline-none",
                          sizeErrors.length > 0 ? "border-danger-600" : "border-line focus:border-brand-400",
                        )}
                      />
                    </label>
                  ))}
                  <div id={`${o.code}-size-help`} className="col-span-2" aria-live="polite">
                    {sizeErrors.length > 0 ? (
                      <ul className="space-y-0.5 text-xs font-medium text-danger-600">
                        {sizeErrors.map((e) => (<li key={e}>{e}</li>))}
                      </ul>
                    ) : (
                      o.config.min_width_in !== undefined &&
                      o.config.max_width_in !== undefined && (
                        <p className="text-xs text-ink-500">
                          {t("sizeLimits", { min: fmtDim(o.config.min_width_in), max: fmtDim(o.config.max_width_in) })}
                        </p>
                      )
                    )}
                  </div>
                </div>
              )}
            </fieldset>
          ))}
          {textOptions.map((o) => {
            const max = o.config.max_length ?? 200;
            const v = values[o.code] ?? "";
            return (
              <label key={o.code} className="block">
                <span className="text-sm font-semibold">{optionLabel(o)}{o.isRequired && <span className="text-danger-600"> *</span>}</span>
                <input
                  type="text"
                  value={v}
                  maxLength={max}
                  required={o.isRequired}
                  placeholder={t("textPlaceholder")}
                  onChange={(e) => setValue(o.code, e.target.value)}
                  className="mt-1 h-11 w-full rounded-control border border-line bg-surface px-3 text-[16px] placeholder:text-ink-300 focus:border-brand-400 focus:outline-none"
                />
                <span className="mt-1 block text-xs text-ink-500">{t("charsLeft", { count: max - v.length })}</span>
              </label>
            );
          })}
        </div>
      )}

      {/* 3. Files / brief */}
      <div className="space-y-3">
        <h2 className="font-sans text-lg font-semibold">{t("step3")}</h2>
        {/* Shown for every path: reference photos help "Design it for me" and templates too. */}
        <Uploader
            enabled={uploadsEnabled}
            productName={productName}
            printSize={price.ok ? price.printSize : null}
            largeFormat={product.pricingMode === "per_sqft"}
            sizeUnit={sizeUnit}
            photoSlots={photoOption?.config.count ?? null}
            onChange={onUploads}
          />
        {uploadsEnabled && <p className="text-xs text-ink-500">{tu("sendLaterNote")}</p>}
        <label className="block">
          <span className="text-sm font-semibold">{designMode === "design_for_me" ? t("designBrief") : t("notes")}</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={4000}
            rows={3}
            placeholder={designMode === "design_for_me" ? t("designBriefPlaceholder") : t("notesPlaceholder")}
            className="mt-1 w-full rounded-control border border-line bg-surface px-3 py-2 text-[16px] placeholder:text-ink-300 focus:border-brand-400 focus:outline-none"
          />
        </label>
        {designMode === "upload" && (
          <label className="flex cursor-pointer gap-3 rounded-control border border-line bg-surface p-3">
            <input type="checkbox" checked={skipProof} onChange={(e) => setSkipProof(e.target.checked)} className="mt-1 size-5 shrink-0 accent-primary" />
            <span>
              <span className="block text-sm font-semibold">{t("skipProof")}</span>
              <span className="block text-xs text-ink-500">{t("skipProofText")}</span>
            </span>
          </label>
        )}
      </div>

      {/* 4. Quantity & turnaround */}
      <div className="space-y-5">
        <h2 className="font-sans text-lg font-semibold">{t("step4")}</h2>
        <div>
          <span className="text-sm font-semibold" id="qty-label">{t("quantity")}</span>
          <div className="mt-2 flex items-center gap-3">
            <div className="inline-flex items-center rounded-control border border-line bg-surface" role="group" aria-labelledby="qty-label">
              <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label={t("decrease")} className="inline-flex size-11 items-center justify-center text-ink-700 hover:text-brand-600">
                <Minus className="size-4" aria-hidden="true" />
              </button>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                max={100000}
                value={quantity}
                aria-labelledby="qty-label"
                onChange={(e) => setQuantity(Math.min(100000, Math.max(1, Math.floor(Number(e.target.value) || 1))))}
                className="h-11 w-16 border-x border-line bg-transparent text-center text-[16px] font-semibold focus:outline-none"
              />
              <button type="button" onClick={() => setQuantity((q) => Math.min(100000, q + 1))} aria-label={t("increase")} className="inline-flex size-11 items-center justify-center text-ink-700 hover:text-brand-600">
                <Plus className="size-4" aria-hidden="true" />
              </button>
            </div>
            {price.ok && price.tierDiscountPercent > 0 && <span className="text-sm font-medium text-success-600">{t("tierApplied", { percent: price.tierDiscountPercent })}</span>}
          </div>
          {product.tiers.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {product.tiers.map((tier) => (
                <li key={tier.minQuantity}>
                  <button
                    type="button"
                    onClick={() => setQuantity(tier.minQuantity)}
                    className={cn(
                      "inline-flex min-h-11 items-center rounded-full border px-3.5 text-xs font-medium",
                      price.ok && price.tierDiscountPercent === tier.discountPercent ? "border-success-600 bg-success-50 text-success-600" : "border-line bg-surface text-ink-700 hover:border-ink-300",
                    )}
                  >
                    {t("tierHint", { min: tier.minQuantity, percent: tier.discountPercent })}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <fieldset>
          <legend className="text-sm font-semibold">{t("turnaround")}</legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <label className={cn(chip, "flex-col items-start gap-0.5")}>
              <input type="radio" name="turnaround" checked={turnaround === "standard"} onChange={() => setTurnaround("standard")} className="sr-only" />
              <span className="font-semibold text-ink-900">{t("standard")}</span>
              <span className="text-xs text-ink-500">{t("standardText", { days: product.productionDays })}</span>
            </label>
            {product.expressDays !== null && (
              <label className={cn(chip, "flex-col items-start gap-0.5")}>
                <input type="radio" name="turnaround" checked={turnaround === "express"} onChange={() => setTurnaround("express")} className="sr-only" />
                <span className="font-semibold text-ink-900">{t("express")}</span>
                <span className="text-xs text-ink-500">{t("expressText", { days: product.expressDays, percent: product.expressSurchargePercent })}</span>
              </label>
            )}
          </div>
        </fieldset>
      </div>

      {/* Summary (all sizes) */}
      <section aria-labelledby="summary-heading" className="rounded-card border border-line bg-surface p-4 shadow-card">
        <h2 id="summary-heading" className="font-sans text-base font-semibold">{t("priceBreakdown")}</h2>
        {price.ok ? (
          <dl className="mt-3 space-y-1.5 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-ink-700">
                {t("unitPrice", { qty: price.quantity, price: formatLKR(price.unitPrice) })}
                {price.areaSqft !== null && <span className="text-ink-500"> · {t("area", { area: price.areaSqft })}</span>}
              </dt>
              <dd>{formatLKR(price.linesSubtotal)}</dd>
            </div>
            {price.tierDiscount > 0 && (
              <div className="flex justify-between gap-4 text-success-600"><dt>{t("bulkDiscount", { percent: price.tierDiscountPercent })}</dt><dd>−{formatLKR(price.tierDiscount)}</dd></div>
            )}
            {price.expressFee > 0 && (<div className="flex justify-between gap-4"><dt className="text-ink-700">{t("expressFee")}</dt><dd>{formatLKR(price.expressFee)}</dd></div>)}
            {price.designFee > 0 && (<div className="flex justify-between gap-4"><dt className="text-ink-700">{t("designFee")}</dt><dd>{formatLKR(price.designFee)}</dd></div>)}
            <div className="flex justify-between gap-4 border-t border-line pt-2 text-base font-semibold">
              <dt>{isEstimate ? t("estimatedTotal") : t("total")}</dt>
              <dd>{formatLKR(price.total)}</dd>
            </div>
          </dl>
        ) : (
          <p className="mt-2 text-sm text-ink-500">—</p>
        )}
        {isEstimate && <p className="mt-2 text-xs text-ink-500">{t("estimateNote")}</p>}
        {!skipProof && <p className="mt-2 text-xs text-ink-500">{t("proofPromise", { fee: formatLKR(revisionFee) })}</p>}

        <div aria-live="polite" className="mt-3 empty:hidden">
          {error && <p className="rounded-control bg-danger-50 p-3 text-sm text-danger-600">{error}</p>}
          {added && (
            <p className="flex flex-wrap items-center justify-between gap-2 rounded-control bg-success-50 p-3 text-sm text-success-600">
              <span className="inline-flex items-center gap-1.5 font-semibold"><Check className="size-4" aria-hidden="true" />{t("added")}</span>
              <Link href="/cart" className="inline-flex min-h-11 items-center font-semibold underline">{t("viewCart")}</Link>
            </p>
          )}
        </div>

        <button type="submit" className={buttonClass({ size: "lg", full: true, className: "mt-3 hidden lg:inline-flex" })}>
          <ShoppingBag className="size-5" aria-hidden="true" />
          {t("addToCart")}
        </button>
      </section>

      {/* Sticky mobile price + add to cart */}
      <div data-sticky-cta className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-ink-500">{isEstimate ? t("estimatedTotal") : t("total")}</p>
            <p className="text-lg font-semibold leading-tight" aria-live="polite">{totalLabel}</p>
          </div>
          {added ? (
            <Link href="/cart" className={buttonClass({ variant: "dark", size: "lg" })}>
              <Check className="size-5" aria-hidden="true" /> {t("viewCart")}
            </Link>
          ) : (
            <button type="submit" className={buttonClass({ size: "lg" })}>
              <ShoppingBag className="size-5" aria-hidden="true" />
              {t("addToCart")}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
