"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

export interface ToastInput {
  message: string;
  tone?: "success" | "error" | "info";
  action?: { label: string; onClick: () => void } | { label: string; href: string };
  durationMs?: number;
}

interface Toast extends ToastInput {
  id: number;
}

const ToastContext = createContext<{ show: (t: ToastInput) => number; dismiss: (id: number) => void } | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const t = useTranslations("toast");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((x) => x.id !== id));
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
  }, []);

  const show = useCallback(
    (input: ToastInput) => {
      const id = nextId.current++;
      setToasts((list) => [...list.slice(-2), { ...input, id }]);
      timers.current.set(id, setTimeout(() => dismiss(id), input.durationMs ?? 5000));
      return id;
    },
    [dismiss],
  );

  useEffect(() => {
    const map = timers.current;
    return () => map.forEach((timer) => clearTimeout(timer));
  }, []);

  const value = useMemo(() => ({ show, dismiss }), [show, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div aria-live="polite" role="status" className="pointer-events-none fixed inset-x-0 top-16 z-[65] flex flex-col items-center gap-2 px-4 pt-2 sm:items-end">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-card border bg-surface px-4 py-2 shadow-lift",
              toast.tone === "error" ? "border-danger-600/30" : "border-line",
            )}
          >
            {toast.tone === "error" ? (
              <AlertCircle className="size-5 shrink-0 text-danger-600" aria-hidden="true" />
            ) : (
              <CheckCircle2 className="size-5 shrink-0 text-success-600" aria-hidden="true" />
            )}
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            {toast.action &&
              ("href" in toast.action ? (
                <Link href={toast.action.href} onClick={() => dismiss(toast.id)} className="inline-flex min-h-11 items-center px-1 text-sm font-semibold text-brand-600 underline-offset-2 hover:underline">
                  {toast.action.label}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const action = toast.action as { onClick: () => void };
                    action.onClick();
                    dismiss(toast.id);
                  }}
                  className="inline-flex min-h-11 items-center px-1 text-sm font-semibold text-brand-600 underline-offset-2 hover:underline"
                >
                  {toast.action.label}
                </button>
              ))}
            <button type="button" onClick={() => dismiss(toast.id)} aria-label={t("dismiss")} className="inline-flex size-11 items-center justify-center rounded-control text-ink-500 hover:bg-paper-200">
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
