import OfferBanner from "@/components/OfferBanner";
import OfferCard from "@/components/OfferCard";
import type { BundleOfferForShop } from "@/lib/bundleOffers";

// Shared between the shop page and the homepage — hides itself entirely
// when there's nothing active to show, so callers don't need their own
// empty-check.
export default function OffersSection({ offers }: { offers: BundleOfferForShop[] }) {
  if (offers.length === 0) return null;

  const flexibleOffers = offers.filter((offer) => offer.bundle_type === "flexible_quantity");
  const specificOffers = offers.filter((offer) => offer.bundle_type === "specific_products");

  return (
    <section id="offers" className="border-t border-blush py-section md:py-section-md lg:py-section-lg">
      <h2 className="mb-10 text-center font-heading text-2xl text-espresso sm:text-3xl">
        Special Offers
      </h2>
      <div className="mx-auto grid w-full max-w-content grid-cols-1 gap-x-8 gap-y-16 px-6 sm:grid-cols-2 sm:px-12 lg:grid-cols-3">
        {flexibleOffers.map((offer) => (
          <OfferBanner key={offer.id} offer={offer} />
        ))}
        {specificOffers.map((offer) => (
          <OfferCard key={offer.id} offer={offer} />
        ))}
      </div>
    </section>
  );
}
