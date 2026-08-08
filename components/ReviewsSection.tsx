import type { Review } from "@/types";

export default function ReviewsSection({ reviews }: { reviews: Review[] }) {
  return (
    <section className="flex flex-col gap-8">
      <h2 className="font-heading text-2xl text-espresso">Reviews</h2>

      {reviews.length === 0 ? (
        <p className="font-sans text-sm text-charcoal/70">
          Be the first to review this product.
        </p>
      ) : (
        <ul className="flex flex-col gap-8">
          {reviews.map((review) => (
            <li key={review.id} className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span aria-hidden className="font-sans text-bronze">
                  {"★".repeat(review.rating)}
                  {"☆".repeat(5 - review.rating)}
                </span>
                <span className="sr-only">{review.rating} out of 5 stars</span>
                <span className="font-sans text-sm font-medium text-espresso">
                  {review.customer_name}
                </span>
              </div>
              {review.comment && (
                <p className="font-sans text-sm text-charcoal/80">
                  {review.comment}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
