// Pure helpers only — no server-only imports. Used by CartDrawer, the full
// /cart page, and FreeShippingProgress to display bundle items as one
// grouped card/price instead of separate lines at full regular price.
//
// This is a *display* concern only. The actual discount math at checkout
// (lib/discount.ts's pickBestDeal) is untouched and keeps working from raw
// per-item prices — grouping here just presents the same numbers the way a
// customer expects to see them, matching what checkout will charge in the
// common case where the bundle itself is the winning discount.

import type { CartItem } from "@/types";

export type CartDisplayGroup =
  | { kind: "item"; item: CartItem }
  | {
      kind: "bundle";
      bundleOfferId: string;
      bundleName: string;
      bundleImage: string | null;
      setCount: number;
      pricePerSet: number;
      totalPrice: number;
      items: CartItem[];
    };

// Groups cart items by bundleOfferId, preserving each group's first-seen
// position in the cart. Every item in a bundle group is always added in
// lockstep by CartProvider's addBundleItems, so quantity / bundleUnitQuantity
// is the same ratio across all of a group's items — reading it off the
// first item is enough to know how many full sets are in the cart.
export function groupCartItems(items: CartItem[]): CartDisplayGroup[] {
  const groups: CartDisplayGroup[] = [];
  const bundleGroupIndex = new Map<string, number>();

  for (const item of items) {
    if (!item.bundleOfferId) {
      groups.push({ kind: "item", item });
      continue;
    }

    const existingIndex = bundleGroupIndex.get(item.bundleOfferId);
    if (existingIndex !== undefined) {
      const group = groups[existingIndex];
      if (group.kind === "bundle") {
        group.items.push(item);
      }
      continue;
    }

    bundleGroupIndex.set(item.bundleOfferId, groups.length);
    groups.push({
      kind: "bundle",
      bundleOfferId: item.bundleOfferId,
      bundleName: item.bundleName ?? "Bundle",
      bundleImage: item.bundleImage ?? null,
      items: [item],
      setCount: 0,
      pricePerSet: item.bundlePriceSnapshot ?? 0,
      totalPrice: 0,
    });
  }

  for (const group of groups) {
    if (group.kind !== "bundle") continue;
    const first = group.items[0];
    const setCount =
      first.bundleUnitQuantity && first.bundleUnitQuantity > 0
        ? Math.round(first.quantity / first.bundleUnitQuantity)
        : 1;
    group.setCount = setCount;
    group.totalPrice = group.pricePerSet * setCount;
  }

  return groups;
}

// The subtotal a customer should see: regular items at price × quantity,
// bundle groups collapsed to pricePerSet × setCount instead of the summed
// regular price of their underlying items.
export function calculateGroupedSubtotal(items: CartItem[]): number {
  return groupCartItems(items).reduce((sum, group) => {
    if (group.kind === "item") return sum + group.item.price * group.item.quantity;
    return sum + group.totalPrice;
  }, 0);
}
