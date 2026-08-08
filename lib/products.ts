import { createClient } from "@/lib/supabase/server";
import type {
  Product,
  ProductRecommendation,
  ProductVariant,
  ProductVariantColor,
  Review,
} from "@/types";

type VariantSummary = Pick<ProductVariant, "price">;
type VariantColorDetail = Pick<
  ProductVariantColor,
  "id" | "color_name" | "stock_quantity"
>;
type VariantDetail = Pick<
  ProductVariant,
  "id" | "size_label" | "price" | "stock_quantity" | "sku"
> & {
  product_variant_colors: VariantColorDetail[];
};

const VARIANT_WITH_COLORS_FIELDS =
  "id, size_label, price, stock_quantity, sku, product_variant_colors(id, color_name, stock_quantity)";

export type ProductSummary = Pick<
  Product,
  "id" | "name" | "slug" | "lace_type" | "images"
> & {
  product_variants: VariantSummary[];
};

export type ProductWithVariants = Product & {
  product_variants: VariantDetail[];
};

export async function getActiveProducts(): Promise<ProductSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, slug, lace_type, images, product_variants(price)")
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getProductBySlug(
  slug: string,
): Promise<ProductWithVariants | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      `id, name, slug, description, lace_type, images, active, why_choose, why_not_choose, created_at, product_variants(${VARIANT_WITH_COLORS_FIELDS})`,
    )
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getApprovedReviews(productId: string): Promise<Review[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("id, product_id, customer_name, rating, comment, approved, created_at")
    .eq("product_id", productId)
    .eq("approved", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export type AdminProductSummary = Pick<
  Product,
  "id" | "name" | "slug" | "lace_type" | "active"
> & {
  product_variants: { id: string }[];
};

// Admin-facing queries intentionally skip the `active = true` filter so
// drafts show up in the dashboard too.
export async function getAllProductsForAdmin(): Promise<AdminProductSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, slug, lace_type, active, product_variants(id)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getProductByIdForAdmin(
  id: string,
): Promise<ProductWithVariants | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      `id, name, slug, description, lace_type, images, active, why_choose, why_not_choose, created_at, product_variants(${VARIANT_WITH_COLORS_FIELDS})`,
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export type ProductRecommendationDisplay = {
  id: string;
  reason_label: string | null;
  recommended_product: Pick<Product, "id" | "name" | "slug"> | null;
};

// Public-facing: embeds the recommended product's name/slug for rendering
// the "Choose [name]" link. The FK hint disambiguates which of the two
// foreign keys to products (product_id vs recommended_product_id) to embed.
export async function getProductRecommendations(
  productId: string,
): Promise<ProductRecommendationDisplay[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product_recommendations")
    .select(
      "id, reason_label, recommended_product:products!product_recommendations_recommended_product_id_fkey(id, name, slug)",
    )
    .eq("product_id", productId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  // Without generated Database types, supabase-js infers this to-one FK
  // embed as an array; at runtime it's always a single object (or null).
  return (data ?? []).map((row) => ({
    id: row.id,
    reason_label: row.reason_label,
    recommended_product: Array.isArray(row.recommended_product)
      ? (row.recommended_product[0] ?? null)
      : row.recommended_product,
  }));
}

export type AdminRecommendationRow = Pick<
  ProductRecommendation,
  "id" | "recommended_product_id" | "reason_label"
>;

// Admin-facing: raw rows only, no join — the edit form already has the full
// product list for its dropdown and just needs to know which id is selected.
export async function getProductRecommendationsForAdmin(
  productId: string,
): Promise<AdminRecommendationRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product_recommendations")
    .select("id, recommended_product_id, reason_label")
    .eq("product_id", productId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getProductOptionsForAdmin(): Promise<
  Pick<Product, "id" | "name">[]
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}
