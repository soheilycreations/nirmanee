import { createServerClient } from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";
import { supabaseEnv } from "@/lib/env";

export interface ProxySession {
  configured: boolean;
  userId: string | null;
  isAnonymous: boolean;
}

/** True when the request carries a Supabase auth cookie (sb-<ref>-auth-token[.n]). */
export function hasSupabaseSessionCookie(request: NextRequest): boolean {
  return request.cookies.getAll().some((c) => c.name.startsWith("sb-") && c.name.includes("-auth-token"));
}

/**
 * Refreshes the Supabase session cookies on the outgoing response and returns
 * the verified claims. Uses getClaims(): with asymmetric JWT signing keys the
 * token is verified locally (no network round-trip); it only calls Supabase
 * when the access token must be refreshed. Skips Supabase entirely when the
 * visitor has no session cookie (most page views).
 */
export async function refreshSupabaseSession(request: NextRequest, response: NextResponse): Promise<ProxySession> {
  const env = supabaseEnv();
  if (!env) return { configured: false, userId: null, isAnonymous: false };
  if (!hasSupabaseSessionCookie(request)) return { configured: true, userId: null, isAnonymous: false };
  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(toSet) {
        for (const { name, value, options } of toSet) {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        }
      },
    },
  });
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  return {
    configured: true,
    userId: typeof claims?.sub === "string" ? claims.sub : null,
    isAnonymous: claims?.is_anonymous === true,
  };
}
