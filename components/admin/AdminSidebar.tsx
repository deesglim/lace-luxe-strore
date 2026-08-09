"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import SignOutButton from "@/components/admin/SignOutButton";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/homepage", label: "Homepage" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/delivery", label: "Delivery" },
  { href: "/admin/promotions", label: "Promotions" },
  { href: "/admin/bundles", label: "Bundles" },
  { href: "/admin/newsletter", label: "Newsletter" },
  { href: "/admin/wholesale", label: "Wholesale Applications" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-full flex-col justify-between border-b border-blush bg-espresso px-6 py-6 sm:w-56 sm:border-b-0 sm:border-r sm:py-10">
      <div className="flex flex-col gap-1">
        <span className="mb-4 font-heading text-lg italic text-ivory">
          Lace Luxe Admin
        </span>
        {links.map((link) => {
          const isActive =
            link.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-2 font-sans text-sm ${
                isActive ? "bg-ivory/10 text-ivory" : "text-ivory/70 hover:text-ivory"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
      <div className="mt-8 sm:mt-0">
        <SignOutButton className="font-sans text-sm text-ivory/70 underline underline-offset-4 hover:text-ivory" />
      </div>
    </aside>
  );
}
