import { ArrowRight, BadgeCheck, ImagePlus, PenTool, Truck } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/cn";

/** "Your photo → our mockup → you approve → printed & delivered". */
export async function OrderJourney({ freeRevisions, compact = false, headingLevel = 2 }: { freeRevisions: number; compact?: boolean; headingLevel?: 2 | 3 }) {
  const t = await getTranslations("home");
  const steps = [
    { icon: ImagePlus, title: t("journey1Title"), text: t("journey1Text"), tint: "bg-brand-50 text-brand-600" },
    { icon: PenTool, title: t("journey2Title"), text: t("journey2Text"), tint: "bg-royal-100 text-royal-500" },
    { icon: BadgeCheck, title: t("journey3Title"), text: t("journey3Text", { free: freeRevisions }), tint: "bg-accent-100 text-accent-700" },
    { icon: Truck, title: t("journey4Title"), text: t("journey4Text"), tint: "bg-success-50 text-success-600" },
  ];
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <section aria-labelledby="journey-heading" className={cn(compact ? "" : "bg-sunken")}>
      <div className={cn("mx-auto max-w-6xl", compact ? "" : "px-4 py-12 sm:py-16")}>
        <Heading id="journey-heading" className={compact ? "text-xl" : "text-2xl sm:text-display-sm"}>{t("journeyTitle")}</Heading>
        <p className="mt-1 text-ink-700">{t("journeySubtitle")}</p>
        <ol className={cn("mt-6 grid gap-3", compact ? "grid-cols-2" : "grid-cols-2 lg:grid-cols-4 lg:gap-0")}>
          {steps.map((s, i) => (
            <li key={s.title} className="relative flex flex-col items-start lg:items-center lg:px-4 lg:text-center">
              <div className={cn("relative flex items-center justify-center rounded-full", compact ? "size-12" : "size-16", s.tint)}>
                <s.icon className={compact ? "size-6" : "size-8"} strokeWidth={1.5} aria-hidden="true" />
                <span className="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full bg-ink-900 text-xs font-bold text-white">{i + 1}</span>
              </div>
              {!compact && i < steps.length - 1 && (
                <ArrowRight className="absolute right-[-0.75rem] top-5 hidden size-5 text-paper-400 lg:block" aria-hidden="true" />
              )}
              <p className={cn("mt-3 font-semibold", compact ? "text-sm" : "text-base")}>{s.title}</p>
              <p className="mt-0.5 text-sm text-ink-700">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
