import ReviewsManager from "@/components/admin/ReviewsManager";
import { getProductOptionsForAdmin } from "@/lib/products";
import { getAllReviewsForAdmin } from "@/lib/reviews";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const [reviews, productOptions] = await Promise.all([
    getAllReviewsForAdmin(),
    getProductOptionsForAdmin(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl text-espresso">Reviews</h1>
      <ReviewsManager initialReviews={reviews} productOptions={productOptions} />
    </div>
  );
}
