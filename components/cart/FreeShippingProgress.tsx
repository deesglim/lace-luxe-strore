"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { calculateGroupedSubtotal } from "@/lib/cartGrouping";
import { formatNaira } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";

export default function FreeShippingProgress({
  className = "",
}: {
  className?: string;
}) {
  const { items } = useCart();
  // Grouped (bundle-aware), not the raw per-item subtotal — this is what
  // the cart displays as "Subtotal" too, so the progress bar and unlock
  // message never disagree with what's shown right above/below it. The
  // server independently re-derives the authoritative free-shipping check
  // from live data at checkout regardless, same as before.
  const subtotal = calculateGroupedSubtotal(items);
  const [threshold, setThreshold] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    supabase
      .from("store_settings")
      .select("free_shipping_threshold")
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setThreshold(data?.free_shipping_threshold ?? null);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (items.length === 0 || !threshold || threshold <= 0) return null;

  const unlocked = subtotal >= threshold;
  const percent = Math.min(100, Math.round((subtotal / threshold) * 100));

  return (
    <div
      className={`flex flex-col gap-2 rounded-md border border-blush bg-blush/20 px-4 py-3 ${className}`}
    >
      {unlocked ? (
        <p className="font-sans text-sm text-espresso">
          🎉 You&apos;ve unlocked free shipping!
        </p>
      ) : (
        <>
          <p className="font-sans text-xs text-charcoal/70">
            You&apos;re{" "}
            <span className="text-espresso">
              {formatNaira(threshold - subtotal)}
            </span>{" "}
            away from free shipping!
          </p>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-charcoal/10">
            <div
              className="h-full rounded-full bg-espresso transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
        </>
      )}
    </div>
  );
}
