"use client";

import { useEffect, useRef, useState } from "react";

export default function ProductGallery({
  images,
  productName,
}: {
  images: string[];
  productName: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hasOverflow, setHasOverflow] = useState(false);
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = stripRef.current;
    if (!el) return;

    const checkOverflow = () => setHasOverflow(el.scrollWidth > el.clientWidth + 1);
    checkOverflow();

    const observer = new ResizeObserver(checkOverflow);
    observer.observe(el);
    return () => observer.disconnect();
  }, [images]);

  if (images.length === 0) {
    return (
      <div className="aspect-[4/5] w-full overflow-hidden rounded-brand border-2 border-blush bg-blush shadow-[0_16px_40px_rgba(58,47,42,0.12)]">
        <div className="flex h-full w-full items-center justify-center">
          <span className="font-heading text-3xl italic text-bronze">LL</span>
        </div>
      </div>
    );
  }

  const activeImage = images[activeIndex] ?? images[0];

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-brand border-2 border-blush bg-blush shadow-[0_16px_40px_rgba(58,47,42,0.12)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={activeImage}
          alt={productName}
          className="h-full w-full object-cover"
        />
        {images.length > 1 && (
          <span className="absolute bottom-3 right-3 rounded-full bg-espresso/80 px-2.5 py-1 font-label text-[10px] font-medium text-ivory backdrop-blur-sm">
            {activeIndex + 1} / {images.length}
          </span>
        )}
      </div>

      {images.length > 1 && (
        <div className="relative">
          {/*
            Capped to exactly 4 thumbnails' worth of width (4 thumbs + 3
            gaps) at each breakpoint, so a 5th+ image never squeezes in or
            gets cut off mid-thumbnail — it scrolls/snaps sideways instead,
            like a small slider.
          */}
          <div
            ref={stripRef}
            className="flex w-full max-w-[304px] snap-x snap-mandatory gap-2 overflow-x-auto scroll-smooth md:max-w-[384px] lg:max-w-[624px] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {images.map((image, index) => (
              <button
                key={image}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`h-[88px] w-[70px] shrink-0 snap-start overflow-hidden rounded-lg border-2 transition md:h-[112px] md:w-[90px] lg:h-[188px] lg:w-[150px] ${
                  index === activeIndex
                    ? "border-bronze shadow-[0_4px_12px_rgba(156,107,63,0.35)]"
                    : "border-blush opacity-70 hover:border-bronze hover:opacity-100"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt={`${productName} thumbnail ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
          {hasOverflow && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 right-0 flex w-8 items-center justify-end bg-gradient-to-l from-blush/60 to-transparent"
            >
              <span className="font-sans text-bronze">›</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
