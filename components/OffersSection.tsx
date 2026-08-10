import OfferBanner from "@/components/OfferBanner";
import OfferCard from "@/components/OfferCard";
import type { BundleOfferForShop } from "@/lib/bundleOffers";

// Shop page only — hides itself entirely when there's nothing active to
// show, so the caller doesn't need its own empty-check. Wraps into a
// 2/3/4-column grid; banners (no fixed items to show as a card) span the
// full row width at each breakpoint instead of sitting in one column.
export default function OffersSection({ offers }: { offers: BundleOfferForShop[] }) {
  if (offers.length === 0) return null;

  const flexibleOffers = offers.filter((offer) => offer.bundle_type === "flexible_quantity");
  const specificOffers = offers.filter((offer) => offer.bundle_type === "specific_products");

  return (
    <section id="offers" className="border-t border-blush py-section">
      <h2 className="mb-10 text-center font-heading font-medium text-2xl text-espresso sm:text-3xl">
        Special Offers
      </h2>
      <div className="mx-auto grid w-full max-w-content grid-cols-2 justify-items-center gap-x-5 gap-y-8 px-6 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-8 lg:px-[60px]">
        {flexibleOffers.map((offer) => (
          <div key={offer.id} className="col-span-2 w-full md:col-span-3 lg:col-span-4">
            <OfferBanner offer={offer} />
          </div>
        ))}
        {specificOffers.map((offer) => (
          <OfferCard key={offer.id} offer={offer} />
        ))}
      </div>
    </section>
  );
}
