import { createClient } from "@/lib/supabase/server";
import type {
  Product,
  ProductRecommendation,
  ProductVariant,
  ProductVariantColor,
  Review,
} from "@/types";

type VariantSummary = Pick<ProductVariant, "price" | "compare_at_price">;
type VariantColorDetail = Pick<
  ProductVariantColor,
  "id" | "color_name" | "stock_quantity"
>;
type VariantDetail = Pick<
  ProductVariant,
  "id" | "size_label" | "price" | "compare_at_price" | "stock_quantity" | "sku"
> & {
  product_variant_colors: VariantColorDetail[];
};

const VARIANT_WITH_COLORS_FIELDS =
  "id, size_label, price, compare_at_price, stock_quantity, sku, product_variant_colors(id, color_name, stock_quantity)";

export type ProductSummary = Pick<
  Product,
  "id" | "name" | "slug" | "description" | "lace_type" | "images" | "is_best_seller"
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
    .select(
      "id, name, slug, description, lace_type, images, is_best_seller, product_variants(price, compare_at_price)",
    )
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
      `id, name, slug, description, lace_type, images, active, is_best_seller, why_choose, why_not_choose, created_at, product_variants(${VARIANT_WITH_COLORS_FIELDS})`,
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

export type FeaturedReview = {
  id: string;
  customerName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  productName: string;
  productSlug: string;
};

// Top approved reviews across the whole catalog, best rating first (ties
// broken by recency) — for the homepage testimonials section. limit=8
// means "fewer than 3 approved reviews total" (the caller's hide-section
// threshold) is just `results.length < 3`, no separate count query needed.
export async function getFeaturedReviews(limit = 8): Promise<FeaturedReview[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("id, customer_name, rating, comment, created_at, products(name, slug)")
    .eq("approved", true)
    .order("rating", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data ?? [])
    .map((row) => {
      const product = Array.isArray(row.products) ? row.products[0] : row.products;
      if (!product) return null;
      return {
        id: row.id,
        customerName: row.customer_name,
        rating: row.rating,
        comment: row.comment,
        createdAt: row.created_at,
        productName: product.name,
        productSlug: product.slug,
      };
    })
    .filter((review): review is FeaturedReview => review !== null);
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
      `id, name, slug, description, lace_type, images, active, is_best_seller, why_choose, why_not_choose, created_at, product_variants(${VARIANT_WITH_COLORS_FIELDS})`,
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export type ProductRecommendationDisplay = {
  id: string;
  reason_label: string | null;
  recommended_product: Pick<Product, "id" | "name" | "slug" | "images"> | null;
};

// Public-facing: embeds the recommended product's name/slug/images for
// rendering an actual card (not just a text link). The FK hint
// disambiguates which of the two foreign keys to products (product_id vs
// recommended_product_id) to embed.
export async function getProductRecommendations(
  productId: string,
): Promise<ProductRecommendationDisplay[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product_recommendations")
    .select(
      "id, reason_label, recommended_product:products!product_recommendations_recommended_product_id_fkey(id, name, slug, images)",
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

export type ProductVariantOption = {
  id: string;
  name: string;
  product_variants: (Pick<ProductVariant, "id" | "size_label" | "price"> & {
    product_variant_colors: Pick<ProductVariantColor, "id" | "color_name">[];
  })[];
};

// Full size/color tree per product, for the admin bundle item picker's
// cascading Product -> Size -> Color dropdowns. Lean on purpose (no stock,
// sku, images) — the picker only needs enough to identify an exact variant
// and show its price for the "original combined price" preview.
export async function getProductsWithVariantsForAdmin(): Promise<ProductVariantOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, name, product_variants(id, size_label, price, product_variant_colors(id, color_name))",
    )
    .order("name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export type ProductCategoryCard = {
  laceType: string;
  representativeImage: string | null;
};

// One card per distinct lace_type among active products, for the
// homepage's "Shop by Category" section — each card's image is the most
// recently created active product in that category (query is already
// newest-first, so the first row seen per lace_type wins).
export async function getProductCategoriesForShop(): Promise<ProductCategoryCard[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("lace_type, images")
    .eq("active", true)
    .not("lace_type", "is", null)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const seen = new Map<string, string | null>();
  for (const row of data ?? []) {
    if (!row.lace_type || seen.has(row.lace_type)) continue;
    seen.set(row.lace_type, row.images?.[0] ?? null);
  }

  return Array.from(seen.entries()).map(([laceType, representativeImage]) => ({
    laceType,
    representativeImage,
  }));
}

// Distinct lace_type values across all products — populates the "category"
// scope dropdown when setting up a category-scoped promotion. lace_type is
// free text (no separate categories table), so this is just the unique set
// of whatever values are actually in use.
export async function getDistinctLaceTypes(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("lace_type")
    .not("lace_type", "is", null);

  if (error) throw error;

  const unique = new Set(
    (data ?? [])
      .map((row) => row.lace_type)
      .filter((value): value is string => Boolean(value)),
  );
  return Array.from(unique).sort();
}
