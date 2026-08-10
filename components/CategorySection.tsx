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
      <h2 className="mx-auto mb-10 w-full max-w-content px-6 text-left font-heading text-2xl font-medium text-espresso sm:text-3xl lg:px-[60px]">
        Shop by Category
      </h2>
      <HorizontalScrollRow>
        {categories.map((category) => (
          <div key={category.laceType} className="shrink-0 snap-start">
            <Link
              href={`/shop?type=${encodeURIComponent(category.laceType)}`}
              className="group relative flex h-[320px] w-[200px] overflow-hidden rounded-brand border border-espresso/[0.08] bg-blush shadow-[0_8px_25px_rgba(0,0,0,0.04)] transition"
            >
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

              {/* Gradient overlay + overlaid label — Shop by Category only,
                  per the request to drop the separate info box beneath the
                  image that every other product card still uses. */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-espresso/85 to-transparent" />
              <h3 className="absolute inset-x-0 bottom-0 line-clamp-1 px-3 py-3 font-sans text-[18px] font-semibold text-ivory [text-shadow:0_1px_2px_rgba(0,0,0,0.5)] lg:text-[20px]">
                {category.laceType}
              </h3>
            </Link>
          </div>
        ))}
      </HorizontalScrollRow>
    </section>
  );
}
