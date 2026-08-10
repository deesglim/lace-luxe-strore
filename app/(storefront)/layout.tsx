import type { ReactNode } from "react";
import CartDrawer from "@/components/cart/CartDrawer";
import { CartProvider } from "@/components/cart/CartProvider";
import CartToast from "@/components/cart/CartToast";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

// The announcement bar is now rendered inside SiteHeader/HeaderChrome
// itself (as the top band of the same fixed/sticky stack) rather than as
// an independent element here — that's what lets it rotate through
// multiple messages while staying correctly positioned relative to the
// nav row on every page.
export default function StorefrontLayout({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <SiteHeader />
      {children}
      <SiteFooter />
      <CartDrawer />
      <CartToast />
    </CartProvider>
  );
}
