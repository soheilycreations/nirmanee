import { z } from "zod";

/**
 * Environment access with validation. Each integration is optional during
 * Phase 1A: when a group is completely absent the feature is disabled
 * (catalogue falls back to seed data, cart to a browser cookie, uploads to
 * WhatsApp). A group that is only PARTIALLY configured is a misconfiguration
 * and throws, so problems surface immediately instead of silently.
 */

function group<T extends z.ZodRawShape>(name: string, shape: T, values: Record<keyof T, string | undefined>) {
  const present = Object.values(values).filter((v) => v !== undefined && v !== "");
  if (present.length === 0) return null;
  const parsed = z.object(shape).safeParse(values);
  if (!parsed.success) {
    const fields = parsed.error.issues.map((i) => i.path.join(".")).join(", ");
    throw new Error(`[env] ${name} is partially configured or invalid: ${fields}`);
  }
  return parsed.data;
}

/**
 * Supabase API keys. Preferred: the new `sb_publishable_…` / `sb_secret_…` keys.
 * The legacy JWT `anon` / `service_role` variables are still accepted as a
 * fallback so older deployments keep working during the switch.
 */
export function supabaseEnv() {
  return group(
    "Supabase",
    { url: z.url(), anonKey: z.string().min(20) },
    {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
  );
}

/** Server-only key that bypasses RLS (`sb_secret_…`, legacy: service_role JWT). */
export function supabaseServiceRoleKey(): string | null {
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key || key.length <= 20) return null;
  if (key.startsWith("sb_publishable_")) {
    throw new Error("[env] SUPABASE_SECRET_KEY holds a publishable key — use the sb_secret_ key");
  }
  return key;
}

export function r2Env() {
  return group(
    "Cloudflare R2",
    {
      accountId: z.string().min(1),
      accessKeyId: z.string().min(1),
      secretAccessKey: z.string().min(1),
      bucket: z.string().min(1),
      endpoint: z.url(),
    },
    {
      accountId: process.env.R2_ACCOUNT_ID,
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      bucket: process.env.R2_BUCKET,
      endpoint: process.env.R2_ENDPOINT,
    },
  );
}

export function isSupabaseConfigured(): boolean {
  return supabaseEnv() !== null;
}

/** Uploads need Supabase (job_files rows), the service role (confirmation) and R2. */
export function isUploadConfigured(): boolean {
  return isSupabaseConfigured() && supabaseServiceRoleKey() !== null && r2Env() !== null;
}

export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  if (process.env.VERCEL_ENV === "production") return "https://nirmanee.vercel.app";
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
