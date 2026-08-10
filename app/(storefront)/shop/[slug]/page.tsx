import Link from "next/link";
import ProductGallery from "@/components/ProductGallery";
import ProductPurchaseFlow from "@/components/ProductPurchaseFlow";
import ProductRecommendations from "@/components/ProductRecommendations";
import TrustBadges from "@/components/TrustBadges";
import { WhyChooseList, WhyNotChooseList } from "@/components/ProductWhyLists";
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
    <main className="flex min-h-screen flex-1 flex-col bg-ivory py-20">
      {/*
        Mobile: single column, DOM order = required order (1. image,
        2. thumbnails come from ProductGallery; 3-10 come from
        ProductPurchaseFlow, which renders title/price/stock/description/
        options/buttons/details internally in that exact sequence).
        Desktop: grid splits into a 60/40 (3fr/2fr) two-column layout —
        gallery only needs `lg:col-start-1`, everything else only needs
        `lg:col-start-2`; no per-item row placement needed since each
        column's content is already one contiguous DOM block.
      */}
      <div className="mx-auto w-full max-w-content px-6 sm:px-12">
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

      <TrustBadges />

      {/* Why-choose/recommendations kept at their original narrow reading
          width — unchanged in appearance, just repositioned below the new
          two-column purchase area instead of the old single column. */}
      <div className="mx-auto w-full max-w-2xl px-6 py-section md:py-section-md lg:py-section-lg">
        <div className="flex flex-col gap-10">
          <WhyChooseList points={product.why_choose} />
          <WhyNotChooseList points={product.why_not_choose} />
          <ProductRecommendations recommendations={recommendations} />
        </div>
      </div>

      <div
        id="reviews"
        className="mx-auto w-full max-w-2xl border-t border-blush px-6 pt-12"
      >
        <div className="flex flex-col gap-10">
          <ReviewsSection reviews={reviews} productId={product.id} />
        </div>
      </div>
    </main>
  );
}
