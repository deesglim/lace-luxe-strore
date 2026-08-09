import { createClient } from "@/lib/supabase/server";

export type ShowcaseMediaType = "image" | "video";

export type ShowcaseProductTag = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  variantId: string;
  sizeLabel: string;
  price: number;
  stockQuantity: number;
};

export type ShowcaseItem = {
  id: string;
  mediaUrl: string;
  mediaType: ShowcaseMediaType;
  handleText: string | null;
  followerText: string | null;
  captionText: string | null;
  product: ShowcaseProductTag | null;
};

type VariantRow = { id: string; price: number; stock_quantity: number; size_label: string };

// Picks the cheapest variant to quick-add — same "keep it simple" tradeoff
// as elsewhere in the storefront (e.g. ProductCard's "from ₦X" price),
// no size/color picker in the showcase card itself.
function cheapestVariant(variants: VariantRow[]): VariantRow | null {
  return variants.reduce<VariantRow | null>((cheapest, variant) => {
    if (!cheapest || variant.price < cheapest.price) return variant;
    return cheapest;
  }, null);
}

export async function getActiveShowcaseItemsForHomepage(): Promise<ShowcaseItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customer_showcase")
    .select(
      "id, media_url, media_type, handle_text, follower_text, caption_text, products(id, name, slug, images, product_variants(id, price, stock_quantity, size_label))",
    )
    .eq("active", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => {
    const product = Array.isArray(row.products) ? row.products[0] : row.products;
    const variant = product ? cheapestVariant(product.product_variants ?? []) : null;

    return {
      id: row.id,
      mediaUrl: row.media_url,
      mediaType: row.media_type as ShowcaseMediaType,
      handleText: row.handle_text,
      followerText: row.follower_text,
      captionText: row.caption_text,
      product:
        product && variant
          ? {
              id: product.id,
              name: product.name,
              slug: product.slug,
              image: product.images?.[0] ?? null,
              variantId: variant.id,
              sizeLabel: variant.size_label,
              price: variant.price,
              stockQuantity: variant.stock_quantity,
            }
          : null,
    };
  });
}

export type AdminShowcaseItem = {
  id: string;
  mediaUrl: string;
  mediaType: ShowcaseMediaType;
  handleText: string | null;
  followerText: string | null;
  captionText: string | null;
  productId: string | null;
  productName: string | null;
  displayOrder: number;
  active: boolean;
  createdAt: string;
};

export async function getAllShowcaseItemsForAdmin(): Promise<AdminShowcaseItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customer_showcase")
    .select(
      "id, media_url, media_type, handle_text, follower_text, caption_text, product_id, display_order, active, created_at, products(name)",
    )
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => {
    const product = Array.isArray(row.products) ? row.products[0] : row.products;
    return {
      id: row.id,
      mediaUrl: row.media_url,
      mediaType: row.media_type as ShowcaseMediaType,
      handleText: row.handle_text,
      followerText: row.follower_text,
      captionText: row.caption_text,
      productId: row.product_id,
      productName: product?.name ?? null,
      displayOrder: row.display_order,
      active: row.active,
      createdAt: row.created_at,
    };
  });
}
