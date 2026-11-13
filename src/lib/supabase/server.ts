import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseEnv } from "@/lib/env";

/**
 * User-scoped Supabase client for Server Components / Server Actions.
 * Respects RLS. Returns null when Supabase is not configured (preview mode).
 *
 * `cookiesWritten()` resolves once @supabase/ssr has written session cookies.
 * The library writes them from an async auth-state callback, which can finish
 * AFTER a server action has already responded — then the browser never gets
 * the session (a guest would get a new anonymous user on every action). Call
 * it after sign-in to make the write deterministic.
 */
export async function createSupabaseServerClient() {
  const env = supabaseEnv();
  if (!env) return null;
  const cookieStore = await cookies();
  let markWritten: () => void = () => {};
  const written = new Promise<void>((resolve) => {
    markWritten = resolve;
  });
  const client = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(toSet) {
        try {
          for (const { name, value, options } of toSet) cookieStore.set(name, value, options);
        } catch {
          // Called from a Server Component: cookies are read-only there. The
          // proxy refreshes the session, so this is safe to ignore.
        } finally {
          markWritten();
        }
      },
    },
  });
  return Object.assign(client, {
    cookiesWritten: (timeoutMs = 3000) =>
      Promise.race([written, new Promise<void>((resolve) => setTimeout(resolve, timeoutMs))]),
  });
}

export type ServerSupabase = NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>;
