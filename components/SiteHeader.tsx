import AccountDropdown from "@/components/AccountDropdown";
import AccountIcon from "@/components/AccountIcon";
import CartIcon from "@/components/cart/CartIcon";
import HeaderChrome from "@/components/HeaderChrome";
import MobileNav from "@/components/MobileNav";
import { getActiveAnnouncements, type Announcement } from "@/lib/announcements";
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

  let announcements: Announcement[] = [];
  try {
    announcements = await getActiveAnnouncements();
  } catch {
    announcements = [];
  }

  return (
    <HeaderChrome
      navLinks={navLinks}
      announcements={announcements}
      accountSlot={
        <>
          {user ? <AccountDropdown /> : <AccountIcon isLoggedIn={false} />}
          <CartIcon />
          <MobileNav links={navLinks} />
        </>
      }
    />
  );
}
