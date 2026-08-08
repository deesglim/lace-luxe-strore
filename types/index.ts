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
  why_choose: string[];
  why_not_choose: string[];
  created_at: string;
};

export type ProductVariant = {
  id: string;
  product_id: string;
  size_label: string;
  price: number;
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
  wholesale_status: "none" | "pending" | "approved";
  wholesale_discount_percent: number;
  is_admin: boolean;
  created_at: string;
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
};
