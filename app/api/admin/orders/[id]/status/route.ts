import { NextResponse, type NextRequest } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import { sendOrderStatusUpdateEmail } from "@/lib/email";
import { getAllowedNextStatuses, isNotifiableStatus, ORDER_STATUS_FILTERS } from "@/lib/orderStatus";
import { getOrderWithItems } from "@/lib/orders";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Order } from "@/types";

export const runtime = "nodejs";

type StatusRequestBody = {
  status?: string;
  trackingNote?: string;
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // This route sits outside the (dashboard) layout's admin gate (route
  // handlers aren't covered by a page layout), so it re-checks admin status
  // itself rather than trusting the caller.
  const { profile } = await getCurrentProfile();
  if (!profile?.is_admin) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const { id } = await params;

  let body: StatusRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!body.status || !ORDER_STATUS_FILTERS.includes(body.status as Order["status"])) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }
  const targetStatus = body.status as Order["status"];

  const supabaseAdmin = createAdminClient();

  const { data: current, error: currentError } = await supabaseAdmin
    .from("orders")
    .select("status, payment_status")
    .eq("id", id)
    .maybeSingle();

  if (currentError) throw currentError;
  if (!current) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const allowed = getAllowedNextStatuses(current);
  if (!allowed.includes(targetStatus)) {
    return NextResponse.json(
      {
        error: `Can't move an order from "${current.status}" to "${targetStatus}".`,
      },
      { status: 400 },
    );
  }

  const trackingNote =
    targetStatus === "shipped" ? (body.trackingNote?.trim() || null) : undefined;

  const updatePayload: Record<string, unknown> = { status: targetStatus };
  if (trackingNote !== undefined) updatePayload.tracking_note = trackingNote;

  // Conditional on the status we read above, same "optimistic claim" pattern
  // used for payment completion — if two save clicks race, only one actually
  // applies the change and sends the email.
  const { data: updatedRows, error: updateError } = await supabaseAdmin
    .from("orders")
    .update(updatePayload)
    .eq("id", id)
    .eq("status", current.status)
    .select("id");

  if (updateError) throw updateError;
  if (!updatedRows || updatedRows.length === 0) {
    return NextResponse.json(
      {
        error:
          "This order's status changed since the page loaded — please refresh and try again.",
      },
      { status: 409 },
    );
  }

  if (isNotifiableStatus(targetStatus)) {
    try {
      const orderWithItems = await getOrderWithItems(id);
      const emailTarget = orderWithItems?.guest_email;
      if (orderWithItems && emailTarget) {
        await sendOrderStatusUpdateEmail({
          order: orderWithItems,
          items: orderWithItems.items,
          status: targetStatus,
          trackingNote: orderWithItems.tracking_note,
          toEmail: emailTarget,
        });
      }
    } catch (emailError) {
      // The status change is already saved — don't fail the request over
      // email delivery.
      console.error("Failed to send order status update email", emailError);
    }
  }

  return NextResponse.json({ status: targetStatus });
}
