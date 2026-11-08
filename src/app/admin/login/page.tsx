import type { Metadata } from "next";
import Image from "next/image";
import { isSupabaseConfigured } from "@/lib/env";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default async function AdminLogin({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const configured = isSupabaseConfigured();
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-card border border-line bg-surface p-6 shadow-card">
        <div className="flex items-center gap-3">
          <Image src="/images/brand/nirmanee-logo.jpg" alt="" width={40} height={40} className="size-10 rounded-full" />
          <h1 className="text-2xl">Staff sign in</h1>
        </div>
        {configured ? (
          <LoginForm initialError={error === "not_staff" ? "This account does not have staff access." : null} />
        ) : (
          <p className="mt-6 rounded-control bg-warning-50 p-3 text-sm text-warning-600">
            Staff login is not configured on this deployment (Supabase environment variables are missing). Access is denied.
          </p>
        )}
      </div>
    </main>
  );
}
