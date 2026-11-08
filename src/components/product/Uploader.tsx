"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, FileArchive, FileText, ImageIcon, Loader2, RotateCcw, UploadCloud, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { confirmUpload, removeUpload, requestUpload } from "@/features/uploads/actions";
import {
  ACCEPT_ATTRIBUTE,
  MAX_FILES_PER_ITEM,
  MAX_UPLOAD_BYTES,
  extensionOf,
  isAllowedExtension,
  isDecodableImage,
} from "@/features/uploads/rules";
import { effectivePpi, resolutionVerdict } from "@/lib/pricing";
import { formatBytes, formatSize } from "@/lib/format";
import { whatsappUrl } from "@/lib/site";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { cn } from "@/lib/cn";

export interface UploadState {
  uploadedIds: string[];
  busy: boolean;
}

interface Item {
  localId: string;
  file: File;
  status: "uploading" | "uploaded" | "failed";
  progress: number;
  fileId?: string;
  previewUrl?: string;
  previewFailed?: boolean;
  widthPx?: number;
  heightPx?: number;
}

function measureImage(url: string): Promise<{ widthPx: number; heightPx: number } | null> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => resolve({ widthPx: img.naturalWidth, heightPx: img.naturalHeight });
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

function putWithProgress(url: string, file: File, contentType: string, onProgress: (p: number) => void): Promise<boolean> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => resolve(xhr.status >= 200 && xhr.status < 300);
    xhr.onerror = () => resolve(false);
    xhr.onabort = () => resolve(false);
    xhr.send(file);
  });
}

function FileIcon({ name }: { name: string }) {
  const ext = extensionOf(name);
  if (ext === "zip") return <FileArchive className="size-6" aria-hidden="true" />;
  if (ext === "pdf" || ext === "ai") return <FileText className="size-6" aria-hidden="true" />;
  return <ImageIcon className="size-6" aria-hidden="true" />;
}

