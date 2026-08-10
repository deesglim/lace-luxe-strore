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
      <div className="aspect-[4/5] w-full overflow-hidden rounded-brand border border-border bg-blush">
        <div className="flex h-full w-full items-center justify-center">
          <span className="font-heading text-3xl italic text-bronze">LL</span>
        </div>
      </div>
    );
  }

  const activeImage = images[activeIndex] ?? images[0];

  return (
    <div className="flex flex-col gap-3">
      <div className="aspect-[4/5] w-full overflow-hidden rounded-brand border border-border bg-blush">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={activeImage}
          alt={productName}
          className="h-full w-full object-cover"
        />
      </div>

      {images.length > 1 && (
        <div className="relative">
          <div ref={stripRef} className="flex gap-2 overflow-x-auto">
            {images.map((image, index) => (
              <button
                key={image}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`h-[88px] w-[70px] shrink-0 overflow-hidden rounded-lg border transition md:h-[112px] md:w-[90px] lg:h-[188px] lg:w-[150px] ${
                  index === activeIndex
                    ? "border-2 border-bronze"
                    : "border-border opacity-70 hover:border-bronze hover:opacity-100"
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
              className="pointer-events-none absolute inset-y-0 right-0 flex w-8 items-center justify-end bg-gradient-to-l from-ivory to-transparent"
            >
              <span className="font-sans text-bronze">›</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
