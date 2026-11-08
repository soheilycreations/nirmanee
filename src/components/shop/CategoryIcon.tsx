import { Cake, Coffee, FileText, Flag, Frame, Gem, Gift, Maximize, PenTool, Printer, Scissors, Shirt, Sparkles, type LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  "mug-printing": Coffee,
  "photo-framing": Frame,
  "laser-cutting": Scissors,
  "wood-engraving": PenTool,
  "crystal-printing": Gem,
  banners: Flag,
  "digital-printing": Printer,
  "plan-printing": FileText,
  "photo-enlargement": Maximize,
  "t-shirt-printing": Shirt,
  "edible-print": Cake,
  "custom-souvenirs": Gift,
};

export function CategoryIcon({ slug, className = "size-6" }: { slug: string; className?: string }) {
  const Icon = ICONS[slug] ?? Sparkles;
  return <Icon className={className} strokeWidth={1.5} aria-hidden="true" />;
}
