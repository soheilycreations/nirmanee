import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { refreshSupabaseSession } from "@/lib/supabase/proxy";

const intl = createIntlMiddleware(routing);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Staff area: not localised, requires a real (non-anonymous) Supabase user.
  // The staff role itself is verified server-side in src/app/admin (RLS-backed).
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const response = NextResponse.next({ request });
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    const session = await refreshSupabaseSession(request, response);
    const isLogin = pathname === "/admin/login";
    const signedIn = session.userId !== null && !session.isAnonymous;
    if (!signedIn && !isLogin) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "";
      return NextResponse.redirect(url);
    }
    return response;
  }

  const response = intl(request);
  // Only visitors who already have a session (cart / staff) pay for a refresh;
  // first-time visitors get the cached static page straight away.
  await refreshSupabaseSession(request, response);
  return response;
}

export const config = {
  // Everything except API routes, Next internals and files with an extension.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
