import type { AddToCartInput, AddToCartResult } from "./service";

/**
 * Browser helpers for /api/cart. `keepalive: true` lets the request finish even
 * if the page navigates or closes right after the click (body must stay < 64 KB).
 */
async function send<T>(method: "POST" | "PATCH" | "DELETE", body: unknown, fallback: T): Promise<T> {
  try {
    const res = await fetch("/api/cart", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      keepalive: true,
      credentials: "same-origin",
    });
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

export function addToCartRequest(input: AddToCartInput): Promise<AddToCartResult> {
  return send("POST", input, { ok: false, error: "server" } as AddToCartResult);
}

export function updateCartQuantityRequest(lineId: string, quantity: number): Promise<{ ok: boolean }> {
  return send("PATCH", { lineId, quantity }, { ok: false });
}

export function removeCartItemRequest(lineId: string): Promise<{ ok: boolean }> {
  return send("DELETE", { lineId }, { ok: false });
}
