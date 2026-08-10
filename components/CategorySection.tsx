import Link from "next/link";
import type { ProductCategoryCard } from "@/lib/products";

export default function CategorySection({
  categories,
}: {
  categories: ProductCategoryCard[];
}) {
  if (categories.length === 0) return null;

  return (
    <section className="border-t border-blush py-section md:py-section-md lg:py-section-lg">
      <h2 className="mb-10 text-center font-heading text-2xl text-espresso sm:text-3xl">
        Shop by Category
      </h2>
      <div className="mx-auto grid w-full max-w-content grid-cols-2 gap-5 px-6 sm:px-12 lg:grid-cols-4">
        {categories.map((category) => (
          <Link
            key={category.laceType}
            href={`/shop?type=${encodeURIComponent(category.laceType)}`}
            className="group flex flex-col overflow-hidden rounded-brand border border-border bg-ivory shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="aspect-[4/5] w-full shrink-0 overflow-hidden bg-blush">
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
            <div className="flex flex-1 items-center justify-center p-card text-center">
              <h3 className="line-clamp-1 font-heading text-lg text-espresso">
                {category.laceType}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
