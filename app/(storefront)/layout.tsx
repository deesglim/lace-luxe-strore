import Script from "next/script";
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
      {/* MailerLite Universal — loaded only in the (storefront) route
          group, so it never runs on /admin pages (a sibling group, not
          nested under this layout). afterInteractive lets it load without
          delaying page render, while still firing early enough for
          popups/embedded forms published in the MailerLite dashboard to
          show up as expected. */}
      <Script id="mailerlite-universal" strategy="afterInteractive">
        {`(function(w,d,e,u,f,l,n){w[f]=w[f]||function(){(w[f].q=w[f].q||[])
        .push(arguments);},l=d.createElement(e),l.async=1,l.src=u,
        n=d.getElementsByTagName(e)[0],n.parentNode.insertBefore(l,n);})
        (window,document,'script','https://assets.mailerlite.com/js/universal.js','ml');
        ml('account', '2404003');`}
      </Script>
      <SiteHeader />
      {children}
      <SiteFooter />
      <CartDrawer />
      <CartToast />
    </CartProvider>
  );
}
