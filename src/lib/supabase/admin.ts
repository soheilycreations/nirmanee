import "server-only";
import { createClient } from "@supabase/supabase-js";
import { supabaseEnv, supabaseServiceRoleKey } from "@/lib/env";

/**
 * Service-role client: BYPASSES RLS. Only for operations RLS cannot express
 * (upload confirmation, linking verified files). Always check ownership with
 * the user-scoped client first.
 */
export function createSupabaseAdminClient() {
  const env = supabaseEnv();
  const key = supabaseServiceRoleKey();
  if (!env || !key) return null;
  return createClient(env.url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
