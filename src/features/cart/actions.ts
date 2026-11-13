"use server";

import { getCartCount, getCartReference } from "./store";

/** Cart badge count for statically rendered pages (read-only, safe as a Server Action). */
export async function getCartCountAction(): Promise<number> {
  return getCartCount();
}

/** Short cart code ("C-3F9A1B") for prefilling WhatsApp messages from statically rendered pages. */
export async function getCartReferenceAction(): Promise<string | null> {
  return getCartReference();
}
