import { createServerClient } from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";
import { supabaseEnv } from "@/lib/env";

/**
 * Refreshes the Supabase auth session cookies on the outgoing response and
 * returns the current user (null when signed out or not configured).
 */
export async function refreshSupabaseSession(request: NextRequest, response: NextResponse) {
  const env = supabaseEnv();
  if (!env) return { user: null, configured: false as const };
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
  const { data } = await supabase.auth.getUser();
  return { user: data.user, configured: true as const };
}
