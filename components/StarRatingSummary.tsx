import Link from "next/link";
import type { Review } from "@/types";

export default function StarRatingSummary({ reviews }: { reviews: Review[] }) {
  const count = reviews.length;
  const average =
    count > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / count : 0;
  const filledStars = Math.round(average);

  return (
    <Link
      href="#reviews"
      className="flex w-fit items-center gap-2 font-sans text-sm text-charcoal/70 transition hover:text-espresso"
    >
      <span aria-hidden className="text-bronze">
        {"★".repeat(filledStars)}
        {"☆".repeat(5 - filledStars)}
      </span>
      <span>
        ({count} review{count === 1 ? "" : "s"})
      </span>
    </Link>
  );
}
