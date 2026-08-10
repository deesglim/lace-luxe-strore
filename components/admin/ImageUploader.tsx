"use client";

import { useRef, useState, type DragEvent } from "react";

export type ImageItem =
  | { key: string; kind: "existing"; url: string }
  | { key: string; kind: "pending"; file: File; previewUrl: string };

export function createPendingImageItem(file: File): ImageItem {
  return {
    key: crypto.randomUUID(),
    kind: "pending",
    file,
    previewUrl: URL.createObjectURL(file),
  };
}

export function imageItemUrl(item: ImageItem): string {
  return item.kind === "existing" ? item.url : item.previewUrl;
}

export default function ImageUploader({
  images,
  onChange,
  uploadingKeys,
}: {
  images: ImageItem[];
  onChange: (images: ImageItem[]) => void;
  uploadingKeys?: Set<string>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [rejectedMessage, setRejectedMessage] = useState<string | null>(null);

  function addFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    const validFiles = files.filter((file) => file.type.startsWith("image/"));
    const newItems = validFiles.map(createPendingImageItem);
    if (newItems.length > 0) {
      onChange([...images, ...newItems]);
    }
    setRejectedMessage(
      validFiles.length < files.length
        ? "Only image files can be uploaded here — anything else was skipped."
        : null,
    );
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    addFiles(event.dataTransfer.files);
  }

  function moveImage(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function removeImage(key: string) {
    const target = images.find((item) => item.key === key);
    if (target?.kind === "pending") {
      URL.revokeObjectURL(target.previewUrl);
    }
    onChange(images.filter((item) => item.key !== key));
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="cursor-pointer border border-dashed border-charcoal/30 px-6 py-10 text-center transition hover:border-bronze"
      >
        <p className="font-sans text-sm text-charcoal/70">
          Click to browse or drag and drop images here
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {rejectedMessage && (
        <p className="font-sans text-xs text-bronze">{rejectedMessage}</p>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((item, index) => {
            const isUploading = uploadingKeys?.has(item.key);
            return (
              <div
                key={item.key}
                className="relative aspect-square overflow-hidden border border-blush bg-blush/30"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageItemUrl(item)}
                  alt=""
                  className="h-full w-full object-cover"
                />

                {index === 0 && (
                  <span className="absolute left-1 top-1 bg-espresso px-2 py-0.5 font-sans text-[10px] uppercase tracking-wide text-ivory">
                    Main
                  </span>
                )}

                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-espresso/60">
                    <span className="font-sans text-xs text-ivory">
                      Uploading…
                    </span>
                  </div>
                )}

                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-espresso/70 px-1 py-1">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => moveImage(index, -1)}
                      disabled={index === 0}
                      className="px-1 font-sans text-xs text-ivory disabled:opacity-30"
                      aria-label="Move image earlier"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={() => moveImage(index, 1)}
                      disabled={index === images.length - 1}
                      className="px-1 font-sans text-xs text-ivory disabled:opacity-30"
                      aria-label="Move image later"
                    >
                      →
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(item.key)}
                    className="px-1 font-sans text-xs text-ivory hover:text-blush"
                    aria-label="Remove image"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
