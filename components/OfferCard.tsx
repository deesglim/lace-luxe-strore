import Link from "next/link";
import type { BundleOfferForShop } from "@/lib/bundleOffers";
import { formatNaira } from "@/lib/format";

export default function OfferCard({ offer }: { offer: BundleOfferForShop }) {
  return (
    <Link
      href={`/shop/offers/${offer.id}`}
      className="group flex flex-col overflow-hidden rounded-md border border-blush bg-ivory shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="aspect-[3/4] w-full overflow-hidden bg-blush">
        {offer.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={offer.image_url}
            alt={offer.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-heading text-2xl italic text-bronze">LL</span>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1 px-4 py-4 text-center">
        <p className="font-sans text-xs uppercase tracking-[0.3em] text-bronze">
          Bundle Offer
        </p>
        <h3 className="font-heading text-xl text-espresso">{offer.name}</h3>
        <div className="flex items-center justify-center gap-2 font-sans text-sm">
          {offer.originalPrice > offer.bundle_price && (
            <span className="text-charcoal/40 line-through">
              {formatNaira(offer.originalPrice)}
            </span>
          )}
          <span className="text-espresso">{formatNaira(offer.bundle_price)}</span>
        </div>
      </div>
    </Link>
  );
}
