import Link from "next/link";
import AccountDropdown from "@/components/AccountDropdown";
import AccountIcon from "@/components/AccountIcon";
import CartIcon from "@/components/cart/CartIcon";
import MobileNav from "@/components/MobileNav";
import { getCurrentProfile } from "@/lib/auth";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/our-story", label: "Our Story" },
  { href: "/size-guide", label: "Size Guide" },
  { href: "/contact", label: "Contact Us" },
];

export default async function SiteHeader() {
  const { user } = await getCurrentProfile();

  return (
    <header className="border-b border-blush bg-ivory">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-12">
        <Link href="/" className="font-heading text-xl italic text-espresso">
          Lace Luxe <span className="text-bronze">by Dee</span>
        </Link>

        <nav className="hidden items-center gap-3 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md border border-charcoal/15 px-4 py-2 font-sans text-sm uppercase tracking-[0.1em] text-charcoal transition hover:border-bronze hover:bg-bronze/5 hover:text-bronze"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          {user ? <AccountDropdown /> : <AccountIcon isLoggedIn={false} />}
          <CartIcon />
          <MobileNav links={navLinks} />
        </div>
      </div>
    </header>
  );
}
