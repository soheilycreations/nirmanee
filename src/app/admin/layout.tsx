import type { Metadata } from "next";
import { fontVariables } from "../fonts";

export const metadata: Metadata = {
  title: { default: "Staff", template: "%s | Nirmanee Staff" },
  robots: { index: false, follow: false },
};

// Staff area: English only, not localised, never indexed.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVariables}>
      <body className="min-h-screen bg-bg text-fg antialiased">{children}</body>
    </html>
  );
}
