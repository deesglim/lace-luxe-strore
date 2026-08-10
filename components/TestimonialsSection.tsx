import Link from "next/link";
import HorizontalScrollRow from "@/components/HorizontalScrollRow";
import type { FeaturedReview } from "@/lib/products";

// Same unicode-star convention as StarRatingSummary, for consistency.
function Stars({ rating }: { rating: number }) {
  return (
    <span aria-hidden className="text-bronze">
      {"★".repeat(rating)}
      {"☆".repeat(5 - rating)}
    </span>
  );
}

export default function TestimonialsSection({
  reviews,
}: {
  reviews: FeaturedReview[];
}) {
  // Sparse testimonials read as thin rather than trustworthy — hide the
  // whole section until there's a real sample to show.
  if (reviews.length < 3) return null;

  return (
    <section className="border-t border-blush py-section md:py-section-md lg:py-section-lg">
      <h2 className="mb-10 text-center font-heading text-2xl text-espresso sm:text-3xl">
        What Our Customers Say
      </h2>
      <HorizontalScrollRow>
        {reviews.map((review) => (
          <div
            key={review.id}
            className="flex h-[240px] w-[260px] shrink-0 snap-start flex-col gap-3 rounded-md border border-blush bg-ivory p-card shadow-sm"
          >
            <Stars rating={review.rating} />
            {review.comment && (
              <p className="line-clamp-4 font-sans text-sm leading-relaxed text-charcoal/80">
                &ldquo;{review.comment}&rdquo;
              </p>
            )}
            <div className="mt-auto flex flex-col gap-0.5 pt-2">
              <p className="font-sans text-sm text-espresso">{review.customerName}</p>
              <Link
                href={`/shop/${review.productSlug}`}
                className="font-sans text-xs text-bronze underline underline-offset-4"
              >
                {review.productName}
              </Link>
            </div>
          </div>
        ))}
      </HorizontalScrollRow>
    </section>
  );
}
