import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { buttonClass } from "@/components/ui/button";
import { whatsappUrl } from "@/lib/site";

export default async function NotFound() {
  const t = await getTranslations();
  return (
    <section className="mx-auto max-w-xl px-4 py-20 text-center">
      <p className="font-display text-6xl text-brand-500">404</p>
      <h1 className="mt-4 text-display-sm">{t("notFound.title")}</h1>
      <p className="mt-3 text-fg-muted">{t("notFound.text")}</p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href="/shop" className={buttonClass({ size: "lg" })}>{t("notFound.toShop")}</Link>
        <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className={buttonClass({ variant: "secondary", size: "lg" })}>
          {t("common.whatsappUs")}
        </a>
      </div>
    </section>
  );
}
