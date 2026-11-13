/**
 * Cart mutations (validation + persistence). Called from the /api/cart route
 * handler, not as Server Actions: the browser sends them with
 * fetch(..., { keepalive: true }) so they finish even if the visitor navigates
 * away right after tapping "Add to cart" (Next.js can drop in-flight Server
 * Actions on navigation).
 */
import "server-only";

import { z } from "zod";
import { getProductBySlug } from "@/features/catalog/queries";
import { availableDesignModes } from "@/features/catalog/types";
import { isSupabaseConfigured } from "@/lib/env";
import { computePrice, CUSTOM_SIZE_VALUE } from "@/lib/pricing";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { addCartLine, removeCartLine, updateCartLineQuantity, type CartSelection } from "./store";

const addSchema = z.object({
  productSlug: z.string().regex(/^[a-z0-9-]+$/).max(100),
  values: z.record(z.string().max(50), z.string().max(500)),
  customSize: z
    .object({ widthIn: z.number().positive().max(10_000), heightIn: z.number().positive().max(10_000) })
    .nullable(),
  quantity: z.number().int().min(1).max(100_000),
  designMode: z.enum(["upload", "design_for_me", "template"]),
  templateId: z.string().max(100).nullable(),
  turnaround: z.enum(["standard", "express"]),
  skipProof: z.boolean(),
  notes: z.string().max(4000),
  fileIds: z.array(z.uuid()).max(10),
});

export type AddToCartInput = z.input<typeof addSchema>;

export type AddToCartResult =
  | { ok: true; cartCount: number }
  | { ok: false; error: "invalid" | "not_found" | "missing_option" | "invalid_size" | "missing_text" | "template" | "server"; option?: string };

export async function addToCart(input: unknown): Promise<AddToCartResult> {
  const parsed = addSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const data = parsed.data;

  const product = await getProductBySlug(data.productSlug);
  if (!product) return { ok: false, error: "not_found" };
  if (!availableDesignModes(product).includes(data.designMode)) return { ok: false, error: "invalid" };
  if (data.skipProof && data.designMode !== "upload") return { ok: false, error: "invalid" };

  let templateId: string | null = null;
  if (data.designMode === "template") {
    const tpl = product.templates.find((t) => t.id === data.templateId);
    if (!tpl) return { ok: false, error: "template" };
    templateId = tpl.id;
  }

  // Text options: required + max length. Choice options are validated by the pricing engine.
  const selections: CartSelection[] = [];
  for (const option of product.options) {
    if (option.type === "photo_slots") continue;
    const raw = data.values[option.code]?.trim() ?? "";
    if (option.type === "text") {
      if (option.isRequired && !raw) return { ok: false, error: "missing_text", option: option.code };
      if (option.config.max_length && raw.length > option.config.max_length) return { ok: false, error: "invalid" };
      if (raw) selections.push({ code: option.code, value: raw });
      continue;
    }
    if (raw) selections.push({ code: option.code, value: raw });
  }

  const choiceValues = Object.fromEntries(selections.map((s) => [s.code, s.value]));
  const usesCustomSize = Object.values(choiceValues).includes(CUSTOM_SIZE_VALUE);
  const price = computePrice(product, {
    values: choiceValues,
    customSize: usesCustomSize ? data.customSize : null,
    quantity: data.quantity,
    designMode: data.designMode,
    turnaround: data.turnaround,
  });
  if (!price.ok) {
    const e = price.error;
    if (e.code === "missing_option") return { ok: false, error: "missing_option", option: e.option };
    if (e.code === "invalid_size") return { ok: false, error: "invalid_size", option: e.option };
    return { ok: false, error: "invalid" };
  }

  const fileIds = isSupabaseConfigured() ? data.fileIds : [];

  let cartCount: number;
  try {
    cartCount = await addCartLine(
      {
        productId: isSupabaseConfigured() ? product.id : null,
        productSlug: product.slug,
        quantity: data.quantity,
        selections,
        widthIn: price.printSize?.widthIn ?? null,
        heightIn: price.printSize?.heightIn ?? null,
        notes: data.notes.trim() || null,
        designMode: data.designMode,
        templateId,
        turnaround: data.turnaround,
        skipProof: data.skipProof,
        fileIds,
      },
      linkUploadedFiles,
    );
  } catch (err) {
    console.error("[cart] addToCart failed", err);
    return { ok: false, error: "server" };
  }

  // No revalidatePath: product/shop pages are static (ISR) and the cart badge
  // is client state; the cart page itself is rendered per request.
  return { ok: true, cartCount };
}

/**
 * Attach the visitor's verified uploads to the new cart item. The service role
 * is used for the write, but only rows already belonging to this cart and
 * marked `uploaded` are touched.
 */
async function linkUploadedFiles(cartId: string, cartItemId: string, fileIds: string[]) {
  const admin = createSupabaseAdminClient();
  if (!admin) return;
  const { error } = await admin
    .from("job_files")
    .update({ cart_item_id: cartItemId })
    .in("id", fileIds)
    .eq("cart_id", cartId)
    .is("cart_item_id", null)
    .eq("upload_status", "uploaded");
  if (error) throw new Error(`linking uploads failed: ${error.message}`);
}

const lineIdSchema = z.string().min(1).max(100);

export async function updateCartQuantity(lineId: unknown, quantity: unknown): Promise<{ ok: boolean }> {
  const id = lineIdSchema.safeParse(lineId);
  const qty = z.number().int().min(1).max(100_000).safeParse(quantity);
  if (!id.success || !qty.success) return { ok: false };
  try {
    await updateCartLineQuantity(id.data, qty.data);
    return { ok: true };
  } catch (err) {
    console.error("[cart] update failed", err);
    return { ok: false };
  }
}

export async function removeCartItem(lineId: unknown): Promise<{ ok: boolean }> {
  const id = lineIdSchema.safeParse(lineId);
  if (!id.success) return { ok: false };
  try {
    await removeCartLine(id.data);
    return { ok: true };
  } catch (err) {
    console.error("[cart] remove failed", err);
    return { ok: false };
  }
}
