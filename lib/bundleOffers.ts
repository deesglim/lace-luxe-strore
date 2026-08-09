import type { BundleOfferWithItems } from "@/lib/bundles";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { BundleOffer } from "@/types";

const BUNDLE_FIELDS =
  "id, name, description, bundle_type, bundle_price, image_url, required_quantity, scope, scope_reference, active, starts_at, ends_at, created_at, bundle_offer_items(product_id, variant_id, color_id, quantity_required)";

function mapRow(row: {
  bundle_offer_items:
    | { product_id: string; variant_id: string | null; color_id: string | null; quantity_required: number }[]
    | null;
  [key: string]: unknown;
}): BundleOfferWithItems {
  const { bundle_offer_items, ...fields } = row;
  return {
    ...(fields as Omit<BundleOfferWithItems, "items">),
    items: bundle_offer_items ?? [],
  };
}

/**
 * Customer-facing fetch for the checkout page. Uses the cookie client, so
 * the "Public can view active bundle offers within date range" RLS policy
 * does the active/date filtering — mirrors getActivePromotionsForCheckout.
 */
export async function getActiveBundleOffersForCheckout(): Promise<BundleOfferWithItems[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bundle_offers")
    .select(BUNDLE_FIELDS)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapRow);
}

/**
 * Admin-client fetch of every bundle regardless of active/date range — used
 * by the admin bundles page and by the checkout API's server-side
 * revalidation. Mirrors getAllPromotionsAdmin.
 */
export async function getAllBundleOffersAdmin(): Promise<BundleOfferWithItems[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("bundle_offers")
    .select(BUNDLE_FIELDS)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapRow);
}

// Richer shape for the shop grid and offer detail page — unlike the lean
// BundleOfferWithItems above (which only carries the ids the discount
// calculator needs), this resolves each item's product/variant/color into
// display-ready fields (name, size, color, price, live stock) so the
// storefront never has to do a second round trip.
export type BundleOfferShopItem = {
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string | null;
  laceType: string | null;
  variantId: string;
  sizeLabel: string;
  price: number;
  variantStock: number;
  colorId: string | null;
  colorName: string | null;
  colorStock: number | null;
  quantityRequired: number;
};

export type BundleOfferForShop = Omit<BundleOffer, never> & {
  items: BundleOfferShopItem[];
  // Sum of each fixed item's regular price × its required quantity — only
  // meaningful for specific_products (flexible_quantity has no fixed items,
  // so this is 0 for those).
  originalPrice: number;
};

const SHOP_BUNDLE_FIELDS = `
  id, name, description, bundle_type, bundle_price, image_url, required_quantity, scope, scope_reference, active, starts_at, ends_at, created_at,
  bundle_offer_items(
    quantity_required,
    products(id, name, slug, images, lace_type),
    product_variants(id, size_label, price, stock_quantity),
    product_variant_colors(id, color_name, stock_quantity)
  )
`;

function toSingle<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

type ShopBundleItemRow = {
  quantity_required: number;
  products: unknown;
  product_variants: unknown;
  product_variant_colors: unknown;
};

function mapShopRow(row: {
  bundle_offer_items: ShopBundleItemRow[] | null;
  [key: string]: unknown;
}): BundleOfferForShop {
  const { bundle_offer_items, ...fields } = row;

  const items: BundleOfferShopItem[] = (bundle_offer_items ?? [])
    .map((itemRow): BundleOfferShopItem | null => {
      const product = toSingle(
        itemRow.products as
          | { id: string; name: string; slug: string; images: string[]; lace_type: string | null }
          | { id: string; name: string; slug: string; images: string[]; lace_type: string | null }[]
          | null,
      );
      const variant = toSingle(
        itemRow.product_variants as
          | { id: string; size_label: string; price: number; stock_quantity: number }
          | { id: string; size_label: string; price: number; stock_quantity: number }[]
          | null,
      );
      const color = toSingle(
        itemRow.product_variant_colors as
          | { id: string; color_name: string; stock_quantity: number }
          | { id: string; color_name: string; stock_quantity: number }[]
          | null,
      );

      if (!product || !variant) return null;

      return {
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        productImage: product.images?.[0] ?? null,
        laceType: product.lace_type,
        variantId: variant.id,
        sizeLabel: variant.size_label,
        price: variant.price,
        variantStock: variant.stock_quantity,
        colorId: color?.id ?? null,
        colorName: color?.color_name ?? null,
        colorStock: color?.stock_quantity ?? null,
        quantityRequired: itemRow.quantity_required,
      };
    })
    .filter((item): item is BundleOfferShopItem => item !== null);

  const originalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantityRequired,
    0,
  );

  return {
    ...(fields as Omit<BundleOfferForShop, "items" | "originalPrice">),
    items,
    originalPrice,
  };
}

/** Active bundles with full item details, for the shop grid's Offers tab. */
export async function getActiveBundleOffersForShop(): Promise<BundleOfferForShop[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bundle_offers")
    .select(SHOP_BUNDLE_FIELDS)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapShopRow);
}

/** Single active bundle with full item details, for the offer detail page. */
export async function getBundleOfferForShop(
  id: string,
): Promise<BundleOfferForShop | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bundle_offers")
    .select(SHOP_BUNDLE_FIELDS)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapShopRow(data);
}
