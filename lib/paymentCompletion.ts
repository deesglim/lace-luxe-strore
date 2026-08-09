import { sendAdminOrderNotificationEmail, sendOrderConfirmationEmail } from "@/lib/email";
import { getOrderWithItems } from "@/lib/orders";
import { createAdminClient } from "@/lib/supabase/admin";

export type CompleteOrderPaymentResult =
  | "completed"
  | "already_processed"
  | "not_found";

async function getCustomerEmail(
  supabaseAdmin: ReturnType<typeof createAdminClient>,
  customerId: string | null,
): Promise<string | null> {
  if (!customerId) return null;
  const { data } = await supabaseAdmin.auth.admin.getUserById(customerId);
  return data.user?.email ?? null;
}

/**
 * Idempotently flips a pending order to paid, decrements stock, and sends
 * the confirmation email. Called from the Paystack webhook (the primary
 * path) and from the order-status poll as a fallback for when the webhook
 * never arrives — a payment can succeed on Paystack's side while the
 * webhook delivery itself is lost (endpoint briefly unreachable, tunnel
 * down, etc.), which would otherwise strand the order as "pending" forever
 * with no stock decrement and no receipt ever sent.
 */
export async function completeOrderPayment(
  orderId: string,
): Promise<CompleteOrderPaymentResult> {
  const supabaseAdmin = createAdminClient();

  // Atomic claim: only the caller that actually flips pending->paid runs
  // the side effects below, so the webhook and the poll fallback racing
  // each other can't double-decrement stock or double-email.
  const { data: updatedRows, error: updateError } = await supabaseAdmin
    .from("orders")
    .update({ payment_status: "paid", status: "processing" })
    .eq("id", orderId)
    .eq("payment_status", "pending")
    .select("id");

  if (updateError) throw updateError;
  if (!updatedRows || updatedRows.length === 0) {
    return "already_processed";
  }

  const orderWithItems = await getOrderWithItems(orderId);
  if (!orderWithItems) return "not_found";

  for (const item of orderWithItems.items) {
    await supabaseAdmin.rpc("decrement_stock_for_order_item", {
      p_variant_id: item.variantId,
      p_color_id: item.colorId,
      p_quantity: item.quantity,
    });
  }

  // Resolved once and reused for both emails below. Kept outside the
  // try/catches so a failure in one send doesn't affect the other — the
  // admin should still hear about the order even if the customer's address
  // bounces, and vice versa.
  let customerEmail: string | null = null;
  const promotionCode = orderWithItems.promotion?.code ?? null;
  const bundleName = orderWithItems.bundle?.name ?? null;

  try {
    customerEmail =
      orderWithItems.guest_email ??
      (await getCustomerEmail(supabaseAdmin, orderWithItems.customer_id));
    if (customerEmail) {
      await sendOrderConfirmationEmail({
        order: orderWithItems,
        items: orderWithItems.items,
        deliveryOption: orderWithItems.deliveryOption,
        freeShippingApplied: orderWithItems.freeShippingApplied,
        bundleName,
        promotionCode,
        toEmail: customerEmail,
      });
    }
  } catch (emailError) {
    // Don't fail the caller over email delivery — the order is already
    // correctly marked paid and stock is already decremented.
    console.error("Failed to send order confirmation email", emailError);
  }

  try {
    await sendAdminOrderNotificationEmail({
      order: orderWithItems,
      items: orderWithItems.items,
      deliveryOption: orderWithItems.deliveryOption,
      freeShippingApplied: orderWithItems.freeShippingApplied,
      customerEmail,
      bundleName,
      promotionCode,
    });
  } catch (adminEmailError) {
    console.error("Failed to send admin order notification email", adminEmailError);
  }

  // The atomic pending->paid claim above already guarantees this whole
  // block — both emails included — runs at most once per order, regardless
  // of whether completion is triggered by the webhook or the status-poll
  // fallback, or if both race each other.
  return "completed";
}
