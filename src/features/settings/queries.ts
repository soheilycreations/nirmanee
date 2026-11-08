import "server-only";
import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const DEFAULTS = { revision_fee_lkr: 500, free_revisions: 2 } as const;
type Key = keyof typeof DEFAULTS;

/** Public, admin-editable settings (app_settings). Falls back to defaults in demo mode. */
export const getPublicSettings = cache(async (): Promise<Record<Key, number>> => {
  const result: Record<Key, number> = { ...DEFAULTS };
  const supabase = await createSupabaseServerClient();
  if (!supabase) return result;
  const { data, error } = await supabase.from("app_settings").select("key, value").in("key", Object.keys(DEFAULTS));
  if (error) {
    console.error("[settings] query failed", error.message);
    return result;
  }
  for (const row of data) {
    const n = Number(row.value);
    if (row.key in result && Number.isFinite(n)) result[row.key as Key] = n;
  }
  return result;
});
