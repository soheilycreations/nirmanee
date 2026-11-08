import { Clock, MapPin, Truck } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/cn";

/** "Ready in X days · Pickup Kalutara · Islandwide 2–4 days" */
export async function DeliveryLine({ days, className }: { days: number; className?: string }) {
  const t = await getTranslations("common");
  return (
    <ul className={cn("flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-700", className)}>
      <li className="inline-flex items-center gap-1.5"><Clock className="size-4 text-brand-600" aria-hidden="true" />{t("readyIn", { days })}</li>
      <li className="inline-flex items-center gap-1.5"><MapPin className="size-4 text-brand-600" aria-hidden="true" />{t("pickupKalutara")}</li>
      <li className="inline-flex items-center gap-1.5"><Truck className="size-4 text-brand-600" aria-hidden="true" />{t("islandwide", { days: SITE.islandwideDeliveryDays })}</li>
    </ul>
  );
}
