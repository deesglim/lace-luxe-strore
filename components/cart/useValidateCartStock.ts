"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { createClient } from "@/lib/supabase/client";

// Cart contents are client-only (localStorage), so they can drift from real
// stock — e.g. an admin lowers stock after something was added to a cart.
// Re-checks live stock whenever `trigger` flips to true (drawer opening,
// or the full cart page mounting) and clamps/removes items that no longer
// fit, returning human-readable notices for the UI to show.
export function useValidateCartStock(trigger: boolean) {
  const { items, updateQuantity, removeItem } = useCart();
  const [notices, setNotices] = useState<string[]>([]);

  useEffect(() => {
    if (!trigger) return;

    let cancelled = false;

    async function validate() {
      if (items.length === 0) {
        if (!cancelled) setNotices([]);
        return;
      }

      const supabase = createClient();
      const variantIds = Array.from(new Set(items.map((item) => item.variantId)));
      const colorIds = Array.from(
        new Set(
          items
            .filter((item): item is typeof item & { colorId: string } =>
              Boolean(item.colorId),
            )
            .map((item) => item.colorId),
        ),
      );

      const [variantResult, colorResult] = await Promise.all([
        supabase.from("product_variants").select("id, stock_quantity").in("id", variantIds),
        colorIds.length > 0
          ? supabase
              .from("product_variant_colors")
              .select("id, stock_quantity")
              .in("id", colorIds)
          : Promise.resolve({ data: [] as { id: string; stock_quantity: number }[] }),
      ]);

      if (cancelled) return;

      const variantStock = new Map(
        (variantResult.data ?? []).map((row) => [row.id, row.stock_quantity]),
      );
      const colorStock = new Map(
        (colorResult.data ?? []).map((row) => [row.id, row.stock_quantity]),
      );

      const nextNotices: string[] = [];

      for (const item of items) {
        const available = item.colorId
          ? (colorStock.get(item.colorId) ?? 0)
          : (variantStock.get(item.variantId) ?? 0);
        const label = `${item.name} (${item.sizeLabel}${item.colorName ? `, ${item.colorName}` : ""})`;

        if (available <= 0) {
          nextNotices.push(`${label} is no longer in stock and was removed from your cart.`);
          removeItem(item.id);
        } else if (item.quantity > available) {
          nextNotices.push(`${label} was reduced to ${available} in stock.`);
          updateQuantity(item.id, available);
        }
      }

      if (!cancelled) setNotices(nextNotices);
    }

    validate();
    return () => {
      cancelled = true;
    };
    // Intentionally only re-runs when `trigger` flips — items/updateQuantity/
    // removeItem are read fresh via closure each call, and including them
    // here would re-fire this effect off of the very mutations it makes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  return notices;
}
