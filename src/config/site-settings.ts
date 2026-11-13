/**
 * OWNER-EDITABLE SITE SETTINGS
 * ---------------------------------------------------------------------------
 * Every value below starts as `null` (TODO). Sections that use a value stay
 * HIDDEN until it is filled in — nothing is ever shown with made-up data.
 * After editing, commit and redeploy.
 */
export interface SiteReview {
  author: string;
  /** 1–5, optional. */
  rating?: number;
  text: { en: string; si?: string };
}

export interface SiteSettings {
  /** TODO(owner): Google Business rating, e.g. { rating: 4.8, reviewCount: 57, url: "https://g.page/r/…" } */
  googleRating: { rating: number; reviewCount: number; url: string } | null;
  /** TODO(owner): street address shown on Contact/Home, e.g. { en: "No. 12, Main Street, Kalutara", si: "අංක 12, ප්‍රධාන වීදිය, කළුතර" } */
  streetAddress: { en: string; si: string } | null;
  /** TODO(owner): Google Maps → Share → "Embed a map" → copy ONLY the src="…" URL (starts with https://www.google.com/maps/embed?pb=) */
  mapEmbedUrl: string | null;
  /** TODO(owner): Google Maps link to the business listing (Share → Copy link), replaces the generic search link */
  mapsLink: string | null;
  /** TODO(owner): year the shop opened, e.g. 2005 — shows "Serving Kalutara since 2005" */
  servingSince: number | null;
  /** TODO(owner): public contact email */
  email: string | null;
  /** TODO(owner): social profile URLs */
  socials: { facebook: string | null; instagram: string | null; tiktok: string | null; youtube: string | null };
  /**
   * TODO(owner): real customer reviews to show on the home page, e.g.
   * { author: "Nimali P.", rating: 5, text: { en: "Beautiful mug, arrived in two days.", si: "…" } }.
   * Only add reviews customers actually wrote (and agreed to have shown). Empty → the reviews strip is hidden.
   */
  reviews: SiteReview[];
  /** Set to false once the owner has reviewed /privacy, /terms and /returns (removes the "draft" notice). */
  legalDraft: boolean;
}

export const SITE_SETTINGS: SiteSettings = {
  googleRating: null,
  streetAddress: null,
  mapEmbedUrl: null,
  mapsLink: null,
  servingSince: null,
  email: null,
  socials: { facebook: null, instagram: null, tiktok: null, youtube: null },
  reviews: [],
  legalDraft: true,
};

export function hasAnyTrustInfo(s: SiteSettings = SITE_SETTINGS): boolean {
  return Boolean(s.googleRating || s.streetAddress || s.mapEmbedUrl || s.servingSince);
}
