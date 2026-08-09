// Pure helpers only — no server-only imports. Same reasoning as
// lib/discount.ts: imported by both Server Components/Route Handlers and
// the CheckoutForm client component for a live preview.

import type { DiscountCartItem } from "@/lib/discount";
import type { BundleOffer, BundleOfferItem } from "@/types";

export type BundleOfferWithItems = BundleOffer & {
  items: Pick<BundleOfferItem, "product_id" | "variant_id" | "color_id" | "quantity_required">[];
};

export function isBundleCurrentlyValid(
  bundle: BundleOffer,
  now: Date = new Date(),
): boolean {
  if (!bundle.active) return false;
  if (bundle.starts_at && new Date(bundle.starts_at) > now) return false;
  if (bundle.ends_at && new Date(bundle.ends_at) < now) return false;
  return true;
}

type CartUnit = {
  productId: string;
  variantId: string;
  colorId: string | null;
  laceType: string | null;
  price: number;
};

// Expands quantities into individual unit prices so "take the N
// highest-priced qualifying units" can be expressed as a plain sort+slice,
// for both bundle types.
function expandToUnits(items: DiscountCartItem[]): CartUnit[] {
  const units: CartUnit[] = [];
  for (const item of items) {
    for (let i = 0; i < item.quantity; i++) {
      units.push({
        productId: item.productId,
        variantId: item.variantId,
        colorId: item.colorId,
        laceType: item.laceType,
        price: item.price,
      });
    }
  }
  return units;
}

function highestPriceFirst(units: CartUnit[]): CartUnit[] {
  return [...units].sort((a, b) => b.price - a.price);
}

// "Specific Products": every listed item must be present at its exact
// fixed size (variant) and color — not just any variant of the product —
// at (at least) its required quantity. Matching by variant_id+color_id
// rather than product_id is what makes this a *fixed* combo (a specific
// size/color the admin picked) instead of "any 2 units of this product."
// An item with variant_id null (pre-dates this schema, never re-configured
// by its admin) simply never matches anything, since cart units always
// have a real variantId — no special-casing needed for that case.
function calculateSpecificProductsDiscount(
  bundle: BundleOfferWithItems,
  items: DiscountCartItem[],
): number {
  if (bundle.items.length === 0) return 0;

  const units = expandToUnits(items);
  let regularCost = 0;

  for (const required of bundle.items) {
    const matching = highestPriceFirst(
      units.filter(
        (unit) =>
          unit.variantId === required.variant_id && unit.colorId === required.color_id,
      ),
    );
    if (matching.length < required.quantity_required) {
      return 0; // doesn't qualify — missing at least one required item
    }
    const chosen = matching.slice(0, required.quantity_required);
    regularCost += chosen.reduce((sum, unit) => sum + unit.price, 0);
  }

  return Math.max(0, regularCost - bundle.bundle_price);
}

// "Flexible Quantity": any required_quantity units matching scope qualify —
// applied to the highest-priced qualifying units in the cart.
function calculateFlexibleQuantityDiscount(
  bundle: BundleOfferWithItems,
  items: DiscountCartItem[],
): number {
  if (!bundle.required_quantity || bundle.required_quantity <= 0) return 0;

  const qualifying = expandToUnits(items).filter((unit) => {
    if (bundle.scope === "category") return unit.laceType === bundle.scope_reference;
    return true; // sitewide (or unset, defensively treated the same)
  });

  if (qualifying.length < bundle.required_quantity) return 0;

  const chosen = highestPriceFirst(qualifying).slice(0, bundle.required_quantity);
  const regularCost = chosen.reduce((sum, unit) => sum + unit.price, 0);

  return Math.max(0, regularCost - bundle.bundle_price);
}

export function calculateBundleDiscount(
  bundle: BundleOfferWithItems,
  items: DiscountCartItem[],
): number {
  return bundle.bundle_type === "specific_products"
    ? calculateSpecificProductsDiscount(bundle, items)
    : calculateFlexibleQuantityDiscount(bundle, items);
}

export type BundleResult = {
  bundle: BundleOfferWithItems | null;
  amount: number;
};

// A cart can qualify for multiple bundles at once — only the single
// best-value one ever applies, same "no stacking" rule as promotions.
export function pickBestBundle(
  bundles: BundleOfferWithItems[],
  items: DiscountCartItem[],
): BundleResult {
  const now = new Date();
  let best: BundleResult = { bundle: null, amount: 0 };

  for (const bundle of bundles) {
    if (!isBundleCurrentlyValid(bundle, now)) continue;
    const amount = calculateBundleDiscount(bundle, items);
    if (amount > best.amount) {
      best = { bundle, amount };
    }
  }

  return best;
}
