import "server-only";
import { cache } from "react";
import { createSupabasePublicClient } from "@/lib/supabase/public";

const DEFAULTS = { revision_fee_lkr: 500, free_revisions: 2 } as const;
type Key = keyof typeof DEFAULTS;

/** Public, admin-editable settings (app_settings). Falls back to defaults in preview mode. */
export const getPublicSettings = cache(async (): Promise<Record<Key, number>> => {
  const result: Record<Key, number> = { ...DEFAULTS };
  const supabase = createSupabasePublicClient();
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

export interface DeliveryZone {
  code: string;
  name: { en: string; si: string | null };
  description: { en: string | null; si: string | null };
  fee: number;
  etaMinDays: number;
  etaMaxDays: number;
}

// Mirrors the seed rows in 20261109000000_phase1a_storefront.sql (preview mode only).
const DEFAULT_ZONES: DeliveryZone[] = [
  { code: "kalutara", name: { en: "Kalutara District", si: "කළුතර දිස්ත්‍රික්කය" }, description: { en: null, si: null }, fee: 350, etaMinDays: 1, etaMaxDays: 2 },
  { code: "western", name: { en: "Western Province", si: "බස්නාහිර පළාත" }, description: { en: null, si: null }, fee: 450, etaMinDays: 2, etaMaxDays: 3 },
  { code: "island", name: { en: "Rest of the island", si: "දිවයිනේ අනෙකුත් ප්‍රදේශ" }, description: { en: null, si: null }, fee: 600, etaMinDays: 2, etaMaxDays: 4 },
];

/** Admin-editable courier zones (delivery_zones). */
export const getDeliveryZones = cache(async (): Promise<DeliveryZone[]> => {
  const supabase = createSupabasePublicClient();
  if (!supabase) return DEFAULT_ZONES;
  const { data, error } = await supabase
    .from("delivery_zones")
    .select("code, name_en, name_si, description_en, description_si, fee, eta_min_days, eta_max_days")
    .eq("is_active", true)
    .order("sort_order");
  if (error) {
    console.error("[zones] query failed", error.message);
    return DEFAULT_ZONES;
  }
  return data.map((z) => ({
    code: z.code,
    name: { en: z.name_en, si: z.name_si },
    description: { en: z.description_en, si: z.description_si },
    fee: Number(z.fee),
    etaMinDays: z.eta_min_days,
    etaMaxDays: z.eta_max_days,
  }));
});
