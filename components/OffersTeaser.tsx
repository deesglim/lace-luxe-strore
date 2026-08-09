import Link from "next/link";
import type { BundleOfferForShop } from "@/lib/bundleOffers";

// Same hand-drawn inline-SVG convention as TrustBadges — no icon library
// in this project.
function BoxesIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className="h-8 w-8 shrink-0"
    >
      <path d="M3 8l6-3 6 3-6 3-6-3z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 8v7l6 3V11" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 8v7l-6 3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 5l6-3 6 3-6 3-6-3z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 8l6-3v7l-6 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Homepage-only promo strip — a compact horizontal bar, not a tall image
// banner. Deliberately doesn't show bundle contents or pricing (that's what
// the full OffersSection on /shop is for); this just entices the click
// through to /shop#offers, where the real cards live.
export default function OffersTeaser({ offers }: { offers: BundleOfferForShop[] }) {
  if (offers.length === 0) return null;

  return (
    <section className="border-t border-blush py-10">
      <div className="mx-auto w-full max-w-6xl px-6 sm:px-12">
        <Link
          href="/shop#offers"
          className="group flex flex-col items-stretch gap-4 rounded-md bg-espresso px-6 py-5 transition hover:bg-charcoal sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-10 sm:py-6"
        >
          <div className="flex items-center gap-4">
            <span className="text-bronze">
              <BoxesIcon />
            </span>
            <div className="flex flex-col gap-0.5">
              <h2 className="whitespace-nowrap font-sans text-sm font-bold uppercase tracking-[0.06em] text-ivory sm:text-lg sm:tracking-[0.1em]">
                Buy More &amp; Save More
              </h2>
              <p className="font-sans text-xs text-ivory/70 sm:text-sm">
                For vendors &amp; bulk buyers
              </p>
            </div>
          </div>

          <span className="shrink-0 rounded-md bg-ivory px-5 py-2.5 text-center font-sans text-xs font-medium uppercase tracking-[0.15em] text-espresso transition group-hover:bg-blush sm:w-auto sm:px-6 sm:text-sm">
            Shop Bulk Deals
          </span>
        </Link>
      </div>
    </section>
  );
}
