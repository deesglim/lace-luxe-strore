// Pure helpers only — no server-only imports. Used by the admin order
// detail page (Server Component), the status API route, and the
// OrderStatusUpdater client component alike.

import type { Order } from "@/types";

export const ORDER_STATUS_LABELS: Record<Order["status"], string> = {
  pending: "Pending",
  paid: "Paid",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

// The full status enum, as stored in the DB — used to validate any status
// value coming from a request (search param, API body) against what's
// actually a legal value.
export const ORDER_STATUS_FILTERS: Order["status"][] = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

// Tabs shown on the admin orders list. Deliberately excludes "paid": a
// paid order's `status` jumps straight to "processing" (see
// completeOrderPayment) — payment success is tracked in the separate
// `payment_status` column, not `status` — so a "Paid" status tab would
// always be empty even though payments are working fine. Payment status is
// surfaced per-row instead (see PaymentStatusBadge).
export const ORDER_STATUS_FILTER_TABS: Order["status"][] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

// Which status a given order can move to next. Deliberately one-directional
// (no going back to an earlier stage) and gated on payment where it matters
// — an unpaid order can only be cancelled, never manually pushed into
// fulfillment. "paid"/"pending" both allow moving to "processing" since
// completeOrderPayment() normally jumps straight to "processing" on
// payment success; this only matters as a manual recovery path if an order
// is ever paid but stuck at an earlier status for some reason.
export function getAllowedNextStatuses(order: {
  status: Order["status"];
  payment_status: Order["payment_status"];
}): Order["status"][] {
  switch (order.status) {
    case "pending":
      return order.payment_status === "paid" ? ["processing", "cancelled"] : ["cancelled"];
    case "paid":
      return ["processing", "cancelled"];
    case "processing":
      return ["shipped", "cancelled"];
    case "shipped":
      return ["delivered"];
    case "delivered":
    case "cancelled":
      return [];
  }
}

// Which status changes fire a customer-facing update email. The initial
// pending->paid/processing transition is already covered by the order
// confirmation email sent at checkout, so only later fulfillment stages
// notify again.
export type NotifiableOrderStatus = "processing" | "shipped" | "delivered" | "cancelled";

const NOTIFIABLE_STATUSES = new Set<Order["status"]>([
  "processing",
  "shipped",
  "delivered",
  "cancelled",
]);

export function isNotifiableStatus(
  status: Order["status"],
): status is NotifiableOrderStatus {
  return NOTIFIABLE_STATUSES.has(status);
}
