"use client";

import { useCart } from "@/components/cart/CartProvider";
import type { BundleOfferForShop } from "@/lib/bundleOffers";

export default function BundleAddToCartButton({
  offer,
  allInStock,
}: {
  offer: BundleOfferForShop;
  allInStock: boolean;
}) {
  const { addBundleItems } = useCart();

  function handleClick() {
    if (!allInStock) return;

    addBundleItems({
      bundleOfferId: offer.id,
      bundleName: offer.name,
      bundleImage: offer.image_url,
      bundlePrice: offer.bundle_price,
      items: offer.items.map((item) => ({
        productId: item.productId,
        productSlug: item.productSlug,
        variantId: item.variantId,
        colorId: item.colorId,
        sizeLabel: item.sizeLabel,
        colorName: item.colorName,
        name: item.productName,
        image: item.productImage,
        price: item.price,
        quantity: item.quantityRequired,
        laceType: item.laceType,
        bundleUnitQuantity: item.quantityRequired,
      })),
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!allInStock}
      className={`w-full rounded-md px-6 py-3 font-sans text-sm uppercase tracking-[0.2em] transition ${
        allInStock
          ? "bg-espresso text-ivory hover:bg-espresso/90"
          : "cursor-not-allowed border border-charcoal/20 bg-charcoal/5 text-charcoal/40"
      }`}
    >
      {allInStock ? "Add Bundle to Cart" : "Currently Unavailable"}
    </button>
  );
}
