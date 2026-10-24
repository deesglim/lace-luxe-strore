import { NextResponse, type NextRequest } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import { getEmailsByUserId } from "@/lib/customers";
import { sendPricingGuideAccess } from "@/lib/pricingGuide";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type Body = {
  action?: "grant" | "revoke" | "restore" | "reset_devices";
  email?: string;
  purchaseId?: string;
};

export async function POST(request: NextRequest) {
  // Route handlers aren't covered by the (dashboard) layout's admin gate.
  const { profile } = await getCurrentProfile();
  if (!profile?.is_admin) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const supabaseAdmin = createAdminClient();

  if (body.action === "grant") {
    const email = body.email?.trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ error: "Enter the customer's email." }, { status: 400 });
    }
    const emails = await getEmailsByUserId();
    const userId = [...emails.entries()].find(([, e]) => e.toLowerCase() === email)?.[0];
    if (!userId) {
      return NextResponse.json(
        { error: "No account uses that email. Ask the customer to create an account on deesglim.shop first." },
        { status: 404 },
      );
    }
    const { error } = await supabaseAdmin.from("pricing_guide_purchases").insert({
      user_id: userId,
      amount: 0,
      status: "paid",
      source: "granted",
      paid_at: new Date().toISOString(),
    });
    if (error) return NextResponse.json({ error: "Could not give access." }, { status: 500 });
    await sendPricingGuideAccess(userId);
    return NextResponse.json({ ok: true });
  }

  if (!body.purchaseId) {
    return NextResponse.json({ error: "Missing purchase." }, { status: 400 });
  }

  const { data: purchase } = await supabaseAdmin
    .from("pricing_guide_purchases")
    .select("id, user_id, status")
    .eq("id", body.purchaseId)
    .maybeSingle();
  if (!purchase) return NextResponse.json({ error: "Purchase not found." }, { status: 404 });

  if (body.action === "revoke" || body.action === "restore") {
    const allowedFrom = body.action === "revoke" ? "paid" : "revoked";
    if (purchase.status !== allowedFrom) {
      return NextResponse.json({ error: "That change isn't possible for this purchase." }, { status: 400 });
    }
    await supabaseAdmin
      .from("pricing_guide_purchases")
      .update({ status: body.action === "revoke" ? "revoked" : "paid" })
      .eq("id", purchase.id);
    return NextResponse.json({ ok: true });
  }

  if (body.action === "reset_devices") {
    await supabaseAdmin.from("pricing_guide_sessions").delete().eq("user_id", purchase.user_id);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
