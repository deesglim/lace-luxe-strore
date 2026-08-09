"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { formatNaira } from "@/lib/format";
import type { ShowcaseItem } from "@/lib/showcase";

export default function ShowcaseCard({ item }: { item: ShowcaseItem }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);
  const { addItem } = useCart();

  function togglePlay() {
    const video = videoRef.current;
    if (!video) return;
    if (playing) {
      video.pause();
    } else {
      video.play();
    }
    setPlaying((p) => !p);
  }

  function toggleMute() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }

  function handleQuickAdd() {
    const product = item.product;
    if (!product) return;
    addItem(
      {
        productId: product.id,
        productSlug: product.slug,
        variantId: product.variantId,
        colorId: null,
        sizeLabel: product.sizeLabel,
        colorName: null,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity: 1,
        laceType: null,
      },
      product.stockQuantity,
    );
  }

  return (
    <div className="relative h-[420px] w-[240px] shrink-0 snap-start overflow-hidden rounded-md border border-blush bg-espresso shadow-sm">
      {item.mediaType === "video" ? (
        <video
          ref={videoRef}
          src={item.mediaUrl}
          className="h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.mediaUrl} alt="" className="h-full w-full object-cover" />
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-espresso/60 via-transparent to-espresso/80" />

      {(item.handleText || item.followerText) && (
        <div className="absolute left-3 right-14 top-3 flex flex-col gap-0.5">
          {item.handleText && (
            <span className="truncate font-sans text-sm font-medium text-ivory [text-shadow:0_1px_2px_rgba(0,0,0,0.5)]">
              {item.handleText}
            </span>
          )}
          {item.followerText && (
            <span className="truncate font-sans text-xs text-ivory/80 [text-shadow:0_1px_2px_rgba(0,0,0,0.5)]">
              {item.followerText}
            </span>
          )}
        </div>
      )}

      {item.mediaType === "video" && (
        <div className="absolute right-3 top-3 flex flex-col gap-2">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={playing ? "Pause video" : "Play video"}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-espresso/60 text-sm text-ivory"
          >
            {playing ? "❚❚" : "►"}
          </button>
          <button
            type="button"
            onClick={toggleMute}
            aria-label={muted ? "Unmute video" : "Mute video"}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-espresso/60 text-sm text-ivory"
          >
            {muted ? "🔇" : "🔊"}
          </button>
        </div>
      )}

      <div className="absolute inset-x-2 bottom-2 flex flex-col gap-2">
        {item.captionText && (
          <p className="line-clamp-2 px-1 font-sans text-sm text-ivory [text-shadow:0_1px_2px_rgba(0,0,0,0.5)]">
            {item.captionText}
          </p>
        )}

        {item.product && (
          <div className="flex items-center gap-2 rounded-md bg-ivory/95 p-2 shadow-md">
            <Link
              href={`/shop/${item.product.slug}`}
              className="flex flex-1 items-center gap-2 overflow-hidden"
            >
              <div className="h-9 w-9 shrink-0 overflow-hidden rounded bg-blush">
                {item.product.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.product.image}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="truncate font-sans text-xs text-espresso">
                  {item.product.name}
                </span>
                <span className="font-sans text-xs text-charcoal/70">
                  {formatNaira(item.product.price)}
                </span>
              </div>
            </Link>
            <button
              type="button"
              onClick={handleQuickAdd}
              aria-label={`Quick add ${item.product.name} to cart`}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-espresso text-sm text-ivory transition hover:bg-espresso/90"
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
