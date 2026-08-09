import { NextResponse, type NextRequest } from "next/server";
import { completeOrderPayment } from "@/lib/paymentCompletion";
import { verifyPaystackSignature, verifyPaystackTransaction } from "@/lib/paystack";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type PaystackEvent = {
  event: string;
  data: {
    reference: string;
    status: string;
    amount: number;
  };
};

export async function POST(request: NextRequest) {
  // Signature verification needs the exact raw bytes Paystack signed —
  // request.json() would re-serialize and almost certainly produce a
  // different string, breaking the HMAC comparison.
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  if (!verifyPaystackSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: PaystackEvent;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const reference = event?.data?.reference;
  if (!reference) {
    return NextResponse.json({ received: true });
  }

  const supabaseAdmin = createAdminClient();

  if (event.event === "charge.success") {
    // Trust Paystack's own verify endpoint over the webhook payload's
    // fields — Paystack's documented best practice, on top of the
    // signature check above.
    let verified;
    try {
      verified = await verifyPaystackTransaction(reference);
    } catch {
      return NextResponse.json({ error: "Could not verify transaction" }, { status: 500 });
    }

    if (verified.status !== "success") {
      return NextResponse.json({ received: true });
    }

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("id, total, payment_status")
      .eq("id", reference)
      .maybeSingle();

    if (orderError) {
      return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
    }
    if (!order) {
      // Nothing matches this reference — acknowledge so Paystack doesn't
      // keep retrying an event we'll never be able to resolve.
      return NextResponse.json({ received: true });
    }

    const expectedAmountKobo = Math.round(order.total * 100);
    if (verified.amount !== expectedAmountKobo) {
      return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
    }

    // Idempotency: Paystack can deliver the same webhook more than once.
    // Only apply the paid side effects (stock decrement, email) the first
    // time we see this order flip to paid.
    if (order.payment_status === "paid") {
      return NextResponse.json({ received: true });
    }

    // completeOrderPayment atomically claims the order (so two webhook
    // deliveries for the same event, or a webhook racing the status-poll
    // fallback, can't double-decrement stock or double-email) and runs the
    // stock decrement + confirmation email.
    await completeOrderPayment(order.id);

    return NextResponse.json({ received: true });
  }

  if (event.event === "charge.failed") {
    await supabaseAdmin
      .from("orders")
      .update({ payment_status: "failed" })
      .eq("id", reference)
      .neq("payment_status", "paid");

    return NextResponse.json({ received: true });
  }

  return NextResponse.json({ received: true });
}
