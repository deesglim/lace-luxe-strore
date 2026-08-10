"use client";

import { useRef, useState } from "react";

export type MediaItem =
  | { kind: "existing"; url: string; mediaType: "image" | "video" }
  | { kind: "pending"; file: File; previewUrl: string; mediaType: "image" | "video" };

export function createPendingMediaItem(file: File): MediaItem {
  return {
    kind: "pending",
    file,
    previewUrl: URL.createObjectURL(file),
    mediaType: file.type.startsWith("video/") ? "video" : "image",
  };
}

export function mediaItemUrl(item: MediaItem): string {
  return item.kind === "existing" ? item.url : item.previewUrl;
}

export default function MediaUploader({
  item,
  onChange,
  uploading,
}: {
  item: MediaItem | null;
  onChange: (item: MediaItem | null) => void;
  uploading?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [rejectedMessage, setRejectedMessage] = useState<string | null>(null);

  function handleFiles(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      setRejectedMessage("Please choose a photo or video file.");
      return;
    }
    setRejectedMessage(null);
    if (item?.kind === "pending") URL.revokeObjectURL(item.previewUrl);
    onChange(createPendingMediaItem(file));
  }

  function handleRemove() {
    if (item?.kind === "pending") URL.revokeObjectURL(item.previewUrl);
    onChange(null);
  }

  return (
    <div className="flex flex-col gap-3">
      {item ? (
        <div className="relative aspect-[9/16] w-40 overflow-hidden rounded-md border border-blush bg-blush/30">
          {item.mediaType === "video" ? (
            <video
              src={mediaItemUrl(item)}
              className="h-full w-full object-cover"
              muted
              controls
              preload="metadata"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={mediaItemUrl(item)} alt="" className="h-full w-full object-cover" />
          )}

          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-espresso/60">
              <span className="font-sans text-xs text-ivory">Uploading…</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleRemove}
            className="absolute right-1 top-1 bg-espresso/70 px-1.5 py-0.5 font-sans text-xs text-ivory hover:text-blush"
            aria-label="Remove media"
          >
            ✕
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className="w-40 cursor-pointer border border-dashed border-charcoal/30 px-4 py-10 text-center transition hover:border-bronze"
        >
          <p className="font-sans text-xs text-charcoal/70">
            Click to upload a photo or short video
          </p>
        </div>
      )}

      {rejectedMessage && (
        <p className="font-sans text-xs text-bronze">{rejectedMessage}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
