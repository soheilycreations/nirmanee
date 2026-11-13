/** Resolve a stored image key: local "/…" paths and absolute URLs pass through, R2 keys get the public CDN base. */
export function resolveImageSrc(key: string): string {
  if (key.startsWith("/") || key.startsWith("http")) return key;
  const base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "";
  return `${base.replace(/\/$/, "")}/${key}`;
}
