import Link from "next/link";
import ClearCartOnMount from "@/components/checkout/ClearCartOnMount";
import PendingOrderStatus from "@/components/checkout/PendingOrderStatus";
import { formatOrderDeliveryFee } from "@/lib/delivery";
import { describeAppliedDiscount } from "@/lib/discount";
import { formatNaira } from "@/lib/format";
import { getOrderWithItems } from "@/lib/orders";

export const dynamic = "force-dynamic";

function InfoState({
  title,
  message,
  ctaHref = "/shop",
  ctaLabel = "Back to Shop",
}: {
  title: string;
  message: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <main className="flex min-h-screen flex-1 flex-col items-center justify-center gap-3 bg-ivory px-6 text-center">
      <h1 className="font-heading text-3xl text-espresso">{title}</h1>
      <p className="max-w-sm font-sans text-sm text-charcoal/70">{message}</p>
      <Link
        href={ctaHref}
        className="mt-2 rounded-md border border-espresso px-6 py-3 font-sans text-sm uppercase tracking-[0.2em] text-espresso transition hover:bg-espresso hover:text-ivory"
      >
        {ctaLabel}
      </Link>
    </main>
  );
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string }>;
}) {
  const { order_id: orderId } = await searchParams;

  if (!orderId) {
    return (
      <InfoState
        title="Order not found"
        message="We couldn't find that order. If you just completed a purchase, check your email for confirmation."
      />
    );
  }

  const order = await getOrderWithItems(orderId).catch(() => null);

  if (!order) {
    return (
      <InfoState
        title="Order not found"
        message="We couldn't find that order. If you just completed a purchase, check your email for confirmation."
      />
    );
  }

  if (order.payment_status === "failed") {
    return (
      <InfoState
        title="Payment failed"
        message="Your payment didn't go through, and you haven't been charged. Please try again."
        ctaHref="/checkout"
        ctaLabel="Back to Checkout"
      />
    );
  }

  if (order.payment_status === "pending") {
    return (
      <main className="flex min-h-screen flex-1 flex-col items-center justify-center gap-3 bg-ivory px-6 text-center">
        <h1 className="font-heading text-3xl text-espresso">One moment…</h1>
        <PendingOrderStatus orderId={order.id} />
      </main>
    );
  }

  const orderNumber = order.id.slice(0, 8).toUpperCase();
  const firstName = order.shipping_address?.full_name?.split(" ")[0] ?? "friend";

  return (
    <main className="flex min-h-screen flex-1 flex-col bg-ivory px-6 py-20">
      <ClearCartOnMount />
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
        <div className="text-center">
          <span className="font-sans text-xs uppercase tracking-[0.3em] text-bronze">
            Order Confirmed
          </span>
          <h1 className="mt-2 font-heading text-3xl text-espresso">
            Thank you, {firstName}!
          </h1>
          <p className="mt-3 font-sans text-sm text-charcoal/70">
            Order #{orderNumber} is confirmed — a receipt is on its way to
            your email.
          </p>
        </div>

        <div className="rounded-md border border-blush bg-ivory p-6">
          <h2 className="mb-4 font-heading text-xl text-espresso">
            Order Summary
          </h2>
          <div className="flex flex-col divide-y divide-blush">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 py-4 first:pt-0 last:pb-0"
              >
                <div className="flex min-w-0 flex-col">
                  <span className="truncate font-sans text-sm text-espresso">
                    {item.productName ?? "Item"}
                  </span>
                  <span className="font-sans text-xs text-charcoal/60">
                    {[item.sizeLabel, item.colorName].filter(Boolean).join(" · ")}{" "}
                    × {item.quantity}
                  </span>
                </div>
                <span className="shrink-0 font-sans text-sm text-charcoal">
                  {formatNaira(item.price_at_purchase * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-col gap-2 border-t border-blush pt-4">
            <div className="flex items-center justify-between font-sans text-sm text-charcoal">
              <span>Subtotal</span>
              <span>{formatNaira(order.subtotal)}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex items-center justify-between font-sans text-sm text-espresso">
                <span>
                  {describeAppliedDiscount(
                    order.bundle?.name ?? null,
                    order.promotion?.code ?? null,
                  )}
                </span>
                <span>-{formatNaira(order.discount_amount)}</span>
              </div>
            )}
            <div className="flex items-center justify-between font-sans text-sm text-charcoal">
              <span>
                Delivery
                {order.deliveryOption ? ` (${order.deliveryOption.name})` : ""}
              </span>
              <span>
                {formatOrderDeliveryFee(
                  order.delivery_fee,
                  order.deliveryOption?.category ?? "",
                  order.freeShippingApplied,
                )}
              </span>
            </div>
            <div className="flex items-center justify-between font-heading text-lg text-espresso">
              <span>Total</span>
              <span>{formatNaira(order.total)}</span>
            </div>
          </div>
        </div>

        {order.shipping_address && (
          <div className="rounded-md border border-blush bg-ivory p-6">
            <h2 className="mb-2 font-heading text-xl text-espresso">
              Shipping To
            </h2>
            <p className="font-sans text-sm leading-relaxed text-charcoal/80">
              {order.shipping_address.full_name}
              <br />
              {order.shipping_address.address_line}
              <br />
              {order.shipping_address.city}, {order.shipping_address.state}
              <br />
              {order.shipping_address.country}
            </p>
          </div>
        )}

        <div className="rounded-md border border-blush bg-blush/20 p-6 text-center">
          <h2 className="mb-2 font-heading text-lg text-espresso">
            What happens next
          </h2>
          <p className="font-sans text-sm text-charcoal/70">
            We&apos;re preparing your order for shipping — you&apos;ll get
            another email once it&apos;s on its way. Delivery is currently
            within Nigeria only.
          </p>
        </div>

        <Link
          href="/shop"
          className="mx-auto rounded-md border border-espresso px-6 py-3 font-sans text-sm uppercase tracking-[0.2em] text-espresso transition hover:bg-espresso hover:text-ivory"
        >
          Continue Shopping
        </Link>
      </div>
    </main>
  );
}
