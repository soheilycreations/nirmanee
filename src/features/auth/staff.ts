import "server-only";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type StaffRole = "admin" | "designer" | "production";

export interface StaffSession {
  userId: string;
  email: string | null;
  role: StaffRole;
  displayName: string;
}

/**
 * Server-side gate for every /admin page. The proxy already redirects signed-out
 * visitors; this re-checks the session AND the staff role (RLS: a user can only
 * read `staff` rows if they are active staff). Fails closed.
 */
export async function requireStaff(): Promise<StaffSession> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/admin/login");
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user || user.is_anonymous) redirect("/admin/login");
  const { data: staff } = await supabase
    .from("staff")
    .select("role, display_name, is_active")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!staff || !staff.is_active) redirect("/admin/login?error=not_staff");
  return { userId: user.id, email: user.email ?? null, role: staff.role as StaffRole, displayName: staff.display_name };
}
