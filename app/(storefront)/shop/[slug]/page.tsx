import Link from "next/link";
import ProductPurchaseFlow from "@/components/ProductPurchaseFlow";
import ProductRecommendations from "@/components/ProductRecommendations";
import { WhyChooseList, WhyNotChooseList } from "@/components/ProductWhyLists";
import RatingBreakdown from "@/components/RatingBreakdown";
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
    <main className="flex min-h-screen flex-1 flex-col bg-ivory px-6 py-20">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
        <div>
          {product.lace_type && (
            <p className="font-sans text-xs uppercase tracking-[0.3em] text-bronze">
              {product.lace_type}
            </p>
          )}
          <h1 className="mt-2 font-heading text-3xl font-medium text-espresso sm:text-4xl">
            {product.name}
          </h1>
        </div>

        {product.description && (
          <p className="font-sans text-sm leading-relaxed text-charcoal/80">
            {product.description}
          </p>
        )}

        <ProductPurchaseFlow
          variants={product.product_variants}
          reviews={reviews}
          images={product.images}
          productName={product.name}
          productId={product.id}
          productSlug={product.slug}
          laceType={product.lace_type}
        />

        <WhyChooseList points={product.why_choose} />
        <WhyNotChooseList points={product.why_not_choose} />
        <ProductRecommendations recommendations={recommendations} />
      </div>

      <div
        id="reviews"
        className="mx-auto mt-16 w-full max-w-2xl border-t border-blush pt-12"
      >
        <div className="flex flex-col gap-10">
          <RatingBreakdown reviews={reviews} />
          <ReviewsSection reviews={reviews} />
        </div>
      </div>
    </main>
  );
}
