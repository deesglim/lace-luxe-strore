import ReviewSubmissionForm from "@/components/ReviewSubmissionForm";
import type { Review } from "@/types";

export default function ReviewsSection({
  reviews,
  productId,
}: {
  reviews: Review[];
  productId: string;
}) {
  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <span className="font-label text-xs font-medium uppercase tracking-label text-bronze">
          Customer Voices
        </span>
        <h2 className="font-heading text-2xl font-medium text-espresso">Reviews</h2>
      </div>

      {reviews.length === 0 ? (
        <p className="rounded-brand border border-blush bg-blush/20 px-4 py-3 font-sans text-sm text-charcoal/70">
          Be the first to review this product.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {reviews.map((review) => (
            <li
              key={review.id}
              className="flex flex-col gap-2 rounded-brand border border-blush bg-ivory p-5 shadow-[0_8px_20px_rgba(58,47,42,0.05)]"
            >
              <div className="flex items-center gap-3">
                <span
                  aria-hidden
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bronze font-heading text-sm font-medium text-ivory"
                >
                  {review.customer_name.trim().charAt(0).toUpperCase() || "?"}
                </span>
                <div className="flex flex-col">
                  <span className="font-sans text-sm font-medium text-espresso">
                    {review.customer_name}
                  </span>
                  <span aria-hidden className="font-sans text-xs text-bronze">
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </span>
                  <span className="sr-only">{review.rating} out of 5 stars</span>
                </div>
              </div>
              {review.comment && (
                <p className="font-sans text-sm text-charcoal/80">{review.comment}</p>
              )}
            </li>
          ))}
        </ul>
      )}

      <ReviewSubmissionForm productId={productId} />
    </section>
  );
}
