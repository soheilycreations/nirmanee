import type { Metadata, Viewport } from "next";
import { Abhaya_Libre, Fraunces, Inter, Noto_Sans_Sinhala } from "next/font/google";
import "./globals.css";

// Font variables are consumed by the design tokens in globals.css
// (--font-sans, --font-display, --font-sinhala, --font-sinhala-display).
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["SOFT", "opsz"],
});

const notoSinhala = Noto_Sans_Sinhala({
  variable: "--font-noto-sinhala",
  subsets: ["sinhala"],
  display: "swap",
  preload: false,
});

const abhaya = Abhaya_Libre({
  variable: "--font-abhaya",
  subsets: ["sinhala"],
  weight: ["400", "600", "700"],
  display: "swap",
  preload: false,
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://nirmanee.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Nirmanee Digital Print House — Custom Printing in Kalutara",
    template: "%s | Nirmanee Digital Print House",
  },
  description:
    "Online print studio in Kalutara, Sri Lanka: photo framing, mug & sublimation printing, banners, crystal printing, laser cutting & wood engraving, T-shirts and custom souvenirs — designed for you, delivered islandwide.",
  applicationName: "Nirmanee Digital Print House",
  openGraph: {
    type: "website",
    siteName: "Nirmanee Digital Print House",
    locale: "en_LK",
    alternateLocale: ["si_LK"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0070c0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} ${notoSinhala.variable} ${abhaya.variable}`}
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
