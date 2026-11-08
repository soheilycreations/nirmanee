import type { Metadata } from "next";
import { requireStaff } from "@/features/auth/staff";
import { signOutStaff } from "@/features/auth/actions";
import { buttonClass } from "@/components/ui/button";

export const metadata: Metadata = { title: "Dashboard" };

// Always evaluate the session and staff role per request.
export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const staff = await requireStaff();
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">Nirmanee staff</p>
      <h1 className="mt-2 text-display-sm">Hello, {staff.displayName}</h1>
      <p className="mt-2 text-ink-700">
        Signed in as {staff.email} · role <strong className="capitalize">{staff.role}</strong>
      </p>
      <div className="mt-8 rounded-card border border-line bg-surface p-6 shadow-card">
        <h2 className="text-xl">Job board coming in Phase 2</h2>
        <p className="mt-2 text-ink-700">
          The kanban job board, proofs, chat and catalogue editor are built in the next phase. This area is already
          protected: only active staff accounts can open it.
        </p>
      </div>
      <form action={signOutStaff} className="mt-6">
        <button type="submit" className={buttonClass({ variant: "secondary" })}>Sign out</button>
      </form>
    </div>
  );
}
