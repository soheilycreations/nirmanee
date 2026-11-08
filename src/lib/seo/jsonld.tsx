import { SITE } from "@/lib/site";
import { siteUrl } from "@/lib/env";

/** Renders JSON-LD safely (escapes "<" to prevent breaking out of the script tag). */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export function localBusinessJsonLd(): Record<string, unknown> {
  const url = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${url}/#business`,
    name: SITE.name,
    url,
    image: `${url}/images/brand/nirmanee-logo.jpg`,
    logo: `${url}/images/brand/nirmanee-logo.jpg`,
    telephone: SITE.phone,
    priceRange: "Rs",
    currenciesAccepted: "LKR",
    address: {
      "@type": "PostalAddress",
      addressLocality: SITE.address.locality,
      addressRegion: SITE.address.region,
      addressCountry: SITE.address.country,
    },
    areaServed: { "@type": "Country", name: "Sri Lanka" },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: SITE.hours.opens,
        closes: SITE.hours.closes,
      },
    ],
    contactPoint: [
      { "@type": "ContactPoint", telephone: `+${SITE.whatsappNumber}`, contactType: "customer service", availableLanguage: ["en", "si"] },
    ],
  };
}
