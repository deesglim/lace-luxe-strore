import { createAdminClient } from "@/lib/supabase/admin";
import { CALCULATOR_HTML } from "@/lib/pricingGuide/calculatorHtml";

/** Price in naira. Set PRICING_GUIDE_PRICE_NAIRA in Vercel to change it. */
export function getPricingGuidePrice(): number {
  const fromEnv = Number(process.env.PRICING_GUIDE_PRICE_NAIRA);
  return Number.isFinite(fromEnv) && fromEnv > 0 ? fromEnv : 7500;
}

/** How many devices a buyer can have the calculator open on at once. */
export const PRICING_GUIDE_MAX_DEVICES = 2;

export const PRICING_GUIDE_USER_GUIDE_PDF = "/downloads/hair-service-pricing-guide-user-guide.pdf";

export type PricingGuidePurchase = {
  id: string;
  user_id: string;
  amount: number;
  status: "pending" | "paid" | "failed" | "revoked";
  source: "paystack" | "granted";
  created_at: string;
  paid_at: string | null;
};

export async function hasPricingGuideAccess(userId: string): Promise<boolean> {
  const supabaseAdmin = createAdminClient();
  const { data, error } = await supabaseAdmin
    .from("pricing_guide_purchases")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "paid")
    .limit(1);
  if (error) throw error;
  return (data?.length ?? 0) > 0;
}

/**
 * Records that this signed-in session opened the calculator and enforces the
 * device limit: a new session switches off the least recently used ones
 * beyond the limit. Returns "revoked" when this session was switched off.
 */
export async function registerPricingGuideSession(
  userId: string,
  sessionId: string,
): Promise<"ok" | "revoked"> {
  const supabaseAdmin = createAdminClient();

  const { data: existing, error: existingError } = await supabaseAdmin
    .from("pricing_guide_sessions")
    .select("revoked")
    .eq("user_id", userId)
    .eq("session_id", sessionId)
    .maybeSingle();
  if (existingError) throw existingError;

  if (existing?.revoked) return "revoked";

  const now = new Date().toISOString();

  if (existing) {
    await supabaseAdmin
      .from("pricing_guide_sessions")
      .update({ last_seen: now })
      .eq("user_id", userId)
      .eq("session_id", sessionId);
    return "ok";
  }

  const { error: insertError } = await supabaseAdmin
    .from("pricing_guide_sessions")
    .upsert({ user_id: userId, session_id: sessionId, last_seen: now, revoked: false });
  if (insertError) throw insertError;

  const { data: active, error: activeError } = await supabaseAdmin
    .from("pricing_guide_sessions")
    .select("session_id")
    .eq("user_id", userId)
    .eq("revoked", false)
    .order("last_seen", { ascending: false });
  if (activeError) throw activeError;

  const toRevoke = (active ?? [])
    .slice(PRICING_GUIDE_MAX_DEVICES)
    .map((row) => row.session_id)
    .filter((id) => id !== sessionId);

  if (toRevoke.length > 0) {
    await supabaseAdmin
      .from("pricing_guide_sessions")
      .update({ revoked: true })
      .eq("user_id", userId)
      .in("session_id", toRevoke);
  }

  return "ok";
}

/**
 * Atomically flips a pending purchase to paid. Returns true only for the
 * caller that made the change, so the webhook and the success page racing
 * each other can't both send the access email.
 */
export async function completePricingGuidePurchase(purchaseId: string): Promise<boolean> {
  const supabaseAdmin = createAdminClient();
  const { data, error } = await supabaseAdmin
    .from("pricing_guide_purchases")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("id", purchaseId)
    .eq("status", "pending")
    .select("id");
  if (error) throw error;
  return (data?.length ?? 0) > 0;
}

export async function getPricingGuidePurchase(
  purchaseId: string,
): Promise<PricingGuidePurchase | null> {
  const supabaseAdmin = createAdminClient();
  const { data, error } = await supabaseAdmin
    .from("pricing_guide_purchases")
    .select("id, user_id, amount, status, source, created_at, paid_at")
    .eq("id", purchaseId)
    .maybeSingle<PricingGuidePurchase>();
  if (error) throw error;
  return data;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string,
  );
}

/** The calculator page with the buyer's name and email shown at the top. */
export function buildCalculatorHtml(buyer: { name: string | null; email: string }): string {
  const who = escapeHtml(buyer.name ? `${buyer.name} · ${buyer.email}` : buyer.email);
  const banner = `<div style="max-width:1100px;margin:0 auto 18px;display:flex;flex-wrap:wrap;gap:8px 16px;justify-content:space-between;align-items:center;border:1.5px solid var(--line);border-radius:999px;padding:8px 16px;font-size:13px;font-weight:600;color:var(--muted)"><span>Licensed to <b style="color:var(--fg)">${who}</b> · personal use only</span><a href="/pricing-guide" style="color:var(--accent)">Deesglim · Hair Service Pricing Guide</a></div>`;
  return CALCULATOR_HTML.replace("{{LICENSE_BANNER}}", banner);
}

/** Emails the buyer their access details. Never throws. */
export async function sendPricingGuideAccess(userId: string): Promise<void> {
  try {
    const { sendPricingGuideAccessEmail } = await import("@/lib/email");
    const supabaseAdmin = createAdminClient();
    const [{ data: userData }, { data: profile }] = await Promise.all([
      supabaseAdmin.auth.admin.getUserById(userId),
      supabaseAdmin.from("profiles").select("full_name").eq("id", userId).maybeSingle(),
    ]);
    const email = userData?.user?.email;
    if (!email) return;
    await sendPricingGuideAccessEmail({ toEmail: email, name: profile?.full_name ?? null });
  } catch (error) {
    console.error("Failed to send pricing guide access email", error);
  }
}

/**
 * Confirms a Paystack payment for a pricing guide purchase (amount checked
 * against what was charged) and grants access. Used by the webhook and by
 * the success page as a fallback when the webhook is slow or lost.
 */
export async function confirmPricingGuidePayment(
  purchaseId: string,
  verified: { status: string; amount: number },
): Promise<"paid" | "already_paid" | "not_paid" | "amount_mismatch" | "not_found"> {
  const purchase = await getPricingGuidePurchase(purchaseId);
  if (!purchase) return "not_found";
  if (purchase.status === "paid") return "already_paid";
  if (verified.status !== "success") return "not_paid";
  if (verified.amount !== Math.round(Number(purchase.amount) * 100)) return "amount_mismatch";

  const claimed = await completePricingGuidePurchase(purchaseId);
  if (claimed) await sendPricingGuideAccess(purchase.user_id);
  return claimed ? "paid" : "already_paid";
}
