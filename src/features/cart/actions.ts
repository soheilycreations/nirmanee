"use server";

import { getCartCount } from "./store";

/** Cart badge count for statically rendered pages (read-only, safe as a Server Action). */
export async function getCartCountAction(): Promise<number> {
  return getCartCount();
}
