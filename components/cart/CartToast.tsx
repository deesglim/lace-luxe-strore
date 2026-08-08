"use client";

import { useCart } from "@/components/cart/CartProvider";

export default function CartToast() {
  const { toastMessage } = useCart();

  if (!toastMessage) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center px-6">
      <div className="pointer-events-auto border border-blush bg-espresso px-5 py-3 font-sans text-sm text-ivory shadow-lg">
        {toastMessage}
      </div>
    </div>
  );
}
