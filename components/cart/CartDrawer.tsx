"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import CartLineItem from "@/components/cart/CartLineItem";
import { useCart } from "@/components/cart/CartProvider";
import { useValidateCartStock } from "@/components/cart/useValidateCartStock";
import { formatNaira } from "@/lib/format";

export default function CartDrawer() {
  const { items, isDrawerOpen, closeDrawer, subtotal } = useCart();
  const notices = useValidateCartStock(isDrawerOpen);

  // Portal to document.body so this overlay's fixed positioning is always
  // relative to the viewport — nesting it in the normal tree risks a
  // transformed/filtered ancestor silently changing the containing block
  // for `position: fixed`, which is what made it render inline instead of
  // as an overlay. Gated on mount since document isn't available on the
  // server.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isDrawerOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeDrawer();
    }
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDrawerOpen, closeDrawer]);

  if (!mounted) return null;

  return createPortal(
    <>
      <div
        onClick={closeDrawer}
        aria-hidden
        className={`fixed inset-0 z-[100] bg-charcoal/50 transition-opacity duration-300 ${
          isDrawerOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        aria-hidden={!isDrawerOpen}
        style={{ maxWidth: 420 }}
        className={`fixed inset-y-0 right-0 z-[110] flex w-full max-w-[420px] flex-col bg-ivory shadow-2xl transition-transform duration-300 ease-in-out ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-blush px-6 py-5">
          <h2 className="font-heading text-xl text-espresso">Your Cart</h2>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Close cart"
            className="flex h-8 w-8 items-center justify-center rounded-md font-sans text-charcoal/60 transition hover:bg-blush/50 hover:text-espresso"
          >
            ✕
          </button>
        </div>

        {notices.length > 0 && (
          <div className="flex shrink-0 flex-col gap-1 border-b border-blush bg-blush/30 px-6 py-3">
            {notices.map((notice, index) => (
              <p key={index} className="font-sans text-xs text-charcoal/70">
                {notice}
              </p>
            ))}
          </div>
        )}

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="font-sans text-sm text-charcoal/70">
              Your cart is empty
            </p>
            <Link
              href="/shop"
              onClick={closeDrawer}
              className="rounded-md border border-espresso px-6 py-3 font-sans text-sm uppercase tracking-[0.2em] text-espresso transition hover:bg-espresso hover:text-ivory"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="flex flex-col gap-6">
                {items.map((item) => (
                  <CartLineItem key={item.id} item={item} compact />
                ))}
              </div>
            </div>

            <div className="shrink-0 border-t border-blush px-6 py-5">
              <div className="mb-4 flex items-center justify-between font-sans text-sm text-charcoal">
                <span>Subtotal</span>
                <span className="font-heading text-lg text-espresso">
                  {formatNaira(subtotal)}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <Link
                  href="/cart"
                  onClick={closeDrawer}
                  className="w-full rounded-md border border-espresso px-6 py-3 text-center font-sans text-sm uppercase tracking-[0.2em] text-espresso transition hover:bg-espresso hover:text-ivory"
                >
                  View Cart
                </Link>
                <Link
                  href="/checkout"
                  onClick={closeDrawer}
                  className="w-full rounded-md bg-espresso px-6 py-3 text-center font-sans text-sm uppercase tracking-[0.2em] text-ivory transition hover:bg-espresso/90"
                >
                  Checkout
                </Link>
              </div>
            </div>
          </>
        )}
      </aside>
    </>,
    document.body,
  );
}
