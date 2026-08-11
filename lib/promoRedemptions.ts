import { findPromotionByCode } from "@/lib/discount";
import type { createAdminClient } from "@/lib/supabase/admin";
import type { Promotion } from "@/types";

// `promotion: null` on the ok branch specifically means "no promotion
// matches this code" — deliberately not an error here, since /api/checkout
// has always tolerated a stale/unmatched code at final submission (it just
// contributes no discount) rather than hard-failing the whole order over
// it. Callers that DO want "no match" treated as a rejection (the live
// check-code endpoint) check for a null promotion themselves.
export type PromoCodeEligibility =
  | { ok: true; promotion: Promotion | null }
  | { ok: false; error: string };

// The single source of truth for "can this customer use this code right
// now" — shared by /api/checkout (the final, authoritative gate right
// before charging) and /api/checkout/check-code (live feedback the moment
// a customer clicks Apply). Sharing the exact same query means the two can
// never drift into showing different verdicts for the same situation.
export async function checkPromoCodeEligibility(
  supabaseAdmin: ReturnType<typeof createAdminClient>,
  promotions: Promotion[],
  code: string,
  userId: string | null,
): Promise<PromoCodeEligibility> {
  if (!userId) {
    return { ok: false, error: "Please log in to use a discount code." };
  }

  const matchedPromotion = findPromotionByCode(promotions, code);
  if (!matchedPromotion) {
    return { ok: true, promotion: null };
  }

  const { data: existingRedemption, error } = await supabaseAdmin
    .from("promo_redemptions")
    .select("id")
    .eq("promotion_id", matchedPromotion.id)
    .eq("customer_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (existingRedemption) {
    return { ok: false, error: "You've already used this discount code." };
  }

  return { ok: true, promotion: matchedPromotion };
}
