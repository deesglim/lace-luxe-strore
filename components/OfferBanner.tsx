import Link from "next/link";
import type { BundleOfferForShop } from "@/lib/bundleOffers";

// Deliberately not a product-style card — no fixed items, so no
// strikethrough price makes sense here. "Shop Now" just sends the customer
// to browse the collection rather than adding anything directly (the shop
// page has no category-filter UI yet to deep-link a scoped category into).
export default function OfferBanner({ offer }: { offer: BundleOfferForShop }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-between gap-4 rounded-md border border-bronze/40 bg-espresso px-6 py-10 text-center sm:flex-row sm:text-left">
      <div className="flex flex-col gap-2">
        <p className="font-sans text-xs uppercase tracking-[0.3em] text-bronze">
          Limited-Time Offer
        </p>
        <h3 className="font-heading text-2xl text-ivory">{offer.name}</h3>
        {offer.description && (
          <p className="font-sans text-sm text-ivory/70">{offer.description}</p>
        )}
      </div>
      <Link
        href="/shop"
        className="shrink-0 rounded-md bg-ivory px-6 py-3 font-sans text-sm uppercase tracking-[0.2em] text-espresso transition hover:bg-blush"
      >
        Shop Now
      </Link>
    </div>
  );
}
