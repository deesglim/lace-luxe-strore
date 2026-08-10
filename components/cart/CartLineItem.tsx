"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { formatNaira } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import type { CartItem } from "@/types";

export default function CartLineItem({
  item,
  compact,
}: {
  item: CartItem;
  compact?: boolean;
}) {
  const { updateQuantity, removeItem } = useCart();
  const [stockNotice, setStockNotice] = useState<string | null>(null);
  const [checkingStock, setCheckingStock] = useState(false);

  // The cart is client-only (localStorage), so it never knows the real
  // current stock — re-check live on every "+" click rather than letting
  // updateQuantity's optional availableStock cap silently no-op (it
  // defaults to Infinity when nothing's passed, which is exactly what was
  // happening here before: clicking "+" past real stock just kept
  // incrementing with zero feedback until checkout's own re-derived check
  // caught it at the very end).
  async function handleIncrease() {
    setStockNotice(null);
    setCheckingStock(true);
    try {
      const supabase = createClient();
      const { data } = item.colorId
        ? await supabase
            .from("product_variant_colors")
            .select("stock_quantity")
            .eq("id", item.colorId)
            .maybeSingle()
        : await supabase
            .from("product_variants")
            .select("stock_quantity")
            .eq("id", item.variantId)
            .maybeSingle();
      const available = data?.stock_quantity ?? 0;

      if (item.quantity >= available) {
        setStockNotice(
          available <= 0
            ? "This item is currently out of stock."
            : `Only ${available} in stock — that's the most you can add.`,
        );
        return;
      }
      updateQuantity(item.id, item.quantity + 1, available);
    } catch {
      setStockNotice("Could not check stock. Please try again.");
    } finally {
      setCheckingStock(false);
    }
  }

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

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              href={`/shop/${item.productSlug}`}
              className="block truncate font-sans text-sm text-espresso hover:underline"
            >
              {item.name}
            </Link>
            <p className="font-sans text-xs text-charcoal/60">
              {item.sizeLabel}
              {item.colorName ? ` · ${item.colorName}` : ""}
            </p>
          </div>
          <p className="shrink-0 whitespace-nowrap font-sans text-sm text-charcoal">
            {formatNaira(item.price)}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setStockNotice(null);
                updateQuantity(item.id, item.quantity - 1);
              }}
              className="h-9 w-9 rounded-md border border-charcoal/20 font-sans text-xs text-charcoal transition hover:border-bronze hover:text-bronze"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="w-5 text-center font-sans text-xs text-charcoal">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={handleIncrease}
              disabled={checkingStock}
              className="h-9 w-9 rounded-md border border-charcoal/20 font-sans text-xs text-charcoal transition hover:border-bronze hover:text-bronze disabled:cursor-not-allowed disabled:opacity-50"
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
        {stockNotice && (
          <p className="font-sans text-xs text-bronze">{stockNotice}</p>
        )}
      </div>
    </div>
  );
}
