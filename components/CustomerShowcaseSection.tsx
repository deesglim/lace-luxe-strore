import HorizontalScrollRow from "@/components/HorizontalScrollRow";
import ShowcaseCard from "@/components/ShowcaseCard";
import type { ShowcaseItem } from "@/lib/showcase";

export default function CustomerShowcaseSection({ items }: { items: ShowcaseItem[] }) {
  if (items.length === 0) return null;

  return (
    <section className="border-t border-blush py-section">
      <h2 className="mx-auto mb-10 w-full max-w-content px-6 text-left font-heading text-2xl font-medium text-espresso sm:text-3xl lg:px-[60px]">
        Here&apos;s What Our Lace Girlies Are Saying
      </h2>
      <HorizontalScrollRow>
        {items.map((item) => (
          <ShowcaseCard key={item.id} item={item} />
        ))}
      </HorizontalScrollRow>
    </section>
  );
}
