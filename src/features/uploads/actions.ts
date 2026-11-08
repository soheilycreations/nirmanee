"use server";

import { z } from "zod";
import { isUploadConfigured } from "@/lib/env";
import { deleteObject, headObjectSize, presignUpload } from "@/lib/r2";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureSupabaseCart } from "@/features/cart/store";
import { MAX_UPLOAD_BYTES, contentTypeFor, safeFileName } from "./rules";

export type RequestUploadResult =
  | { ok: true; fileId: string; uploadUrl: string; contentType: string }
  | { ok: false; error: "unavailable" | "bad_type" | "too_large" | "invalid" | "server" };

const requestSchema = z.object({
  fileName: z.string().min(1).max(255),
  sizeBytes: z.number().int().positive(),
});

/**
 * Step 1: validate, create a `pending` job_files row on the visitor's cart and
 * return a presigned PUT URL. The browser uploads straight to R2.
 */
export async function requestUpload(input: unknown): Promise<RequestUploadResult> {
  if (!isUploadConfigured()) return { ok: false, error: "unavailable" };
  const parsed = requestSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const { fileName, sizeBytes } = parsed.data;
  if (sizeBytes > MAX_UPLOAD_BYTES) return { ok: false, error: "too_large" };
  const contentType = contentTypeFor(fileName);
  if (!contentType) return { ok: false, error: "bad_type" };

  try {
    const ctx = await ensureSupabaseCart();
    if (!ctx) return { ok: false, error: "unavailable" };
    const key = `carts/${ctx.cartId}/${crypto.randomUUID()}-${safeFileName(fileName)}`;
    // Inserted with the visitor's own session: RLS checks cart ownership.
    const { data, error } = await ctx.supabase
      .from("job_files")
      .insert({
        cart_id: ctx.cartId,
        kind: "customer_upload",
        r2_key: key,
        original_filename: fileName.slice(0, 255),
        content_type: contentType,
        size_bytes: sizeBytes,
        upload_status: "pending",
        uploaded_by: ctx.userId,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    const uploadUrl = await presignUpload(key, contentType);
    return { ok: true, fileId: data.id, uploadUrl, contentType };
  } catch (err) {
    console.error("[uploads] requestUpload failed", err);
    return { ok: false, error: "server" };
  }
}

const confirmSchema = z.object({
  fileId: z.uuid(),
  widthPx: z.number().int().positive().max(100_000).nullable(),
  heightPx: z.number().int().positive().max(100_000).nullable(),
});

/** Step 2: verify the object exists in R2 with the declared size, then mark it uploaded. */
export async function confirmUpload(input: unknown): Promise<{ ok: boolean }> {
  if (!isUploadConfigured()) return { ok: false };
  const parsed = confirmSchema.safeParse(input);
  if (!parsed.success) return { ok: false };
  const supabase = await createSupabaseServerClient();
  const admin = createSupabaseAdminClient();
  if (!supabase || !admin) return { ok: false };

  // Ownership check through RLS (visitor can only see their own cart files).
  const { data: file } = await supabase
    .from("job_files")
    .select("id, r2_key, size_bytes, upload_status")
    .eq("id", parsed.data.fileId)
    .maybeSingle();
  if (!file || file.upload_status !== "pending") return { ok: false };

  const size = await headObjectSize(file.r2_key);
  if (size === null || size !== Number(file.size_bytes)) {
    await admin.from("job_files").update({ upload_status: "failed" }).eq("id", file.id);
    return { ok: false };
  }
  const { error } = await admin
    .from("job_files")
    .update({ upload_status: "uploaded", width_px: parsed.data.widthPx, height_px: parsed.data.heightPx })
    .eq("id", file.id);
  return { ok: !error };
}

/** Removes an upload that has not been attached to a cart item yet. */
export async function removeUpload(input: unknown): Promise<{ ok: boolean }> {
  if (!isUploadConfigured()) return { ok: false };
  const parsed = z.object({ fileId: z.uuid() }).safeParse(input);
  if (!parsed.success) return { ok: false };
  const supabase = await createSupabaseServerClient();
  const admin = createSupabaseAdminClient();
  if (!supabase || !admin) return { ok: false };
  const { data: file } = await supabase
    .from("job_files")
    .select("id, r2_key, cart_item_id, job_id")
    .eq("id", parsed.data.fileId)
    .maybeSingle();
  if (!file || file.cart_item_id || file.job_id) return { ok: false };
  try {
    await deleteObject(file.r2_key);
  } catch (err) {
    console.error("[uploads] R2 delete failed", err);
  }
  const { error } = await admin.from("job_files").delete().eq("id", file.id);
  return { ok: !error };
}
