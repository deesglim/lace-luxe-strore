import { NextResponse, type NextRequest } from "next/server";
import { completeOrderPayment } from "@/lib/paymentCompletion";
import { verifyPaystackTransaction } from "@/lib/paystack";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Minimal, unauthenticated status poll used by the checkout success page
// while waiting for the webhook to land. Deliberately returns only the
// status enums — no PII, amounts, or items — since order ids (random
// UUIDs) aren't treated as secret the way the full order record is.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabaseAdmin = createAdminClient();

  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .select("payment_status, status, total")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }
  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Fallback for a missed or delayed webhook: a payment can succeed on
  // Paystack's side while the webhook delivery itself never reaches us
  // (endpoint briefly unreachable, tunnel down, etc), which would otherwise
  // strand the order as "pending" forever with no receipt sent. While the
  // customer is still here polling, actively double-check with Paystack
  // rather than only ever trusting a webhook that may never arrive.
  if (order.payment_status === "pending") {
    try {
      const verified = await verifyPaystackTransaction(id);
      const expectedAmountKobo = Math.round(order.total * 100);

      if (verified.status === "success" && verified.amount === expectedAmountKobo) {
        await completeOrderPayment(id);

        const { data: refreshed } = await supabaseAdmin
          .from("orders")
          .select("payment_status, status")
          .eq("id", id)
          .maybeSingle();

        if (refreshed) {
          return NextResponse.json({
            paymentStatus: refreshed.payment_status,
            status: refreshed.status,
          });
        }
      }
    } catch {
      // Paystack lookup failed — fall through and report current (pending)
      // DB state; the client just keeps polling and will retry this check
      // on the next tick.
    }
  }

  return NextResponse.json({
    paymentStatus: order.payment_status,
    status: order.status,
  });
}
