import Link from "next/link";
import { redirect } from "next/navigation";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { getCurrentProfile } from "@/lib/auth";
import { formatNaira } from "@/lib/format";
import { getOrdersForCustomer, type CustomerOrderSummary } from "@/lib/orders";

export const dynamic = "force-dynamic";

function orderNumber(id: string) {
  return id.slice(0, 8).toUpperCase();
}

export default async function AccountOrdersPage() {
  const { user } = await getCurrentProfile();

  if (!user) {
    redirect("/login");
  }

  let orders: CustomerOrderSummary[] = [];
  try {
    orders = await getOrdersForCustomer(user.id);
  } catch {
    orders = [];
  }

  return (
    <main className="flex min-h-screen flex-1 flex-col bg-ivory px-6 py-20">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <div>
          <Link
            href="/account"
            className="mb-2 inline-block font-sans text-xs uppercase tracking-[0.2em] text-bronze underline underline-offset-4"
          >
            ← Back to Account
          </Link>
          <h1 className="font-heading text-3xl text-espresso">Order History</h1>
        </div>

        {orders.length === 0 ? (
          <p className="font-sans text-sm text-charcoal/70">
            No orders yet.{" "}
            <Link href="/shop" className="text-bronze underline underline-offset-4">
              Start shopping
            </Link>
            .
          </p>
        ) : (
          <div className="overflow-x-auto border border-blush">
            <table className="w-full border-collapse text-left font-sans text-sm">
              <thead>
                <tr className="border-b border-blush bg-blush/30 text-xs uppercase tracking-[0.1em] text-bronze">
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-blush/60 last:border-0">
                    <td className="px-4 py-3 text-charcoal">
                      <Link
                        href={`/account/orders/${order.id}`}
                        className="text-bronze underline underline-offset-4"
                      >
                        #{orderNumber(order.id)}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-charcoal/70">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <OrderStatusBadge status={order.status} />
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
    </main>
  );
}
