import { SITE_SETTINGS } from "@/config/site-settings";

/** Business facts used across the site, JSON-LD and WhatsApp links. */
export const SITE = {
  name: "Nirmanee Digital Print House",
  shortName: "Nirmanee",
  whatsappNumber: "94779233822", // wa.me format, no "+"
  whatsappDisplay: "077 923 3822",
  phone: "+94342040029",
  phoneDisplay: "034 204 0029",
  email: SITE_SETTINGS.email ?? (process.env.NEXT_PUBLIC_CONTACT_EMAIL || null),
  address: {
    locality: "Kalutara",
    region: "Western Province",
    country: "LK",
  },
  // Mon–Sun 8.30 AM – 5.30 PM
  hours: { opens: "08:30", closes: "17:30", days: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"] },
  mapsUrl: SITE_SETTINGS.mapsLink ?? "https://www.google.com/maps/search/?api=1&query=Nirmanee+Digital+Print+House+Kalutara",
  islandwideDeliveryDays: "2–4",
} as const;

export function whatsappUrl(message?: string): string {
  const base = `https://wa.me/${SITE.whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
