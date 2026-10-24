import { NextResponse, type NextRequest } from "next/server";
import { initializePaystackTransaction } from "@/lib/paystack";
import { getPricingGuidePrice, hasPricingGuideAccess } from "@/lib/pricingGuide";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return NextResponse.json({ error: "Please sign in to buy the guide." }, { status: 401 });
  }

  if (await hasPricingGuideAccess(user.id)) {
    return NextResponse.json({ alreadyOwned: true });
  }

  const amount = getPricingGuidePrice();
  const supabaseAdmin = createAdminClient();

  const { data: purchase, error } = await supabaseAdmin
    .from("pricing_guide_purchases")
    .insert({ user_id: user.id, amount, status: "pending", source: "paystack" })
    .select("id")
    .single();

  if (error || !purchase) {
    return NextResponse.json({ error: "Could not start your payment. Please try again." }, { status: 500 });
  }

  try {
    const origin = new URL(request.url).origin;
    const { authorizationUrl } = await initializePaystackTransaction({
      email: user.email,
      amountNaira: amount,
      reference: purchase.id,
      callbackUrl: `${origin}/pricing-guide/success?reference=${purchase.id}`,
      metadata: { type: "pricing_guide" },
    });
    return NextResponse.json({ authorizationUrl });
  } catch {
    await supabaseAdmin
      .from("pricing_guide_purchases")
      .update({ status: "failed" })
      .eq("id", purchase.id);
    return NextResponse.json({ error: "Could not reach the payment page. Please try again." }, { status: 502 });
  }
}
