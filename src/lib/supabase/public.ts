import "server-only";
import { createClient } from "@supabase/supabase-js";
import { supabaseEnv } from "@/lib/env";

export const CATALOG_TAG = "catalog";
const REVALIDATE_SECONDS = 3600;

/**
 * Cookie-less client for PUBLIC data (catalogue, public settings, delivery
 * zones). Reads run as the `anon` role, so RLS still applies. Because it never
 * touches cookies, pages that use it can be statically generated (ISR); its
 * fetches are cached under the "catalog" tag, which /api/revalidate clears
 * when products change.
 */
export function createSupabasePublicClient() {
  const env = supabaseEnv();
  if (!env) return null;
  return createClient(env.url, env.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: {
      fetch: (input, init) => fetch(input, { ...init, next: { revalidate: REVALIDATE_SECONDS, tags: [CATALOG_TAG] } }),
    },
  });
}
