import "server-only";
import { cookies } from "next/headers";
import { z } from "zod";
import { createSupabaseServerClient, type ServerSupabase } from "@/lib/supabase/server";
import type { DesignMode, Turnaround } from "@/lib/pricing";

/**
 * Cart persistence.
 *  - Supabase mode: `carts` / `cart_items` rows owned by the visitor's Supabase
 *    user. Guests are signed in anonymously on their first cart action, so RLS
 *    (and later Realtime) work exactly like for registered customers.
 *  - Demo mode (no Supabase env): an httpOnly cookie. No uploads.
 * Prices are never stored — they are recomputed from the catalogue.
 */

export interface CartSelection {
  code: string;
  value: string;
}

export interface CartFile {
  id: string;
  name: string;
  sizeBytes: number;
  contentType: string;
}

export interface CartLine {
  id: string;
  productId: string | null;
  productSlug: string;
  quantity: number;
  selections: CartSelection[];
  widthIn: number | null;
  heightIn: number | null;
  notes: string | null;
  designMode: DesignMode;
  templateId: string | null;
  turnaround: Turnaround;
  skipProof: boolean;
  files: CartFile[];
}

export type NewCartLine = Omit<CartLine, "id" | "files"> & { fileIds: string[] };

// ---------------------------------------------------------------------------
// Supabase helpers
// ---------------------------------------------------------------------------
/**
 * Current Supabase user id. getClaims() verifies the JWT locally when the
 * project uses asymmetric signing keys (no round-trip to the auth server);
 * with legacy symmetric keys it falls back to a network check. Guests without
 * a session are signed in anonymously when `create` is true.
 */
async function getUser(supabase: ServerSupabase, create: boolean): Promise<{ id: string } | null> {
  const { data } = await supabase.auth.getClaims();
  const sub = data?.claims?.sub;
  if (typeof sub === "string") return { id: sub };
  if (!create) return null;
  const { data: anon, error } = await supabase.auth.signInAnonymously();
  if (error || !anon.user) throw new Error(`anonymous sign-in failed: ${error?.message ?? "no user"}`);
  // Make sure the session cookie is on THIS response (see cookiesWritten()).
  await supabase.cookiesWritten();
  return { id: anon.user.id };
}

async function findActiveCartId(supabase: ServerSupabase, userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`cart lookup failed: ${error.message}`);
  return data?.id ?? null;
}

/** Ensures a signed-in (possibly anonymous) user with an active cart. */
export async function ensureSupabaseCart(): Promise<{ supabase: ServerSupabase; cartId: string; userId: string } | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const user = await getUser(supabase, true);
  if (!user) return null;
  const existing = await findActiveCartId(supabase, user.id);
  if (existing) return { supabase, cartId: existing, userId: user.id };
  // Insert WITHOUT `RETURNING`: under the original carts policy the row is not
  // yet visible to the ownership check inside the same statement. A unique
  // index allows one active cart per user, so a concurrent insert (two tabs)
  // fails with 23505 — in both cases we simply read the active cart back.
  const { error } = await supabase.from("carts").insert({ user_id: user.id });
  if (error && error.code !== "23505") throw new Error(`cart create failed: ${error.message}`);
  const cartId = await findActiveCartId(supabase, user.id);
  if (!cartId) throw new Error("cart create failed: cart not found after insert");
  return { supabase, cartId, userId: user.id };
}

interface DbCartItem {
  id: string;
  product_id: string;
  quantity: number;
  selections: CartSelection[];
  width_in: number | string | null;
  height_in: number | string | null;
  notes: string | null;
  design_mode: DesignMode;
  template_id: string | null;
  turnaround: Turnaround;
  skip_proof: boolean;
  product: { slug: string } | null;
  job_files: { id: string; original_filename: string; size_bytes: number; content_type: string; upload_status: string }[];
}

// ---------------------------------------------------------------------------
// Demo cookie store
// ---------------------------------------------------------------------------
const COOKIE = "np_cart";
const cookieLine = z.object({
  id: z.string(),
  productSlug: z.string(),
  quantity: z.number().int().min(1),
  selections: z.array(z.object({ code: z.string(), value: z.string() })),
  widthIn: z.number().nullable(),
  heightIn: z.number().nullable(),
  notes: z.string().nullable(),
  designMode: z.enum(["upload", "design_for_me", "template"]),
  templateId: z.string().nullable(),
  turnaround: z.enum(["standard", "express"]),
  skipProof: z.boolean(),
});

async function readCookieLines(): Promise<CartLine[]> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return [];
  try {
    const parsed = z.array(cookieLine).safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data.map((l) => ({ ...l, productId: null, files: [] })) : [];
  } catch {
    return [];
  }
}

