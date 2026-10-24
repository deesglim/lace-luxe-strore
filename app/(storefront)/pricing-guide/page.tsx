import Link from "next/link";
import type { Metadata } from "next";
import BuyPricingGuideButton from "@/components/pricingGuide/BuyPricingGuideButton";
import { getCurrentProfile } from "@/lib/auth";
import { formatNaira } from "@/lib/format";
import {
  PRICING_GUIDE_USER_GUIDE_PDF,
  getPricingGuidePrice,
  hasPricingGuideAccess,
} from "@/lib/pricingGuide";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Hair Service Pricing Guide | Deesglim",
  description:
    "Price your hair services so every job pays your staff, covers your bills and leaves you a profit.",
};

const features = [
  "Works for any hair service: ventilation, wigmaking, revamping, installation, styling and more",
  "Shows the lowest price to charge for every size or length",
  "Suggests a fair commission to pay your workers",
  "Shows what a discount leaves you before you run a sale",
  "Step-by-step PDF user guide included",
];

const linkButton =
  "rounded-md border border-espresso px-8 py-4 text-center font-sans text-sm uppercase tracking-[0.2em] text-espresso transition hover:bg-espresso hover:text-ivory";

export default async function PricingGuidePage() {
  const { user } = await getCurrentProfile();
  const owned = user ? await hasPricingGuideAccess(user.id) : false;
  const price = getPricingGuidePrice();

  return (
    <main className="flex min-h-screen flex-1 flex-col bg-ivory px-6 py-20">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
        <div className="flex flex-col gap-3">
          <span className="font-sans text-xs uppercase tracking-[0.3em] text-bronze">
            Deesglim · For hair businesses
          </span>
          <h1 className="font-heading text-4xl text-espresso">Hair Service Pricing Guide</h1>
          <p className="font-sans text-base text-charcoal/80">
            Price your services so every job pays your staff, covers your bills and still leaves
            you a profit. Built from the pricing system we use at Deesglim.
          </p>
        </div>

        <ul className="flex flex-col gap-3 font-sans text-sm text-charcoal">
          {features.map((feature) => (
            <li key={feature} className="flex gap-3">
              <span aria-hidden="true" className="text-bronze">✓</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {owned ? (
          <div className="flex flex-col gap-4 border border-blush bg-blush/20 p-6">
            <p className="font-heading text-xl text-espresso">You own this guide</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a href="/pricing-guide/calculator" className="rounded-md bg-espresso px-8 py-4 text-center font-sans text-sm uppercase tracking-[0.2em] text-ivory">
                Open your calculator
              </a>
              <a href={PRICING_GUIDE_USER_GUIDE_PDF} className={linkButton}>
                Download the user guide
              </a>
            </div>
            <p className="font-sans text-xs text-charcoal/70">
              Works on up to two devices at a time. Opening it on a new device signs out the oldest one.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 border border-blush p-6">
            <p className="font-heading text-3xl text-espresso">{formatNaira(price)}</p>
            <p className="font-sans text-sm text-charcoal/70">
              One payment. Use it for as long as you like on up to two devices.
            </p>
            {user ? (
              <BuyPricingGuideButton label="Buy now" />
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/signup?redirect=/pricing-guide" className="rounded-md bg-espresso px-8 py-4 text-center font-sans text-sm uppercase tracking-[0.2em] text-ivory">
                  Create an account to buy
                </Link>
                <Link href="/login?redirect=/pricing-guide" className={linkButton}>
                  I have an account
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
