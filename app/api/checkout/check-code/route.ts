import { NextResponse, type NextRequest } from "next/server";
import { checkPromoCodeEligibility } from "@/lib/promoRedemptions";
import { getAllPromotionsAdmin } from "@/lib/promotions";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

// Live "is this code usable right now" check, fired the moment a customer
// clicks Apply on the checkout page — not just discovered later at final
// submission. Reuses the exact same eligibility query /api/checkout runs
// right before charging, so the two can never disagree about whether a
// code is already used.
export async function POST(request: NextRequest) {
  let body: { code?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const trimmedCode = body.code?.trim();
  if (!trimmedCode) {
    return NextResponse.json({ error: "Enter a code." }, { status: 400 });
  }

  const supabaseAdmin = createAdminClient();
  const cookieClient = await createClient();

  const [
    {
      data: { user: existingUser },
    },
    promotions,
  ] = await Promise.all([cookieClient.auth.getUser(), getAllPromotionsAdmin()]);

  const eligibility = await checkPromoCodeEligibility(
    supabaseAdmin,
    promotions,
    trimmedCode,
    existingUser?.id ?? null,
  );

  if (!eligibility.ok) {
    return NextResponse.json({ error: eligibility.error }, { status: 400 });
  }
  if (!eligibility.promotion) {
    return NextResponse.json(
      { error: "That code isn't valid or has expired." },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true });
}
