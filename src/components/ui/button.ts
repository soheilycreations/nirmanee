import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "accent" | "whatsapp" | "dark";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-on-primary hover:bg-primary-hover",
  secondary: "bg-surface text-fg border border-line hover:border-ink-300",
  ghost: "text-brand-600 hover:bg-brand-50",
  accent: "bg-accent-500 text-ink-900 hover:bg-accent-300",
  whatsapp: "bg-whatsapp text-white hover:bg-whatsapp-hover",
  dark: "bg-ink-900 text-white hover:bg-ink-700",
};

// md/lg meet the 44px minimum tap target.
const sizes: Record<Size, string> = {
  sm: "h-10 px-4 text-sm",
  md: "h-11 px-5 text-[15px]",
  lg: "h-13 px-6 text-base",
};

export function buttonClass(opts: { variant?: Variant; size?: Size; full?: boolean; className?: string } = {}) {
  const { variant = "primary", size = "md", full = false, className } = opts;
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-control font-semibold transition-colors duration-150",
    "disabled:cursor-not-allowed disabled:bg-paper-300 disabled:text-ink-300 disabled:border-transparent",
    variants[variant],
    sizes[size],
    full && "w-full",
    className,
  );
}
