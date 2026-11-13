import { timingSafeEqual } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { CATALOG_TAG } from "@/lib/supabase/public";

/**
 * Webhook for Supabase "Database Webhooks": called when catalogue tables change
 * (products, product_options, product_option_values, product_price_tiers,
 * product_templates, categories, app_settings, delivery_zones). Clears the
 * cached catalogue so static pages rebuild on their next visit.
 *
 * Auth: header `x-revalidate-secret: <REVALIDATE_SECRET>`.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  const given = request.headers.get("x-revalidate-secret") ?? "";
  if (!secret || secret.length < 16) {
    return NextResponse.json({ ok: false, error: "not configured" }, { status: 503 });
  }
  const a = Buffer.from(given);
  const b = Buffer.from(secret);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  revalidateTag(CATALOG_TAG, "max");
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true, revalidated: CATALOG_TAG });
}
