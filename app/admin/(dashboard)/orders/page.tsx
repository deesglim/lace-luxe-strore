import Link from "next/link";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/admin/OrderStatusBadge";
import { formatNaira } from "@/lib/format";
import {
  ORDER_STATUS_FILTER_TABS,
  ORDER_STATUS_FILTERS,
  ORDER_STATUS_LABELS,
} from "@/lib/orderStatus";
import { getAllOrdersForAdmin } from "@/lib/orders";
import type { Order } from "@/types";

export const dynamic = "force-dynamic";

function orderNumber(id: string) {
  return id.slice(0, 8).toUpperCase();
}

function tabClass(active: boolean) {
  return `px-3 py-1.5 font-sans text-xs uppercase tracking-[0.15em] ${
    active
      ? "bg-espresso text-ivory"
      : "border border-charcoal/20 text-charcoal/70 hover:border-bronze"
  }`;
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const activeStatus = ORDER_STATUS_FILTERS.includes(status as Order["status"])
    ? (status as Order["status"])
    : null;

  const orders = await getAllOrdersForAdmin();
  const filtered = activeStatus
    ? orders.filter((order) => order.status === activeStatus)
    : orders;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl text-espresso">Orders</h1>

      <div className="flex flex-wrap gap-2">
        <Link href="/admin/orders" className={tabClass(!activeStatus)}>
          All
        </Link>
        {ORDER_STATUS_FILTER_TABS.map((s) => (
          <Link
            key={s}
            href={`/admin/orders?status=${s}`}
            className={tabClass(activeStatus === s)}
          >
            {ORDER_STATUS_LABELS[s]}
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="font-sans text-sm text-charcoal/70">
          No orders{activeStatus ? ` with status "${ORDER_STATUS_LABELS[activeStatus]}"` : ""} yet.
        </p>
      ) : (
        <div className="overflow-x-auto border border-blush">
          <table className="w-full border-collapse text-left font-sans text-sm">
            <thead>
              <tr className="border-b border-blush bg-blush/30 text-xs uppercase tracking-[0.1em] text-bronze">
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Delivery</th>
                <th className="px-4 py-3 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.id} className="border-b border-blush/60 last:border-0">
                  <td className="px-4 py-3 text-charcoal">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-bronze underline underline-offset-4"
                    >
                      #{orderNumber(order.id)}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-charcoal">
                    {order.customerName ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-charcoal/70">
                    {order.customerEmail ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-charcoal/70">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <PaymentStatusBadge status={order.payment_status} />
                  </td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-charcoal/70">
                    {order.deliveryOptionName ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-charcoal">
                    {formatNaira(order.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
