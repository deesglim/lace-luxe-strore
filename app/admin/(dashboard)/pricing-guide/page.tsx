import PricingGuideAdmin, { type PricingGuideRow } from "@/components/admin/PricingGuideAdmin";
import { getEmailsByUserId } from "@/lib/customers";
import { formatNaira } from "@/lib/format";
import { getPricingGuidePrice } from "@/lib/pricingGuide";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminPricingGuidePage() {
  const supabaseAdmin = createAdminClient();
  const [{ data: purchases }, { data: sessions }, emails] = await Promise.all([
    supabaseAdmin
      .from("pricing_guide_purchases")
      .select("id, user_id, amount, status, source, created_at, paid_at")
      .in("status", ["paid", "revoked"])
      .order("created_at", { ascending: false }),
    supabaseAdmin.from("pricing_guide_sessions").select("user_id").eq("revoked", false),
    getEmailsByUserId(),
  ]);

  const userIds = [...new Set((purchases ?? []).map((p) => p.user_id))];
  const { data: profiles } = userIds.length
    ? await supabaseAdmin.from("profiles").select("id, full_name").in("id", userIds)
    : { data: [] as { id: string; full_name: string | null }[] };
  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));

  const deviceCount = new Map<string, number>();
  for (const s of sessions ?? []) deviceCount.set(s.user_id, (deviceCount.get(s.user_id) ?? 0) + 1);

  const rows: PricingGuideRow[] = (purchases ?? []).map((p) => ({
    id: p.id,
    email: emails.get(p.user_id) ?? null,
    name: nameById.get(p.user_id) ?? null,
    amount: Number(p.amount),
    status: p.status,
    source: p.source,
    date: new Date(p.paid_at ?? p.created_at).toLocaleDateString(),
    devices: deviceCount.get(p.user_id) ?? 0,
  }));

  const paidRows = rows.filter((r) => r.status === "paid" && r.source === "paystack");
  const revenue = paidRows.reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl text-espresso">Pricing Guide</h1>
        <p className="mt-1 font-sans text-sm text-charcoal/70">
          {paidRows.length} paid buyer{paidRows.length === 1 ? "" : "s"} · {formatNaira(revenue)} total ·
          current price {formatNaira(getPricingGuidePrice())}
        </p>
      </div>
      <PricingGuideAdmin rows={rows} />
    </div>
  );
}
