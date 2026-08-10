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
    <section className="border-t border-blush py-section">
      <h2 className="mb-10 text-center font-heading font-medium text-2xl text-espresso sm:text-3xl">
        Shop by Category
      </h2>
      <HorizontalScrollRow>
        {categories.map((category) => (
          <div key={category.laceType} className="shrink-0 snap-start">
            <Link
              href={`/shop?type=${encodeURIComponent(category.laceType)}`}
              className="group flex h-[320px] w-[200px] flex-col overflow-hidden rounded-brand border border-espresso/[0.08] bg-ivory shadow-[0_8px_25px_rgba(0,0,0,0.04)] transition"
            >
              <div className="w-full flex-1 overflow-hidden bg-blush">
                {category.representativeImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={category.representativeImage}
                    alt={category.laceType}
                    className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="font-heading text-2xl italic text-bronze">LL</span>
                  </div>
                )}
              </div>
              <div className="flex shrink-0 flex-col justify-center gap-0.5 px-3 py-2.5">
                <h3 className="line-clamp-1 font-heading text-[18px] font-medium text-espresso lg:text-[20px]">
                  {category.laceType}
                </h3>
              </div>
            </Link>
          </div>
        ))}
      </HorizontalScrollRow>
    </section>
  );
}
