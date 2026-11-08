import { getTranslations } from "next-intl/server";
import { whatsappUrl } from "@/lib/site";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";

export async function WhatsAppFab() {
  const t = await getTranslations("common");
  return (
    <a
      href={whatsappUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("chatOnWhatsapp")}
      className="wa-fab fixed bottom-4 right-4 z-40 inline-flex size-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-lift transition-[bottom,background-color] hover:bg-whatsapp-hover"
    >
      <WhatsAppIcon className="size-7" />
    </a>
  );
}
