"use client";

import { useCart } from "@/components/cart/CartProvider";

export default function CartIcon() {
  const { itemCount, openDrawer } = useCart();

  return (
    <button
      type="button"
      onClick={openDrawer}
      className="relative flex h-10 w-10 items-center justify-center rounded-md border border-charcoal/15 text-espresso transition hover:border-bronze hover:text-bronze"
      aria-label={`Open cart, ${itemCount} item${itemCount === 1 ? "" : "s"}`}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden
      >
        <path d="M6 8h12l-1 12H7L6 8Z" strokeLinejoin="round" />
        <path d="M9 8V6a3 3 0 0 1 6 0v2" strokeLinecap="round" />
      </svg>
      {itemCount > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-bronze px-1 font-sans text-[10px] text-ivory">
          {itemCount}
        </span>
      )}
    </button>
  );
}
