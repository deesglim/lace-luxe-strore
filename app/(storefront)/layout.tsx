import type { ReactNode } from "react";
import AnnouncementBar from "@/components/AnnouncementBar";
import CartDrawer from "@/components/cart/CartDrawer";
import { CartProvider } from "@/components/cart/CartProvider";
import CartToast from "@/components/cart/CartToast";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export default function StorefrontLayout({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <AnnouncementBar />
      <SiteHeader />
      {children}
      <SiteFooter />
      <CartDrawer />
      <CartToast />
    </CartProvider>
  );
}
