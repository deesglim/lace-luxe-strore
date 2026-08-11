import Link from "next/link";
import { notFound } from "next/navigation";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/admin/OrderStatusBadge";
import OrderStatusUpdater from "@/components/admin/OrderStatusUpdater";
import { formatOrderDeliveryFee } from "@/lib/delivery";
import { describeAppliedDiscount } from "@/lib/discount";
import { formatNaira } from "@/lib/format";
import { getOrderWithItems } from "@/lib/orders";

export const dynamic = "force-dynamic";

function orderNumber(id: string) {
  return id.slice(0, 8).toUpperCase();
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderWithItems(id).catch(() => null);

  if (!order) {
    notFound();
  }

  const address = order.shipping_address;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link
          href="/admin/orders"
          className="mb-2 inline-block font-sans text-xs uppercase tracking-[0.2em] text-bronze underline underline-offset-4"
        >
          ← Back to Orders
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-heading text-2xl text-espresso">
            Order #{orderNumber(order.id)}
          </h1>
          <PaymentStatusBadge status={order.payment_status} />
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-8">
          <div className="border border-blush p-6">
            <h2 className="mb-4 font-heading text-xl text-espresso">Items</h2>
            <div className="flex flex-col divide-y divide-blush">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-blush">
                    {item.productImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.productImage}
                        alt={item.productName ?? "Item"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="font-heading text-sm italic text-bronze">
                          LL
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col">
                    <span className="font-sans text-sm text-espresso">
                      {item.productName ?? "Item"}
                    </span>
                    <span className="font-sans text-xs text-charcoal/60">
                      {[item.sizeLabel, item.colorName].filter(Boolean).join(" · ")}
                      {" "}× {item.quantity}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-sans text-xs text-charcoal/60">
                      {formatNaira(item.price_at_purchase)} each
                    </span>
                    <span className="font-sans text-sm text-charcoal">
                      {formatNaira(item.price_at_purchase * item.quantity)}
                    </span>
                  </div>
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
                  Delivery{order.deliveryOption ? ` (${order.deliveryOption.name})` : ""}
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

          <div className="flex flex-col gap-3">
            <h2 className="font-heading text-xl text-espresso">Update Status</h2>
            <OrderStatusUpdater
              orderId={order.id}
              status={order.status}
              paymentStatus={order.payment_status}
              trackingNote={order.tracking_note}
            />
            {order.tracking_note && (
              <p className="font-sans text-xs text-charcoal/60">
                Current tracking note: {order.tracking_note}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="border border-blush p-6">
            <h2 className="mb-3 font-heading text-lg text-espresso">Customer</h2>
            <p className="font-sans text-sm text-charcoal">
              {address?.full_name ?? "—"}
            </p>
            <p className="font-sans text-sm text-charcoal/70">
              {order.guest_email ?? "—"}
            </p>
            <p className="font-sans text-sm text-charcoal/70">
              {address?.phone ?? "—"}
            </p>
          </div>

          <div className="border border-blush p-6">
            <h2 className="mb-3 font-heading text-lg text-espresso">
              Shipping Address
            </h2>
            {address ? (
              <p className="font-sans text-sm leading-relaxed text-charcoal/80">
                {address.address_line}
                <br />
                {address.city}, {address.state}
                <br />
                {address.country}
              </p>
            ) : (
              <p className="font-sans text-sm text-charcoal/60">
                No shipping address on file.
              </p>
            )}
          </div>

          {order.order_note && (
            <div className="border border-blush p-6">
              <h2 className="mb-3 font-heading text-lg text-espresso">
                Order Note
              </h2>
              <p className="whitespace-pre-line font-sans text-sm leading-relaxed text-charcoal/80">
                {order.order_note}
              </p>
            </div>
          )}

          <div className="border border-blush p-6">
            <h2 className="mb-3 font-heading text-lg text-espresso">
              Order Info
            </h2>
            <p className="font-sans text-xs text-charcoal/60">
              Placed {new Date(order.created_at).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
