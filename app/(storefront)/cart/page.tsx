"use client";

import Link from "next/link";
import CartLineItem from "@/components/cart/CartLineItem";
import { useCart } from "@/components/cart/CartProvider";
import { useValidateCartStock } from "@/components/cart/useValidateCartStock";
import { formatNaira } from "@/lib/format";

export default function CartPage() {
  const { items, subtotal } = useCart();
  const notices = useValidateCartStock(true);

  return (
    <main className="flex min-h-screen flex-1 flex-col bg-ivory px-6 py-20">
      <div className="mx-auto w-full max-w-3xl">
        <h1 className="mb-10 font-heading text-3xl text-espresso">Your Cart</h1>

        {notices.length > 0 && (
          <div className="mb-6 flex flex-col gap-1 rounded-md border border-blush bg-blush/30 px-4 py-3">
            {notices.map((notice, index) => (
              <p key={index} className="font-sans text-xs text-charcoal/70">
                {notice}
              </p>
            ))}
          </div>
        )}

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-24 text-center">
            <p className="font-sans text-sm text-charcoal/70">
              Your cart is empty
            </p>
            <Link
              href="/shop"
              className="rounded-md border border-espresso px-6 py-3 font-sans text-sm uppercase tracking-[0.2em] text-espresso transition hover:bg-espresso hover:text-ivory"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            <div className="flex flex-col divide-y divide-blush">
              {items.map((item) => (
                <div key={item.id} className="py-6 first:pt-0">
                  <CartLineItem item={item} />
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-4 border-t border-blush pt-6">
              <div className="flex items-center justify-between font-sans text-base text-charcoal">
                <span>Subtotal</span>
                <span className="font-heading text-xl text-espresso">
                  {formatNaira(subtotal)}
                </span>
              </div>
              <Link
                href="/checkout"
                className="w-full rounded-md bg-espresso px-6 py-3 text-center font-sans text-sm uppercase tracking-[0.2em] text-ivory transition hover:bg-espresso/90"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
