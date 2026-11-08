import "./globals.css";

// The <html> element is rendered by src/app/[locale]/layout.tsx (customer site)
// and src/app/admin/layout.tsx (staff area). See next-intl App Router setup.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
