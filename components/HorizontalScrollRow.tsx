"use client";

import { useRef, type ReactNode } from "react";

// Konga/Jumia-style scroll row: a single non-wrapping line of fixed-size
// cards, scroll-snapped, with desktop arrow buttons and native touch swipe
// on mobile. Used by Shop by Category, Best Sellers, and Testimonials —
// each just supplies its own fixed-size cards as children.
export default function HorizontalScrollRow({ children }: { children: ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(direction: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  }

  return (
    <div className="relative mx-auto w-full max-w-content">
      <button
        type="button"
        onClick={() => scroll("left")}
        aria-label="Scroll left"
        className="absolute left-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-blush bg-ivory text-espresso shadow-md transition hover:bg-blush sm:flex"
      >
        ‹
      </button>

      <div
        ref={scrollRef}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-6 pb-2 lg:px-[60px] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>

      <button
        type="button"
        onClick={() => scroll("right")}
        aria-label="Scroll right"
        className="absolute right-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-blush bg-ivory text-espresso shadow-md transition hover:bg-blush sm:flex"
      >
        ›
      </button>
    </div>
  );
}