export function Uploader({
  enabled,
  productName,
  printSize,
  largeFormat,
  sizeUnit,
  photoSlots,
  onChange,
}: {
  enabled: boolean;
  productName: string;
  printSize: { widthIn: number; heightIn: number } | null;
  largeFormat: boolean;
  sizeUnit: "in" | "ft";
  photoSlots: number | null;
  onChange: (state: UploadState) => void;
}) {
  const t = useTranslations("uploader");
  const inputId = useId();
  const [items, setItems] = useState<Item[]>([]);
  const [messages, setMessages] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    onChange({
      uploadedIds: items.filter((i) => i.status === "uploaded" && i.fileId).map((i) => i.fileId!),
      busy: items.some((i) => i.status === "uploading"),
    });
  }, [items, onChange]);

  // Revoke object URLs on unmount.
  useEffect(() => () => itemsRef.current.forEach((i) => i.previewUrl && URL.revokeObjectURL(i.previewUrl)), []);

  const patch = useCallback((localId: string, update: Partial<Item>) => {
    setItems((prev) => prev.map((i) => (i.localId === localId ? { ...i, ...update } : i)));
  }, []);

  const upload = useCallback(
    async (item: Item) => {
      patch(item.localId, { status: "uploading", progress: 0 });
      const req = await requestUpload({ fileName: item.file.name, sizeBytes: item.file.size });
      if (!req.ok) {
        patch(item.localId, { status: "failed" });
        return;
      }
      const ok = await putWithProgress(req.uploadUrl, item.file, req.contentType, (progress) => patch(item.localId, { progress }));
      if (!ok) {
        patch(item.localId, { status: "failed" });
        return;
      }
      const confirmed = await confirmUpload({ fileId: req.fileId, widthPx: item.widthPx ?? null, heightPx: item.heightPx ?? null });
      patch(item.localId, confirmed.ok ? { status: "uploaded", progress: 100, fileId: req.fileId } : { status: "failed" });
    },
    [patch],
  );

  const addFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const errors: string[] = [];
      const accepted: Item[] = [];
      const room = MAX_FILES_PER_ITEM - itemsRef.current.length;
      for (const file of Array.from(fileList)) {
        if (accepted.length >= room) {
          errors.push(t("tooMany", { max: MAX_FILES_PER_ITEM }));
          break;
        }
        if (!isAllowedExtension(extensionOf(file.name))) {
          errors.push(t("badType", { name: file.name }));
          continue;
        }
        if (file.size > MAX_UPLOAD_BYTES) {
          errors.push(t("tooLarge", { name: file.name }));
          continue;
        }
        const item: Item = { localId: crypto.randomUUID(), file, status: "uploading", progress: 0 };
        if (isDecodableImage(file.name)) {
          item.previewUrl = URL.createObjectURL(file);
          const dims = await measureImage(item.previewUrl);
          if (dims) Object.assign(item, dims);
          else item.previewFailed = true; // e.g. HEIC on browsers that can't decode it
        }
        accepted.push(item);
      }
      setMessages(errors);
      if (accepted.length === 0) return;
      setItems((prev) => [...prev, ...accepted]);
      for (const item of accepted) void upload(item);
    },
    [t, upload],
  );

  const remove = useCallback(async (item: Item) => {
    setItems((prev) => prev.filter((i) => i.localId !== item.localId));
    if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    if (item.fileId) await removeUpload({ fileId: item.fileId });
  }, []);

  const fallbackHref = whatsappUrl(t("whatsappMessage", { product: productName }));

  if (!enabled) {
    return (
      <div className="rounded-card border border-dashed border-paper-400 bg-surface p-4">
        <p className="text-sm text-ink-700">{t("unavailable")}</p>
        <a href={fallbackHref} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-11 items-center gap-2 font-semibold text-whatsapp underline-offset-2 hover:underline">
          <WhatsAppIcon /> {t("whatsappFallback")}
        </a>
      </div>
    );
  }

  return (
    <div>
      <label
        htmlFor={inputId}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void addFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed p-5 text-center transition-colors",
          dragging ? "border-brand-400 bg-brand-50" : "border-paper-400 bg-surface hover:border-brand-300",
        )}
      >
        <UploadCloud className="size-8 text-brand-500" aria-hidden="true" />
        <span className="font-semibold text-ink-900">{t("dropHint")}</span>
        <span className="text-xs text-ink-500">{t("formats", { max: MAX_FILES_PER_ITEM })}</span>
        {photoSlots && photoSlots > 1 && <span className="text-xs text-ink-500">{photoSlots} × 📷</span>}
        <input
          id={inputId}
          type="file"
          multiple
          accept={ACCEPT_ATTRIBUTE}
          className="sr-only"
          onChange={(e) => {
            if (e.target.files) void addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </label>

      {messages.length > 0 && (
        <ul role="alert" className="mt-2 space-y-1 text-sm text-danger-600">
          {messages.map((m) => (<li key={m}>{m}</li>))}
        </ul>
      )}

      {items.length > 0 && (
        <ul className="mt-3 space-y-2">
          {items.map((item) => {
            const ppi = printSize && item.widthPx && item.heightPx ? effectivePpi({ widthPx: item.widthPx, heightPx: item.heightPx }, printSize) : null;
            const verdict = ppi !== null ? resolutionVerdict(ppi, largeFormat) : null;
            return (
              <li key={item.localId} className="flex items-center gap-3 rounded-control border border-line bg-surface p-2">
                <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-paper-200 text-ink-500">
                  {item.previewUrl && !item.previewFailed ? (
                    // eslint-disable-next-line @next/next/no-img-element -- local blob: preview, next/image cannot optimise it
                    <img src={item.previewUrl} alt="" className="size-full object-cover" />
                  ) : (
                    <FileIcon name={item.file.name} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.file.name}</p>
                  <p className="text-xs text-ink-500">{formatBytes(item.file.size)}</p>
                  {item.status === "uploading" && (
                    <div className="mt-1">
                      <div className="h-1.5 overflow-hidden rounded-full bg-paper-200" role="progressbar" aria-valuenow={item.progress} aria-valuemin={0} aria-valuemax={100} aria-label={t("uploading", { percent: item.progress })}>
                        <div className="h-full bg-primary transition-[width]" style={{ width: `${item.progress}%` }} />
                      </div>
                      <p className="mt-0.5 text-xs text-ink-500">{t("uploading", { percent: item.progress })}</p>
                    </div>
                  )}
                  {item.status === "uploaded" && (
                    <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-success-600"><CheckCircle2 className="size-3.5" aria-hidden="true" />{t("uploaded")}</p>
                  )}
                  {item.status === "failed" && (
                    <p className="mt-0.5 text-xs text-danger-600">{t("failed")}</p>
                  )}
                  {verdict && printSize && (
                    <p className={cn("mt-0.5 flex items-start gap-1 text-xs", verdict === "good" ? "text-success-600" : verdict === "ok" ? "text-warning-600" : "text-danger-600")}>
                      {verdict !== "good" && <AlertTriangle className="mt-px size-3.5 shrink-0" aria-hidden="true" />}
                      <span>
                        {t("resolution", { ppi: ppi!, size: formatSize(printSize.widthIn, printSize.heightIn, sizeUnit) })} —{" "}
                        {verdict === "good" ? t("resolutionGood") : verdict === "ok" ? t("resolutionOk") : t("resolutionLow")}
                      </span>
                    </p>
                  )}
                </div>
                {item.status === "failed" && (
                  <button type="button" onClick={() => void upload(item)} aria-label={t("retry")} className="inline-flex size-11 items-center justify-center rounded-control text-brand-600 hover:bg-brand-50">
                    <RotateCcw className="size-5" aria-hidden="true" />
                  </button>
                )}
                {item.status === "uploading" ? (
                  <Loader2 className="size-5 shrink-0 animate-spin text-ink-300" aria-hidden="true" />
                ) : (
                  <button type="button" onClick={() => void remove(item)} aria-label={t("remove", { name: item.file.name })} className="inline-flex size-11 shrink-0 items-center justify-center rounded-control text-ink-500 hover:bg-paper-200">
                    <X className="size-5" aria-hidden="true" />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <a href={fallbackHref} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-whatsapp hover:underline">
        <WhatsAppIcon className="size-4" /> {t("whatsappFallback")}
      </a>
    </div>
  );
}