async function writeCookieLines(lines: CartLine[]) {
  const slim = lines.slice(0, 20).map((l) => ({
    id: l.id,
    productSlug: l.productSlug,
    quantity: l.quantity,
    selections: l.selections,
    widthIn: l.widthIn,
    heightIn: l.heightIn,
    notes: l.notes,
    designMode: l.designMode,
    templateId: l.templateId,
    turnaround: l.turnaround,
    skipProof: l.skipProof,
  }));
  (await cookies()).set(COOKIE, JSON.stringify(slim), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
export async function getCartLines(): Promise<CartLine[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return readCookieLines();

  const user = await getUser(supabase, false);
  if (!user) return [];
  const cartId = await findActiveCartId(supabase, user.id);
  if (!cartId) return [];
  const { data, error } = await supabase
    .from("cart_items")
    .select(
      "id, product_id, quantity, selections, width_in, height_in, notes, design_mode, template_id, turnaround, skip_proof, product:products(slug), job_files(id, original_filename, size_bytes, content_type, upload_status)",
    )
    .eq("cart_id", cartId)
    .order("created_at");
  if (error) throw new Error(`cart items query failed: ${error.message}`);
  return (data as unknown as DbCartItem[])
    .filter((row) => row.product !== null)
    .map((row) => ({
      id: row.id,
      productId: row.product_id,
      productSlug: row.product!.slug,
      quantity: row.quantity,
      selections: row.selections ?? [],
      widthIn: row.width_in === null ? null : Number(row.width_in),
      heightIn: row.height_in === null ? null : Number(row.height_in),
      notes: row.notes,
      designMode: row.design_mode,
      templateId: row.template_id,
      turnaround: row.turnaround,
      skipProof: row.skip_proof,
      files: row.job_files
        .filter((f) => f.upload_status === "uploaded")
        .map((f) => ({ id: f.id, name: f.original_filename, sizeBytes: f.size_bytes, contentType: f.content_type })),
    }));
}

export async function getCartCount(): Promise<number> {
  try {
    return (await getCartLines()).length;
  } catch {
    return 0;
  }
}

/** Adds a line. `linkFiles` re-parents verified uploads (Supabase mode only). */
/** Adds a line and returns the cart's new line count. `linkFiles` re-parents verified uploads (Supabase mode only). */
export async function addCartLine(
  line: NewCartLine,
  linkFiles: (cartId: string, cartItemId: string, fileIds: string[]) => Promise<void>,
): Promise<number> {
  const ctx = await ensureSupabaseCart();
  if (!ctx) {
    const lines = await readCookieLines();
    lines.push({ ...line, id: crypto.randomUUID(), files: [] });
    await writeCookieLines(lines);
    return lines.length;
  }
  if (!line.productId) throw new Error("productId required in Supabase mode");
  const { data, error } = await ctx.supabase
    .from("cart_items")
    .insert({
      cart_id: ctx.cartId,
      product_id: line.productId,
      template_id: line.templateId,
      quantity: line.quantity,
      selections: line.selections,
      width_in: line.widthIn,
      height_in: line.heightIn,
      notes: line.notes,
      design_mode: line.designMode,
      turnaround: line.turnaround,
      skip_proof: line.skipProof,
    })
    .select("id")
    .single();
  if (error) throw new Error(`cart item insert failed: ${error.message}`);
  const [, countResult] = await Promise.all([
    line.fileIds.length > 0 ? linkFiles(ctx.cartId, data.id, line.fileIds) : Promise.resolve(),
    ctx.supabase.from("cart_items").select("id", { count: "exact", head: true }).eq("cart_id", ctx.cartId),
  ]);
  return countResult.count ?? 1;
}

export async function updateCartLineQuantity(lineId: string, quantity: number): Promise<void> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    const lines = await readCookieLines();
    await writeCookieLines(lines.map((l) => (l.id === lineId ? { ...l, quantity } : l)));
    return;
  }
  // RLS restricts the update to the visitor's own cart.
  const { error } = await supabase.from("cart_items").update({ quantity }).eq("id", lineId);
  if (error) throw new Error(`cart item update failed: ${error.message}`);
}

export async function removeCartLine(lineId: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    const lines = await readCookieLines();
    await writeCookieLines(lines.filter((l) => l.id !== lineId));
    return;
  }
  const { error } = await supabase.from("cart_items").delete().eq("id", lineId);
  if (error) throw new Error(`cart item delete failed: ${error.message}`);
}

/**
 * Short code staff can use to find a cart ("C-3F9A1B"): derived from the cart
 * id in Supabase mode, or from the line ids in preview mode.
 */
export async function getCartReference(): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    const lines = await readCookieLines();
    if (lines.length === 0) return null;
    let h = 0;
    for (const ch of lines.map((l) => l.id).join("")) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return `C-${h.toString(16).toUpperCase().padStart(6, "0").slice(0, 6)}`;
  }
  const user = await getUser(supabase, false);
  if (!user) return null;
  const cartId = await findActiveCartId(supabase, user.id);
  return cartId ? `C-${cartId.replace(/-/g, "").slice(0, 6).toUpperCase()}` : null;
}
