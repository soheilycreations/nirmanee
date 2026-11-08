import Link from "next/link";
import { fontVariables } from "./fonts";

// Fallback for URLs outside any locale/admin segment.
export default function GlobalNotFound() {
  return (
    <html lang="en" className={fontVariables}>
      <body className="flex min-h-screen items-center justify-center bg-bg p-6 text-fg">
        <main className="max-w-md text-center">
          <h1 className="text-display-sm">Page not found</h1>
          <p className="mt-3 text-fg-muted">The page you were looking for doesn&apos;t exist.</p>
          <Link href="/" className="mt-6 inline-flex h-11 items-center rounded-control bg-primary px-5 font-semibold text-white">
            Back to home
          </Link>
        </main>
      </body>
    </html>
  );
}
