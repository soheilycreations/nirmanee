"use client";

import { useActionState } from "react";
import { signInStaff, type SignInState } from "@/features/auth/actions";
import { buttonClass } from "@/components/ui/button";

const input = "mt-1 h-11 w-full rounded-control border border-line bg-surface px-3 text-[16px] focus:border-brand-400 focus:outline-none";

export function LoginForm({ initialError }: { initialError: string | null }) {
  const [state, action, pending] = useActionState<SignInState, FormData>(signInStaff, { error: initialError });
  return (
    <form action={action} className="mt-6 space-y-4">
      <label className="block text-sm font-medium">
        Email
        <input name="email" type="email" autoComplete="username" required className={input} />
      </label>
      <label className="block text-sm font-medium">
        Password
        <input name="password" type="password" autoComplete="current-password" required className={input} />
      </label>
      {state.error && <p role="alert" className="rounded-control bg-danger-50 p-3 text-sm text-danger-600">{state.error}</p>}
      <button type="submit" disabled={pending} className={buttonClass({ full: true, size: "lg" })}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
