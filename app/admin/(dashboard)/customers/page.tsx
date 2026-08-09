import Link from "next/link";
import { getAllCustomersForAdmin } from "@/lib/customers";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const customers = await getAllCustomersForAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl text-espresso">Customers</h1>
        <p className="mt-1 font-sans text-sm text-charcoal/70">
          {customers.length} registered customer{customers.length === 1 ? "" : "s"} · sorted by
          most paid orders first
        </p>
      </div>

      {customers.length === 0 ? (
        <p className="font-sans text-sm text-charcoal/70">No customers have signed up yet.</p>
      ) : (
        <div className="overflow-x-auto border border-blush">
          <table className="w-full border-collapse text-left font-sans text-sm">
            <thead>
              <tr className="border-b border-blush bg-blush/30 text-xs uppercase tracking-[0.1em] text-bronze">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Date Joined</th>
                <th className="px-4 py-3 font-medium text-right">Paid Orders</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-b border-blush/60 last:border-0">
                  <td className="px-4 py-3 text-charcoal">
                    <Link
                      href={`/admin/customers/${customer.id}`}
                      className="text-bronze underline underline-offset-4"
                    >
                      {customer.fullName || "—"}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-charcoal/70">{customer.email ?? "—"}</td>
                  <td className="px-4 py-3 text-charcoal/70">{customer.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-charcoal/70">
                    {new Date(customer.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right text-charcoal">
                    {customer.paidOrderCount}
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
