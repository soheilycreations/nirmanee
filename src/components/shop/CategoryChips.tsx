"use client";

import { useEffect, useRef } from "react";

/** Horizontal chip row that scrolls the active chip into view on mount (12 chips overflow on phones). */
export function CategoryChips({ label, children }: { label: string; children: React.ReactNode }) {
  const ref = useRef<HTMLUListElement>(null);
  useEffect(() => {
    const list = ref.current;
    const active = list?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!list || !active) return;
    // Scroll the row only (never the page).
    list.scrollLeft = Math.max(0, active.offsetLeft - list.offsetLeft - (list.clientWidth - active.offsetWidth) / 2);
  }, []);
  return (
    <nav aria-label={label} className="mt-5">
      <ul ref={ref} className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto scroll-smooth px-4 pb-1">
        {children}
      </ul>
    </nav>
  );
}
