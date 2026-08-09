import { ORDER_STATUS_LABELS } from "@/lib/orderStatus";
import type { Order } from "@/types";

const STATUS_STYLES: Record<Order["status"], string> = {
  pending: "bg-charcoal/10 text-charcoal/60",
  paid: "bg-blush text-espresso",
  processing: "bg-blush text-espresso",
  shipped: "bg-bronze/20 text-espresso",
  delivered: "bg-espresso text-ivory",
  cancelled: "bg-charcoal/10 text-charcoal/50",
};

export function OrderStatusBadge({ status }: { status: Order["status"] }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 font-sans text-xs uppercase tracking-wide ${STATUS_STYLES[status]}`}
    >
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}

const PAYMENT_STATUS_STYLES: Record<Order["payment_status"], string> = {
  pending: "bg-charcoal/10 text-charcoal/60",
  paid: "bg-blush text-espresso",
  failed: "bg-bronze/20 text-espresso",
};

const PAYMENT_STATUS_LABELS: Record<Order["payment_status"], string> = {
  pending: "Payment Pending",
  paid: "Paid",
  failed: "Payment Failed",
};

export function PaymentStatusBadge({
  status,
}: {
  status: Order["payment_status"];
}) {
  return (
    <span
      className={`inline-block px-2 py-0.5 font-sans text-xs uppercase tracking-wide ${PAYMENT_STATUS_STYLES[status]}`}
    >
      {PAYMENT_STATUS_LABELS[status]}
    </span>
  );
}
