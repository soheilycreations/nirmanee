"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface SignInState {
  error: string | null;
}

const schema = z.object({
  email: z.email().max(200),
  password: z.string().min(6).max(200),
});

export async function signInStaff(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const parsed = schema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { error: "Enter a valid email and password." };
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Staff login is not configured on this deployment." };

  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !data.user) return { error: "Incorrect email or password." };

  const { data: staff } = await supabase.from("staff").select("is_active").eq("user_id", data.user.id).maybeSingle();
  if (!staff?.is_active) {
    await supabase.auth.signOut();
    return { error: "This account does not have staff access." };
  }
  redirect("/admin");
}

export async function signOutStaff(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/admin/login");
}
