"use client";

import { useEffect } from "react";
import { useCart } from "@/components/cart/CartProvider";

// Only rendered on the success page once an order's payment_status is
// confirmed "paid" server-side, so clearing here genuinely means the order
// went through — not just that checkout was submitted.
export default function ClearCartOnMount() {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
