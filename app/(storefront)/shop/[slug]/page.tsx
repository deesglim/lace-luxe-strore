import Link from "next/link";
import ProductDetailsTabs from "@/components/ProductDetailsTabs";
import ProductGallery from "@/components/ProductGallery";
import ProductPurchaseFlow from "@/components/ProductPurchaseFlow";
import ProductRecommendations from "@/components/ProductRecommendations";
import ReviewsSection from "@/components/ReviewsSection";
import {
  getApprovedReviews,
  getProductBySlug,
  getProductRecommendations,
  type ProductRecommendationDisplay,
} from "@/lib/products";
import type { Review } from "@/types";

export const dynamic = "force-dynamic";

function InfoState({
  title,
  message,
  showBackLink,
}: {
  title: string;
  message: string;
  showBackLink?: boolean;
}) {
  return (
    <main className="flex min-h-screen flex-1 flex-col items-center justify-center gap-3 bg-ivory px-6 text-center">
      <h1 className="font-heading text-3xl text-espresso">{title}</h1>
      <p className="max-w-sm font-sans text-sm text-charcoal/70">{message}</p>
      {showBackLink && (
        <Link
          href="/shop"
          className="mt-2 font-sans text-sm uppercase tracking-[0.2em] text-bronze underline underline-offset-4"
        >
          Back to Shop
        </Link>
      )}
    </main>
  );
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await getProductBySlug(slug).catch(() => "error" as const);

  if (product === "error") {
    return (
      <InfoState
        title="Something went wrong"
        message="We couldn't load this product right now. Please try again shortly."
        showBackLink
      />
    );
  }

  if (!product) {
    return (
      <InfoState
        title="Product not found"
        message="This piece may have sold out or moved. Take a look at the full collection instead."
        showBackLink
      />
    );
  }

  let reviews: Review[] = [];
  try {
    reviews = await getApprovedReviews(product.id);
  } catch {
    reviews = [];
  }

  let recommendations: ProductRecommendationDisplay[] = [];
  try {
    recommendations = await getProductRecommendations(product.id);
  } catch {
    recommendations = [];
  }

  return (
    <main className="flex min-h-screen flex-1 flex-col bg-ivory">
      {/*
        Mobile: single column, DOM order = required order (1. image,
        2. thumbnails come from ProductGallery; 3-9 come from
        ProductPurchaseFlow, which renders title/price/description/specs/
        options/buttons internally in that exact sequence; 10-11 are the
        details tabs + related products below, full width on every size).
        Desktop: the split section grids into 60/40 (3fr/2fr) — gallery
        only needs `lg:col-start-1`, the purchase flow only needs
        `lg:col-start-2`; no per-item row placement needed since each
        column's content is already one contiguous DOM block.

        The gallery/buy-box split sits on a soft blush band so the
        purchase-flow card (which styles itself as an elevated ivory
        card) visibly floats above it — the boldest use of blush as a
        real background rather than just a border/accent color.
      */}
      <section className="bg-blush/25 py-10 lg:py-16">
        <div className="mx-auto w-full max-w-content px-6 lg:px-[60px]">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[3fr_2fr] lg:items-start lg:gap-16">
            <div className="lg:col-start-1">
              <ProductGallery images={product.images} productName={product.name} />
            </div>
            <div className="lg:col-start-2">
              <ProductPurchaseFlow
                variants={product.product_variants}
                reviews={reviews}
                images={product.images}
                productName={product.name}
                productId={product.id}
                productSlug={product.slug}
                laceType={product.lace_type}
                description={product.description}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-content px-6 pb-16 lg:px-[60px] lg:pb-20">
        {/* 10. Product details tabs */}
        <ProductDetailsTabs
          whyChoose={product.why_choose}
          whyNotChoose={product.why_not_choose}
        />
      </div>

      {/* 11. Related products — full-bleed espresso band, its own
          container/padding inside ProductRecommendations. */}
      <ProductRecommendations recommendations={recommendations} />

      <section id="reviews" className="bg-blush/15 py-16 lg:py-20">
        <div className="mx-auto w-full max-w-content px-6 lg:px-[60px]">
          <ReviewsSection reviews={reviews} productId={product.id} />
        </div>
      </section>
    </main>
  );
}
