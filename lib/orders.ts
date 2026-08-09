import { getStoreSettingsAdmin } from "@/lib/deliveryOptions";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Order, ShippingAddress } from "@/types";

export type OrderItemDetail = {
  id: string;
  variantId: string;
  colorId: string | null;
  quantity: number;
  price_at_purchase: number;
  sizeLabel: string | null;
  colorName: string | null;
  productName: string | null;
  productSlug: string | null;
  productImage: string | null;
};

export type OrderDeliveryOption = {
  name: string;
  category: string;
  delivery_time: string | null;
};

export type OrderPromotion = {
  code: string | null;
};

export type OrderBundle = {
  name: string;
};

export type OrderWithItems = Order & {
  items: OrderItemDetail[];
  deliveryOption: OrderDeliveryOption | null;
  promotion: OrderPromotion | null;
  bundle: OrderBundle | null;
  // Whether the order's subtotal meets the *current* free shipping
  // threshold — recomputed at read time rather than stored on the order, so
  // this reflects the threshold in effect now, not necessarily at purchase
  // time. Fine for display purposes (email/success page); the actual
  // delivery_fee charged is fixed at checkout and unaffected by this.
  freeShippingApplied: boolean;
};

function toSingle<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

/**
 * Service-role fetch of one order by id, with product/size/color names
 * joined in for display (email, success page). Used by contexts that are
 * deliberately allowed to read any order regardless of RLS ownership: the
 * webhook (no user session at all) and the checkout success page (a guest
 * who just paid has no auth.uid() to match against orders.customer_id, so
 * normal RLS can't authorize them either — the order's own unguessable id,
 * known only to Paystack's redirect and the checkout API's response, is the
 * access control for that page).
 */
export async function getOrderWithItems(orderId: string): Promise<OrderWithItems | null> {
  const supabase = createAdminClient();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(
      "id, customer_id, guest_email, status, subtotal, discount_amount, promotion_id, bundle_id, delivery_option_id, delivery_fee, total, shipping_address, payment_reference, payment_status, tracking_note, created_at, delivery_options(name, category, delivery_time), promotions(code), bundle_offers(name)",
    )
    .eq("id", orderId)
    .maybeSingle();

  if (orderError) throw orderError;
  if (!order) return null;

  const { delivery_options, promotions, bundle_offers, ...orderFields } = order;
  const deliveryOption = toSingle(delivery_options);
  const promotion = toSingle(promotions);
  const bundle = toSingle(bundle_offers);

  const { data: itemRows, error: itemsError } = await supabase
    .from("order_items")
    .select(
      "id, variant_id, color_id, quantity, price_at_purchase, product_variants(size_label, products(name, slug, images)), product_variant_colors(color_name)",
    )
    .eq("order_id", orderId);

  if (itemsError) throw itemsError;

  const settings = await getStoreSettingsAdmin();
  const freeShippingThreshold = settings?.free_shipping_threshold ?? 0;
  const freeShippingApplied =
    freeShippingThreshold > 0 && order.subtotal >= freeShippingThreshold;

  const items: OrderItemDetail[] = (itemRows ?? []).map((row) => {
    const variant = toSingle(row.product_variants);
    const product = variant ? toSingle(variant.products) : null;
    const color = toSingle(row.product_variant_colors);

    return {
      id: row.id,
      variantId: row.variant_id,
      colorId: row.color_id,
      quantity: row.quantity,
      price_at_purchase: row.price_at_purchase,
      sizeLabel: variant?.size_label ?? null,
      colorName: color?.color_name ?? null,
      productName: product?.name ?? null,
      productSlug: product?.slug ?? null,
      productImage: product?.images?.[0] ?? null,
    };
  });

  return { ...orderFields, deliveryOption, promotion, bundle, items, freeShippingApplied };
}

export type AdminOrderSummary = {
  id: string;
  status: Order["status"];
  payment_status: Order["payment_status"];
  total: number;
  created_at: string;
  customerName: string | null;
  customerEmail: string | null;
  deliveryOptionName: string | null;
};

/**
 * Admin-facing order list. Uses the cookie-bound client (not the service
 * role) so it relies on the "Admins have full access to orders" RLS policy
 * — same convention as the other admin list queries (getAllProductsForAdmin
 * etc). Only pages behind the (dashboard) layout's is_admin gate call this.
 */
export async function getAllOrdersForAdmin(): Promise<AdminOrderSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, status, payment_status, total, created_at, guest_email, shipping_address, delivery_options(name)",
    )
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => {
    const deliveryOption = toSingle(row.delivery_options);
    const shippingAddress = row.shipping_address as ShippingAddress | null;

    return {
      id: row.id,
      status: row.status,
      payment_status: row.payment_status,
      total: row.total,
      created_at: row.created_at,
      customerName: shippingAddress?.full_name ?? null,
      customerEmail: row.guest_email,
      deliveryOptionName: deliveryOption?.name ?? null,
    };
  });
}
