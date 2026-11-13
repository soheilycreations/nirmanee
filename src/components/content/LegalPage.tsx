import { AlertTriangle } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { SITE_SETTINGS } from "@/config/site-settings";
import { fillPlaceholders, legalDoc, type LegalSlug } from "@/content/legal";
import { getPublicSettings } from "@/features/settings/queries";
import { formatLKR } from "@/lib/format";
import { SITE } from "@/lib/site";

export async function legalPlaceholders(): Promise<Record<string, string>> {
  const settings = await getPublicSettings();
  return {
    revisionFee: formatLKR(settings.revision_fee_lkr),
    freeRevisions: String(settings.free_revisions),
    phone: SITE.phoneDisplay,
    whatsapp: SITE.whatsappDisplay,
    email: SITE.email ?? "",
  };
}

export async function LegalPage({ slug, locale }: { slug: LegalSlug; locale: string }) {
  const t = await getTranslations("legal");
  const doc = legalDoc(slug, locale);
  const values = await legalPlaceholders();
  const fill = (s: string) => fillPlaceholders(s, values);
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <h1 className="text-display-sm sm:text-display-md">{doc.title}</h1>
      {SITE_SETTINGS.legalDraft && (
        <p className="mt-4 flex items-start gap-2 rounded-control bg-warning-50 p-3 text-sm text-warning-600">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" /> {t("draftNotice")}
        </p>
      )}
      <p className="mt-5 text-lg text-ink-700">{fill(doc.intro)}</p>
      {doc.sections.map((section) => (
        <section key={section.heading} className="mt-8">
          <h2 className="text-xl">{section.heading}</h2>
          {section.body.length > 1 ? (
            <ul className="mt-3 list-disc space-y-2 pl-5 text-ink-700 marker:text-brand-500">
              {section.body.map((p) => (<li key={p}>{fill(p)}</li>))}
            </ul>
          ) : (
            <p className="mt-3 text-ink-700">{fill(section.body[0])}</p>
          )}
        </section>
      ))}
      <p className="mt-10 border-t border-line pt-5 text-sm text-ink-500">{t("contactLine", { whatsapp: SITE.whatsappDisplay, phone: SITE.phoneDisplay })}</p>
    </article>
  );
}
