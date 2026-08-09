// Pure helpers only — no server-only imports (next/headers etc). Imported by
// both Server Components/Route Handlers (checkout API, checkout page SSR)
// and Client Components (CheckoutForm's live preview), same reasoning as
// lib/delivery.ts.

import { pickBestBundle, type BundleOfferWithItems } from "@/lib/bundles";
import type { Promotion } from "@/types";

export type DiscountCartItem = {
  productId: string;
  variantId: string;
  colorId: string | null;
  laceType: string | null;
  price: number;
  quantity: number;
};

export function isPromotionCurrentlyValid(
  promotion: Promotion,
  now: Date = new Date(),
): boolean {
  if (!promotion.active) return false;
  if (promotion.starts_at && new Date(promotion.starts_at) > now) return false;
  if (promotion.ends_at && new Date(promotion.ends_at) < now) return false;
  return true;
}

// The slice of the cart subtotal a promotion's scope actually reaches —
// sitewide is everything, category/product are filtered subsets.
function scopedSubtotal(promotion: Promotion, items: DiscountCartItem[]): number {
  const relevant = items.filter((item) => {
    switch (promotion.scope) {
      case "sitewide":
        return true;
      case "category":
        return item.laceType === promotion.scope_reference;
      case "product":
        return item.productId === promotion.scope_reference;
    }
  });
  return relevant.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// Discount never exceeds the subtotal it applies to — a fixed-amount
// promotion on a category can't discount more than that category's items
// are worth, and a percentage is inherently capped by definition.
export function calculateDiscountForPromotion(
  promotion: Promotion,
  items: DiscountCartItem[],
): number {
  const base = scopedSubtotal(promotion, items);
  if (base <= 0) return 0;

  const raw =
    promotion.type === "percentage" ? (base * promotion.value) / 100 : promotion.value;

  return Math.max(0, Math.min(raw, base));
}

export type DiscountResult = {
  promotion: Promotion | null;
  amount: number;
};

// Picks the single best discount for a cart: the highest-value qualifying
// automatic (no-code) promotion, or the customer's entered code if it beats
// that. Codes and automatic sales never stack — only ever one promotion
// applies per order.
export function pickBestDiscount(
  promotions: Promotion[],
  items: DiscountCartItem[],
  code?: string | null,
): DiscountResult {
  const now = new Date();
  const valid = promotions.filter((promotion) => isPromotionCurrentlyValid(promotion, now));

  let best: DiscountResult = { promotion: null, amount: 0 };

  for (const promotion of valid) {
    if (promotion.code) continue; // automatic candidates only in this pass
    const amount = calculateDiscountForPromotion(promotion, items);
    if (amount > best.amount) {
      best = { promotion, amount };
    }
  }

  const trimmedCode = code?.trim();
  if (trimmedCode) {
    const matched = findPromotionByCode(valid, trimmedCode);
    if (matched) {
      const amount = calculateDiscountForPromotion(matched, items);
      if (amount > best.amount) {
        best = { promotion: matched, amount };
      }
    }
  }

  return best;
}

// Shared display label for an applied discount — used on the checkout
// summary, success page, admin order detail, and both order emails, so
// "how a discount is described" only needs deciding once. A bundle name
// (when present) always wins the label, since an order only ever has one
// or the other applied.
export function describeAppliedDiscount(
  bundleName: string | null,
  promotionCode: string | null,
): string {
  if (bundleName) return `Bundle: ${bundleName}`;
  return promotionCode ? `Discount (${promotionCode})` : "Automatic discount";
}

export type DealResult =
  | { type: "promotion"; promotion: Promotion; bundle: null; amount: number }
  | { type: "bundle"; promotion: null; bundle: BundleOfferWithItems; amount: number }
  | { type: null; promotion: null; bundle: null; amount: 0 };

// The top-level "what's the best deal for this cart" comparison: best
// automatic promotion, the entered/valid code, and the best qualifying
// bundle — whichever single one discounts the most wins. Never stacked.
export function pickBestDeal(
  promotions: Promotion[],
  bundles: BundleOfferWithItems[],
  items: DiscountCartItem[],
  code?: string | null,
): DealResult {
  const promoResult = pickBestDiscount(promotions, items, code);
  const bundleResult = pickBestBundle(bundles, items);

  if (bundleResult.bundle && bundleResult.amount >= promoResult.amount) {
    return { type: "bundle", promotion: null, bundle: bundleResult.bundle, amount: bundleResult.amount };
  }
  if (promoResult.amount > 0 && promoResult.promotion) {
    return { type: "promotion", promotion: promoResult.promotion, bundle: null, amount: promoResult.amount };
  }
  return { type: null, promotion: null, bundle: null, amount: 0 };
}

// Case-insensitive: "dees10" and "DEES10" are the same code to a customer.
export function findPromotionByCode(
  promotions: Promotion[],
  code: string,
): Promotion | null {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return null;
  return (
    promotions.find(
      (promotion) => promotion.code && promotion.code.toUpperCase() === normalized,
    ) ?? null
  );
}
