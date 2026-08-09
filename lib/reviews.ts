import { createClient } from "@/lib/supabase/server";

export type AdminReview = {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  customerName: string;
  rating: number;
  comment: string | null;
  approved: boolean;
  createdAt: string;
};

// Every review regardless of approval status — the customer-facing
// getApprovedReviews/getFeaturedReviews queries in lib/products.ts stay
// scoped to approved=true only, this is the admin-only "see everything" view.
export async function getAllReviewsForAdmin(): Promise<AdminReview[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select(
      "id, product_id, customer_name, rating, comment, approved, created_at, products(name, slug)",
    )
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? [])
    .map((row) => {
      const product = Array.isArray(row.products) ? row.products[0] : row.products;
      if (!product) return null;
      return {
        id: row.id,
        productId: row.product_id,
        productName: product.name,
        productSlug: product.slug,
        customerName: row.customer_name,
        rating: row.rating,
        comment: row.comment,
        approved: row.approved,
        createdAt: row.created_at,
      };
    })
    .filter((review): review is AdminReview => review !== null);
}
