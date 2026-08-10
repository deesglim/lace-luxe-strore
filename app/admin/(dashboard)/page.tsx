import Link from "next/link";
import SalesOverview from "@/components/admin/SalesOverview";
import { getCurrentProfile } from "@/lib/auth";
import { getPaidOrdersForSalesOverview, type PaidOrderPoint } from "@/lib/orders";

export const dynamic = "force-dynamic";

const sections = [
  {
    href: "/admin/products",
    label: "Products",
    description: "Add, edit, and manage the catalog.",
  },
  { href: "/admin/orders", label: "Orders", description: "Coming soon." },
  {
    href: "/admin/promotions",
    label: "Promotions",
    description: "Coming soon.",
  },
];

export default async function AdminHomePage() {
  const { profile } = await getCurrentProfile();

  let paidOrders: PaidOrderPoint[] = [];
  try {
    paidOrders = await getPaidOrdersForSalesOverview();
  } catch {
    paidOrders = [];
  }

  return (
    <div className="flex flex-col gap-10">
      <div>
        <span className="font-sans text-xs uppercase tracking-[0.3em] text-bronze">
          Lace Luxe Admin
        </span>
        <h1 className="mt-2 font-heading text-3xl text-espresso">
          Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}
        </h1>
      </div>

      <div>
        <h2 className="mb-4 font-heading text-xl text-espresso">Sales Overview</h2>
        <SalesOverview orders={paidOrders} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {sections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="border border-blush p-6 transition hover:border-bronze"
          >
            <h2 className="font-heading text-xl text-espresso">
              {section.label}
            </h2>
            <p className="mt-1 font-sans text-sm text-charcoal/60">
              {section.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
