"use client";

import { useEffect, useMemo, useState } from "react";
import { MessageCircle, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { buttonClass } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { whatsappUrl } from "@/lib/site";

export type ShopSort = "featured" | "price-asc" | "price-desc" | "name";
const SORTS: ShopSort[] = ["featured", "price-asc", "price-desc", "name"];

export interface ShopGridItem {
  slug: string;
  name: string;
  search: string;
  /** Cheapest possible order (per-sq-ft: minimum billable size); null = quote only. */
  minPrice: number | null;
  featuredRank: number;
  node: React.ReactNode;
}

// Literal class names (Tailwind must see them). Index = number of columns the card spans.
const SPAN_BASE = ["", "col-span-1", "col-span-2"];
const SPAN_MD = ["", "md:col-span-1", "md:col-span-2", "md:col-span-3"];
const SPAN_LG = ["", "lg:col-span-1", "lg:col-span-2", "lg:col-span-3", "lg:col-span-4"];

/** Columns the "ask on WhatsApp" card spans so it fills the last row (a whole row when the last one is full). */
function fillSpan(count: number, cols: number): number {
  const rem = count % cols;
  return rem === 0 ? cols : cols - rem;
}

/**
 * Client-side search + sort over server-rendered cards: the page stays static,
 * and sorting applies instantly. State is mirrored in the URL (?q=&sort=).
 */
export function ShopGrid({ items }: { items: ShopGridItem[] }) {
  const t = useTranslations("shop");
  const tc = useTranslations("common");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<ShopSort>("featured");

  // Read initial state from the URL once (after hydration).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get("sort");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from the URL after hydration
    if (s && (SORTS as string[]).includes(s)) setSort(s as ShopSort);
    const query = params.get("q");
    if (query) setQ(query.slice(0, 100));
  }, []);

  // Mirror state into the URL without navigation.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (q) params.set("q", q);
    else params.delete("q");
    if (sort !== "featured") params.set("sort", sort);
    else params.delete("sort");
    const qs = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
  }, [q, sort]);

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = needle ? items.filter((i) => i.search.includes(needle)) : [...items];
    const price = (i: ShopGridItem) => i.minPrice ?? Number.MAX_SAFE_INTEGER;
    if (sort === "price-asc") list.sort((a, b) => price(a) - price(b));
    else if (sort === "price-desc") list.sort((a, b) => (b.minPrice ?? -1) - (a.minPrice ?? -1));
    else if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
    else list.sort((a, b) => a.featuredRank - b.featuredRank);
    return list;
  }, [items, q, sort]);

  const labels: Record<ShopSort, string> = {
    featured: t("sortFeatured"),
    "price-asc": t("sortPriceAsc"),
    "price-desc": t("sortPriceDesc"),
    name: t("sortName"),
  };

  return (
    <>
      <form role="search" onSubmit={(e) => e.preventDefault()} className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <span className="sr-only">{t("searchLabel")}</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-ink-300" aria-hidden="true" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value.slice(0, 100))}
            placeholder={t("searchPlaceholder")}
            className="h-11 w-full rounded-control border border-line bg-surface pl-10 pr-3 text-[16px] placeholder:text-ink-300 focus:border-brand-400 focus:outline-none"
          />
        </label>
        <label className="sm:w-56">
          <span className="sr-only">{t("sortLabel")}</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as ShopSort)} className="h-11 w-full rounded-control border border-line bg-surface px-3 text-[15px]">
            {SORTS.map((s) => (<option key={s} value={s}>{labels[s]}</option>))}
          </select>
        </label>
      </form>

      <p className="mt-4 text-sm text-ink-500" aria-live="polite">{t("results", { count: visible.length })}</p>

      {visible.length > 0 ? (
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {visible.map((i) => (<li key={i.slug}>{i.node}</li>))}
          <li className={`${SPAN_BASE[fillSpan(visible.length, 2)]} ${SPAN_MD[fillSpan(visible.length, 3)]} ${SPAN_LG[fillSpan(visible.length, 4)]}`}>
            <div className="flex h-full min-h-40 flex-col justify-center gap-3 rounded-card border border-dashed border-brand-300 bg-brand-50 p-5">
              <MessageCircle className="size-7 text-brand-600" strokeWidth={1.5} aria-hidden="true" />
              <div>
                <h2 className="font-sans text-base font-semibold leading-snug">{t("cantFindTitle")}</h2>
                <p className="mt-1 text-sm text-ink-700">{t("cantFindText")}</p>
              </div>
              <a href={whatsappUrl(t("cantFindMessage"))} target="_blank" rel="noopener noreferrer" className={buttonClass({ variant: "whatsapp", className: "self-start" })}>
                <WhatsAppIcon /> {tc("chatOnWhatsapp")}
              </a>
            </div>
          </li>
        </ul>
      ) : (
        <div className="mt-6 rounded-card border border-dashed border-paper-400 bg-surface p-8 text-center">
          <h2 className="text-xl">{t("emptyTitle")}</h2>
          <p className="mx-auto mt-2 max-w-md text-ink-700">{t("emptyText")}</p>
          <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
            {q && <button type="button" onClick={() => setQ("")} className={buttonClass({ variant: "secondary" })}>{t("clear")}</button>}
            <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className={buttonClass({ variant: "whatsapp" })}>{tc("whatsappUs")}</a>
          </div>
        </div>
      )}
    </>
  );
}
