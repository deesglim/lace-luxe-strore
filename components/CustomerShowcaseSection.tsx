import HorizontalScrollRow from "@/components/HorizontalScrollRow";
import ShowcaseCard from "@/components/ShowcaseCard";
import type { ShowcaseItem } from "@/lib/showcase";

export default function CustomerShowcaseSection({ items }: { items: ShowcaseItem[] }) {
  if (items.length === 0) return null;

  return (
    <section className="border-t border-blush py-16">
      <h2 className="mb-10 text-center font-heading text-2xl text-espresso sm:text-3xl">
        Our Customers Are Obsessed
      </h2>
      <HorizontalScrollRow>
        {items.map((item) => (
          <ShowcaseCard key={item.id} item={item} />
        ))}
      </HorizontalScrollRow>
    </section>
  );
}
