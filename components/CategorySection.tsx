import Link from "next/link";
import HorizontalScrollRow from "@/components/HorizontalScrollRow";
import type { ProductCategoryCard } from "@/lib/products";

export default function CategorySection({
  categories,
}: {
  categories: ProductCategoryCard[];
}) {
  if (categories.length === 0) return null;

  return (
    <section className="border-t border-blush py-16">
      <h2 className="mb-10 text-center font-heading text-2xl text-espresso sm:text-3xl">
        Shop by Category
      </h2>
      <HorizontalScrollRow>
        {categories.map((category) => (
          <Link
            key={category.laceType}
            href={`/shop?type=${encodeURIComponent(category.laceType)}`}
            className="group flex h-[280px] w-[220px] shrink-0 snap-start flex-col overflow-hidden rounded-md border border-blush bg-ivory shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="h-40 w-full shrink-0 overflow-hidden bg-blush">
              {category.representativeImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={category.representativeImage}
                  alt={category.laceType}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="font-heading text-2xl italic text-bronze">LL</span>
                </div>
              )}
            </div>
            <div className="flex flex-1 items-center justify-center px-3 text-center">
              <h3 className="line-clamp-1 font-heading text-base text-espresso sm:text-lg">
                {category.laceType}
              </h3>
            </div>
          </Link>
        ))}
      </HorizontalScrollRow>
    </section>
  );
}
