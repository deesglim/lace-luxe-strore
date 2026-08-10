import PagePlaceholder from "@/components/PagePlaceholder";
import TestimonialsSection from "@/components/TestimonialsSection";
import { getFeaturedReviews, type FeaturedReview } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function OurStoryPage() {
  let reviews: FeaturedReview[] = [];
  try {
    reviews = await getFeaturedReviews();
  } catch {
    reviews = [];
  }

  return (
    <>
      <PagePlaceholder
        title="Our Story"
        eyebrow="The House of Lace Luxe"
        italicWord="Story"
      />
      <TestimonialsSection reviews={reviews} />
    </>
  );
}
