"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getCartCountAction } from "@/features/cart/actions";

interface CartState {
  /** null until the first server read finishes (pages are static, so the count loads client-side). */
  count: number | null;
  adjust: (delta: number) => void;
  set: (count: number) => void;
  refresh: () => Promise<void>;
  /** Adds still being saved in the background (optimistic UI). */
  pending: number;
  beginSave: () => void;
  endSave: () => void;
}

const CartContext = createContext<CartState | null>(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [count, setCount] = useState<number | null>(null);
  const [pending, setPending] = useState(0);
  const beginSave = useCallback(() => setPending((n) => n + 1), []);
  const endSave = useCallback(() => setPending((n) => Math.max(0, n - 1)), []);

  const refresh = useCallback(async () => {
    try {
      setCount(await getCartCountAction());
    } catch {
      setCount((c) => c ?? 0);
    }
  }, []);

  useEffect(() => {
    // Initial load: the layout is statically rendered, so ask the server once.
    let cancelled = false;
    getCartCountAction()
      .then((n) => !cancelled && setCount(n))
      .catch(() => !cancelled && setCount((c) => c ?? 0));
    return () => {
      cancelled = true;
    };
  }, []);

  const adjust = useCallback((delta: number) => setCount((c) => Math.max(0, (c ?? 0) + delta)), []);
  const value = useMemo(
    () => ({ count, adjust, set: setCount, refresh, pending, beginSave, endSave }),
    [count, adjust, refresh, pending, beginSave, endSave],
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
