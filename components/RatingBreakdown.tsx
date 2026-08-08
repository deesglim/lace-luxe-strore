import type { Review } from "@/types";

const STAR_LEVELS = [5, 4, 3, 2, 1] as const;

export default function RatingBreakdown({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return (
      <p className="font-sans text-sm text-charcoal/70">No ratings yet.</p>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {STAR_LEVELS.map((star) => {
        const count = reviews.filter((review) => review.rating === star).length;
        return (
          <p key={star} className="font-sans text-sm text-charcoal/70">
            {star} star{star === 1 ? "" : "s"} ({count})
          </p>
        );
      })}
    </div>
  );
}
