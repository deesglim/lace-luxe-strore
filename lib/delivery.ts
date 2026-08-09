// Pure helpers only — no server-only imports (next/headers etc). This file
// is imported by both Server Components and Client Components (checkout
// form, admin delivery manager), and importing anything server-only here
// would break every client component that imports it too.

import { formatNaira } from "@/lib/format";
import type { DeliveryOption } from "@/types";

export const DELIVERY_CATEGORY_ORDER: DeliveryOption["category"][] = [
  "pickup",
  "local_delivery",
  "interstate_transport",
];

export const DELIVERY_CATEGORY_LABELS: Record<DeliveryOption["category"], string> = {
  pickup: "Pickup",
  local_delivery: "Local Delivery (Port Harcourt)",
  interstate_transport: "Interstate Transport",
};

export function groupDeliveryOptionsByCategory(options: DeliveryOption[]) {
  return DELIVERY_CATEGORY_ORDER.map((category) => ({
    category,
    label: DELIVERY_CATEGORY_LABELS[category],
    options: options
      .filter((option) => option.category === category)
      .sort((a, b) => a.display_order - b.display_order),
  })).filter((group) => group.options.length > 0);
}

// price === 0 is ambiguous: pickup is genuinely free, but a placeholder
// like AKTC also defaults to 0 until an admin sets a real price. Category is
// a plain string (not the narrower DeliveryOption union) so this also
// accepts the joined category off an order's delivery_options relation.
export function formatDeliveryPrice(option: {
  price: number;
  category: string;
}): string {
  if (option.price === 0) {
    return option.category === "pickup" ? "Free" : "Price TBD";
  }
  return formatNaira(option.price);
}

// For a *placed order's* delivery line (email, success page) rather than a
// delivery option's own list price — a 0 fee there can also mean the order
// qualified for free shipping, which formatDeliveryPrice's price===0
// heuristic can't distinguish from a pickup or a TBD-priced option on its
// own.
export function formatOrderDeliveryFee(
  fee: number,
  category: string,
  freeShippingApplied: boolean,
): string {
  if (freeShippingApplied) return "FREE";
  return formatDeliveryPrice({ price: fee, category });
}
