"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";
import { formatNaira } from "@/lib/format";
import type { CartItem } from "@/types";

export default function CartLineItem({
  item,
  compact,
}: {
  item: CartItem;
  compact?: boolean;
}) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <div className="flex gap-3">
      <Link
        href={`/shop/${item.productSlug}`}
        style={{
          display: "block",
          width: compact ? 80 : 96,
          height: compact ? 80 : 96,
          overflow: "hidden",
        }}
        className="shrink-0 grow-0 basis-auto rounded-md bg-blush"
      >
        {item.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image}
            alt={item.name}
            style={{ width: "100%", height: "100%" }}
            className="block object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-heading text-sm italic text-bronze">LL</span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link
              href={`/shop/${item.productSlug}`}
              className="font-sans text-sm text-espresso hover:underline"
            >
              {item.name}
            </Link>
            <p className="font-sans text-xs text-charcoal/60">
              {item.sizeLabel}
              {item.colorName ? ` · ${item.colorName}` : ""}
            </p>
          </div>
          <p className="font-sans text-sm text-charcoal">
            {formatNaira(item.price)}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              className="h-7 w-7 rounded-md border border-charcoal/20 font-sans text-xs text-charcoal transition hover:border-bronze hover:text-bronze"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="w-5 text-center font-sans text-xs text-charcoal">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="h-7 w-7 rounded-md border border-charcoal/20 font-sans text-xs text-charcoal transition hover:border-bronze hover:text-bronze"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <button
            type="button"
            onClick={() => removeItem(item.id)}
            className="font-sans text-xs text-bronze underline underline-offset-4"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
