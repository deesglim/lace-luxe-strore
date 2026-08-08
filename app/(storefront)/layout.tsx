import type { ReactNode } from "react";
import CartDrawer from "@/components/cart/CartDrawer";
import { CartProvider } from "@/components/cart/CartProvider";
import CartToast from "@/components/cart/CartToast";
import SiteHeader from "@/components/SiteHeader";

export default function StorefrontLayout({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <SiteHeader />
      {children}
      <CartDrawer />
      <CartToast />
    </CartProvider>
  );
}
