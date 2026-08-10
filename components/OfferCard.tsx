import Link from "next/link";
import type { BundleOfferForShop } from "@/lib/bundleOffers";
import { formatNaira } from "@/lib/format";

export default function OfferCard({ offer }: { offer: BundleOfferForShop }) {
  const onSale = offer.originalPrice > offer.bundle_price;

  return (
    <Link
      href={`/shop/offers/${offer.id}`}
      className="group flex h-[320px] w-[200px] flex-col overflow-hidden rounded-brand border border-espresso/[0.08] bg-ivory shadow-[0_8px_25px_rgba(0,0,0,0.04)] transition"
    >
      <div className="w-full flex-1 overflow-hidden bg-blush">
        {offer.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={offer.image_url}
            alt={offer.name}
            className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-heading text-2xl italic text-bronze">LL</span>
          </div>
        )}
      </div>
      <div className="flex shrink-0 flex-col gap-0.5 px-3 py-2.5">
        <p className="line-clamp-1 font-label text-[11px] font-medium uppercase tracking-label text-bronze">
          Bundle Offer
        </p>
        <h3 className="line-clamp-1 font-heading text-[18px] font-medium text-espresso lg:text-[20px]">
          {offer.name}
        </h3>
        {onSale ? (
          <p className="flex flex-wrap items-baseline gap-1.5">
            <span className="font-sans text-xs text-charcoal/40 line-through">
              {formatNaira(offer.originalPrice)}
            </span>
            <span className="font-sans text-[18px] font-semibold text-bronze lg:text-[22px]">
              {formatNaira(offer.bundle_price)}
            </span>
          </p>
        ) : (
          <p className="font-sans text-[18px] font-semibold text-espresso lg:text-[22px]">
            {formatNaira(offer.bundle_price)}
          </p>
        )}
      </div>
    </Link>
  );
}
