import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { addToCart, removeCartItem, updateCartQuantity } from "@/features/cart/service";

/**
 * Cart mutations for the browser (fetch + keepalive). Exception to the "Server
 * Actions for mutations" rule — see src/features/cart/service.ts.
 * CSRF: only same-origin requests with a JSON body are accepted (Server Actions
 * get an equivalent Origin check built in).
 */
function sameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

async function readJson(request: NextRequest): Promise<unknown | null> {
  if (!request.headers.get("content-type")?.includes("application/json")) return null;
  try {
    return await request.json();
  } catch {
    return null;
  }
}

const forbidden = () => NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
const bad = () => NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
const noStore = { headers: { "Cache-Control": "no-store" } };

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return forbidden();
  const body = await readJson(request);
  if (body === null) return bad();
  const result = await addToCart(body);
  return NextResponse.json(result, { status: result.ok ? 200 : result.error === "server" ? 500 : 422, ...noStore });
}

const patchSchema = z.object({ lineId: z.string(), quantity: z.number() });

export async function PATCH(request: NextRequest) {
  if (!sameOrigin(request)) return forbidden();
  const parsed = patchSchema.safeParse(await readJson(request));
  if (!parsed.success) return bad();
  const result = await updateCartQuantity(parsed.data.lineId, parsed.data.quantity);
  return NextResponse.json(result, { status: result.ok ? 200 : 422, ...noStore });
}

const deleteSchema = z.object({ lineId: z.string() });

export async function DELETE(request: NextRequest) {
  if (!sameOrigin(request)) return forbidden();
  const parsed = deleteSchema.safeParse(await readJson(request));
  if (!parsed.success) return bad();
  const result = await removeCartItem(parsed.data.lineId);
  return NextResponse.json(result, { status: result.ok ? 200 : 422, ...noStore });
}
