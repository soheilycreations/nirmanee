/** "Rs 1,450" — whole rupees, en-LK grouping. */
export function formatLKR(amount: number): string {
  return `Rs ${Math.round(amount).toLocaleString("en-LK")}`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

/** Inches → "24 × 36 in" or, for large formats, "2 × 3 ft". */
export function formatSize(widthIn: number, heightIn: number, unit: "in" | "ft" = "in"): string {
  if (unit === "ft") {
    const f = (v: number) => Number((v / 12).toFixed(2)).toString();
    return `${f(widthIn)} × ${f(heightIn)} ft`;
  }
  const i = (v: number) => Number(v.toFixed(2)).toString();
  return `${i(widthIn)} × ${i(heightIn)} in`;
}
