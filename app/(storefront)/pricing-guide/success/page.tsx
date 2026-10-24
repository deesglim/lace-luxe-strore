import Link from "next/link";
import { verifyPaystackTransaction } from "@/lib/paystack";
import { confirmPricingGuidePayment, getPricingGuidePurchase } from "@/lib/pricingGuide";

export const dynamic = "force-dynamic";

function State({
  title,
  message,
  href,
  label,
}: {
  title: string;
  message: string;
  href: string;
  label: string;
}) {
  return (
    <main className="flex min-h-screen flex-1 flex-col items-center justify-center gap-3 bg-ivory px-6 text-center">
      <h1 className="font-heading text-3xl text-espresso">{title}</h1>
      <p className="max-w-sm font-sans text-sm text-charcoal/70">{message}</p>
      <a
        href={href}
        className="mt-2 rounded-md border border-espresso px-6 py-3 font-sans text-sm uppercase tracking-[0.2em] text-espresso transition hover:bg-espresso hover:text-ivory"
      >
        {label}
      </a>
    </main>
  );
}

export default async function PricingGuideSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string }>;
}) {
  const { reference } = await searchParams;
  const purchase = reference ? await getPricingGuidePurchase(reference).catch(() => null) : null;

  if (!reference || !purchase) {
    return (
      <State
        title="We couldn't find that payment"
        message="If you were charged, contact us with your payment receipt and we'll sort it out."
        href="/pricing-guide"
        label="Back to the guide"
      />
    );
  }

  let paid = purchase.status === "paid";

  if (!paid && purchase.status === "pending") {
    try {
      const verified = await verifyPaystackTransaction(reference);
      const result = await confirmPricingGuidePayment(reference, verified);
      paid = result === "paid" || result === "already_paid";
    } catch {
      paid = false;
    }
  }

  if (paid) {
    return (
      <State
        title="You're in!"
        message="Payment received. Your Hair Service Pricing Guide is ready, and we've emailed you the details."
        href="/pricing-guide/calculator"
        label="Open your calculator"
      />
    );
  }

  return (
    <main className="flex min-h-screen flex-1 flex-col items-center justify-center gap-3 bg-ivory px-6 text-center">
      <h1 className="font-heading text-3xl text-espresso">Payment not confirmed yet</h1>
      <p className="max-w-sm font-sans text-sm text-charcoal/70">
        If you completed the payment, it can take a minute to confirm. Refresh this page shortly.
        If you cancelled, you can try again.
      </p>
      <Link
        href="/pricing-guide"
        className="mt-2 rounded-md border border-espresso px-6 py-3 font-sans text-sm uppercase tracking-[0.2em] text-espresso"
      >
        Back to the guide
      </Link>
    </main>
  );
}
