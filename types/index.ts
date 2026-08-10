// Shared TypeScript types for Lace Luxe by Dee, mirroring the Supabase schema
// in /supabase/migrations. Extend these as new tables/columns are added.

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  lace_type: string | null;
  images: string[];
  active: boolean;
  is_best_seller: boolean;
  why_choose: string[];
  why_not_choose: string[];
  created_at: string;
};

export type ProductVariant = {
  id: string;
  product_id: string;
  size_label: string;
  price: number;
  compare_at_price: number | null;
  stock_quantity: number;
  sku: string | null;
  created_at: string;
};

export type ProductVariantColor = {
  id: string;
  variant_id: string;
  color_name: string;
  stock_quantity: number;
  created_at: string;
};

export type ProductRecommendation = {
  id: string;
  product_id: string;
  recommended_product_id: string;
  reason_label: string | null;
  created_at: string;
};

export type Review = {
  id: string;
  product_id: string;
  customer_name: string;
  rating: number;
  comment: string | null;
  approved: boolean;
  created_at: string;
};

export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  address_line: string | null;
  city: string | null;
  state: string | null;
  wholesale_status: "none" | "pending" | "approved";
  wholesale_discount_percent: number;
  is_admin: boolean;
  created_at: string;
};

export type ShippingAddress = {
  full_name: string;
  phone: string;
  address_line: string;
  city: string;
  state: string;
  country: string;
};

export type Order = {
  id: string;
  customer_id: string | null;
  guest_email: string | null;
  status: "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled";
  subtotal: number;
  discount_amount: number;
  promotion_id: string | null;
  bundle_id: string | null;
  delivery_option_id: string | null;
  delivery_fee: number;
  total: number;
  shipping_address: ShippingAddress | null;
  payment_reference: string | null;
  payment_status: "pending" | "paid" | "failed";
  tracking_note: string | null;
  created_at: string;
};

export type Promotion = {
  id: string;
  type: "percentage" | "fixed";
  value: number;
  scope: "sitewide" | "category" | "product";
  // For scope "category" this is a product.lace_type value; for "product"
  // it's a product id; for "sitewide" it's always null.
  scope_reference: string | null;
  code: string | null;
  active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
};

export type BundleOffer = {
  id: string;
  name: string;
  description: string | null;
  bundle_type: "specific_products" | "flexible_quantity";
  bundle_price: number;
  image_url: string | null;
  // flexible_quantity only.
  required_quantity: number | null;
  scope: "sitewide" | "category" | null;
  scope_reference: string | null;
  active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
};

export type BundleOfferItem = {
  id: string;
  bundle_offer_id: string;
  product_id: string;
  // Nullable at the DB level (see migration) even though the admin form
  // always requires picking one going forward — a null here just means
  // this item can never match anything in a cart.
  variant_id: string | null;
  color_id: string | null;
  quantity_required: number;
};

export type DeliveryOption = {
  id: string;
  category: "pickup" | "local_delivery" | "interstate_transport";
  name: string;
  description: string | null;
  price: number;
  delivery_time: string | null;
  active: boolean;
  display_order: number;
  created_at: string;
};

export type StoreSettings = {
  id: string;
  delivery_notice: string;
  free_shipping_threshold: number;
  hero_image_url: string | null;
  hero_heading: string | null;
  hero_subheading: string | null;
  announcement_text: string | null;
  announcement_active: boolean;
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  variant_id: string;
  color_id: string | null;
  quantity: number;
  price_at_purchase: number;
};

// Client-only, persisted to localStorage — not a DB table. id is derived
// from `${variantId}:${colorId ?? "none"}` so re-adding the same size+color
// merges into one line instead of duplicating it.
export type CartItem = {
  id: string;
  productId: string;
  productSlug: string;
  variantId: string;
  colorId: string | null;
  sizeLabel: string;
  colorName: string | null;
  name: string;
  image: string | null;
  price: number;
  quantity: number;
  // The product's lace_type at add-to-cart time — needed client-side to
  // preview category-scoped promotions without a round trip. Items added
  // before this field existed will read as undefined at runtime, which
  // just means they never match a category promotion (safe default).
  laceType: string | null;
  // Present only on items added via "Add Bundle to Cart" — pure cart
  // *display* tagging (grouping items back into their bundle card, showing
  // the flat bundle price instead of summed regular prices). Never sent to
  // the server: checkout independently re-derives which bundle applies
  // from the real variant/color data in resolvedItems, same as before.
  bundleOfferId?: string | null;
  bundleName?: string | null;
  bundleImage?: string | null;
  // This item's quantity_required for ONE set of the bundle — used to
  // figure out how many full sets are in the cart (quantity / this).
  bundleUnitQuantity?: number | null;
  // The bundle's bundle_price at add-to-cart time, snapshotted so the cart
  // can show a total without re-fetching bundle data. If the admin changes
  // the price later, cart display can go briefly stale until the customer
  // re-adds — checkout always re-derives the real price regardless.
  bundlePriceSnapshot?: number | null;
};
