import Link from "next/link";
import { notFound } from "next/navigation";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/admin/OrderStatusBadge";
import { getCustomerForAdmin } from "@/lib/customers";
import { formatNaira } from "@/lib/format";
import { getOrdersForCustomerAdmin } from "@/lib/orders";

export const dynamic = "force-dynamic";

function orderNumber(id: string) {
  return id.slice(0, 8).toUpperCase();
}

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const customer = await getCustomerForAdmin(id).catch(() => null);
  if (!customer) {
    notFound();
  }

  const orders = await getOrdersForCustomerAdmin(id);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link
          href="/admin/customers"
          className="mb-2 inline-block font-sans text-xs uppercase tracking-[0.2em] text-bronze underline underline-offset-4"
        >
          ← Back to Customers
        </Link>
        <h1 className="font-heading text-2xl text-espresso">
          {customer.fullName || "Unnamed customer"}
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-4 border border-blush p-6 sm:grid-cols-3">
        <div>
          <p className="font-sans text-xs uppercase tracking-[0.15em] text-bronze">Email</p>
          <p className="mt-1 font-sans text-sm text-charcoal">{customer.email ?? "—"}</p>
        </div>
        <div>
          <p className="font-sans text-xs uppercase tracking-[0.15em] text-bronze">Phone</p>
          <p className="mt-1 font-sans text-sm text-charcoal">{customer.phone ?? "—"}</p>
        </div>
        <div>
          <p className="font-sans text-xs uppercase tracking-[0.15em] text-bronze">Date Joined</p>
          <p className="mt-1 font-sans text-sm text-charcoal">
            {new Date(customer.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div>
        <h2 className="mb-4 font-heading text-xl text-espresso">Order History</h2>

        {orders.length === 0 ? (
          <p className="font-sans text-sm text-charcoal/70">
            This customer hasn&apos;t placed any orders yet.
          </p>
        ) : (
          <div className="overflow-x-auto border border-blush">
            <table className="w-full border-collapse text-left font-sans text-sm">
              <thead>
                <tr className="border-b border-blush bg-blush/30 text-xs uppercase tracking-[0.1em] text-bronze">
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Payment</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Delivery</th>
                  <th className="px-4 py-3 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-blush/60 last:border-0">
                    <td className="px-4 py-3 text-charcoal">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-bronze underline underline-offset-4"
                      >
                        #{orderNumber(order.id)}
                      </Link>
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
    </div>
  );
}
