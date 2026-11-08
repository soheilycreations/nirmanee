/** Upload rules shared by the browser uploader and the server actions. */

export const MAX_UPLOAD_BYTES = 500 * 1024 * 1024; // 500 MB
export const MAX_FILES_PER_ITEM = 10;

const TYPES = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  heic: "image/heic",
  heif: "image/heif",
  pdf: "application/pdf",
  ai: "application/postscript",
  zip: "application/zip",
} as const;

export type AllowedExtension = keyof typeof TYPES;

export const ACCEPT_ATTRIBUTE = [
  ...Object.keys(TYPES).map((e) => `.${e}`),
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/heif",
  "application/pdf",
  "application/zip",
].join(",");

export function extensionOf(fileName: string): string {
  const i = fileName.lastIndexOf(".");
  return i === -1 ? "" : fileName.slice(i + 1).toLowerCase();
}

export function isAllowedExtension(ext: string): ext is AllowedExtension {
  return Object.prototype.hasOwnProperty.call(TYPES, ext);
}

/** Content type we sign and store. Extension wins: phones often send "" or odd types. */
export function contentTypeFor(fileName: string): string | null {
  const ext = extensionOf(fileName);
  return isAllowedExtension(ext) ? TYPES[ext] : null;
}

/** Image types the browser can decode for thumbnails / resolution checks. */
export function isDecodableImage(fileName: string): boolean {
  const ext = extensionOf(fileName);
  return ext === "jpg" || ext === "jpeg" || ext === "png" || ext === "heic" || ext === "heif";
}

export function safeFileName(fileName: string): string {
  const ext = extensionOf(fileName);
  const base = fileName.slice(0, fileName.length - (ext ? ext.length + 1 : 0));
  const clean = base
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${clean || "file"}${ext ? `.${ext}` : ""}`;
}
