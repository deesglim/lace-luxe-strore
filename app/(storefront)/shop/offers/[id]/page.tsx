import Link from "next/link";
import BundleAddToCartButton from "@/components/BundleAddToCartButton";
import { getBundleOfferForShop } from "@/lib/bundleOffers";
import { formatNaira } from "@/lib/format";

export const dynamic = "force-dynamic";

function InfoState({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <main className="flex min-h-screen flex-1 flex-col items-center justify-center gap-3 bg-ivory px-6 text-center">
      <h1 className="font-heading text-3xl text-espresso">{title}</h1>
      <p className="max-w-sm font-sans text-sm text-charcoal/70">{message}</p>
      <Link
        href="/shop"
        className="mt-2 font-sans text-sm uppercase tracking-[0.2em] text-bronze underline underline-offset-4"
      >
        Back to Shop
      </Link>
    </main>
  );
}

export default async function BundleOfferDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const offer = await getBundleOfferForShop(id).catch(() => "error" as const);

  if (offer === "error") {
    return (
      <InfoState
        title="Something went wrong"
        message="We couldn't load this offer right now. Please try again shortly."
      />
    );
  }

  // Flexible-quantity bundles have no fixed items and no product-style page
  // of their own — they're only ever shown as a banner on /shop, so
  // reaching this page for one (e.g. a stale/guessed link) isn't a real
  // offer to display.
  if (!offer || offer.bundle_type !== "specific_products" || offer.items.length === 0) {
    return (
      <InfoState
        title="Offer not found"
        message="This offer may have ended or moved. Take a look at the full collection instead."
      />
    );
  }

  const allInStock = offer.items.every(
    (item) => (item.colorId ? (item.colorStock ?? 0) : item.variantStock) >= item.quantityRequired,
  );

  return (
    <main className="flex min-h-screen flex-1 flex-col bg-ivory px-6 py-20">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
        <div>
          <p className="font-sans text-xs uppercase tracking-[0.3em] text-bronze">
            Bundle Offer
          </p>
          <h1 className="mt-2 font-heading text-3xl font-medium text-espresso sm:text-4xl">
            {offer.name}
          </h1>
        </div>

        {offer.description && (
          <p className="font-sans text-sm leading-relaxed text-charcoal/80">
            {offer.description}
          </p>
        )}

        <div className="aspect-[3/4] w-full max-w-sm overflow-hidden rounded-md bg-blush">
          {offer.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={offer.image_url}
              alt={offer.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="font-heading text-2xl italic text-bronze">LL</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <p className="mb-2 font-sans text-xs uppercase tracking-[0.2em] text-bronze">
              What&apos;s Included
            </p>
            <div className="flex flex-col divide-y divide-blush rounded-md border border-blush">
              {offer.items.map((item, index) => (
                <div
                  key={`${item.variantId}:${item.colorId ?? "none"}:${index}`}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="flex flex-col">
                    <span className="font-sans text-sm text-espresso">
                      {item.productName}
                    </span>
                    <span className="font-sans text-xs text-charcoal/60">
                      {item.sizeLabel}
                      {item.colorName ? ` · ${item.colorName}` : ""}
                    </span>
                  </div>
                  <span className="shrink-0 font-sans text-sm text-charcoal">
                    × {item.quantityRequired}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {offer.originalPrice > offer.bundle_price && (
              <span className="font-sans text-lg text-charcoal/40 line-through">
                {formatNaira(offer.originalPrice)}
              </span>
            )}
            <span className="font-heading text-2xl text-espresso">
              {formatNaira(offer.bundle_price)}
            </span>
          </div>

          <BundleAddToCartButton offer={offer} allInStock={allInStock} />
          {!allInStock && (
            <p className="font-sans text-xs text-bronze">
              One or more items in this bundle are currently out of stock —
              check back soon.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
