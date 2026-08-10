import HorizontalScrollRow from "@/components/HorizontalScrollRow";
import ProductCard from "@/components/ProductCard";
import type { ProductSummary } from "@/lib/products";

// Shared between the shop page and the homepage — hides itself entirely
// when no product is marked as a best seller. The homepage keeps the
// original horizontal-scroll row; the Shop page instead wraps into a
// 2/3/4-column grid, so layout is a prop rather than baked in.
export default function BestSellersSection({
  products,
  layout = "row",
}: {
  products: ProductSummary[];
  layout?: "row" | "grid";
}) {
  const bestSellers = products.filter((product) => product.is_best_seller);
  if (bestSellers.length === 0) return null;

  return (
    <section className="border-t border-blush py-section">
      <h2 className="mb-10 text-center font-heading font-medium text-2xl text-espresso sm:text-3xl">
        Best Sellers
      </h2>
      {layout === "grid" ? (
        <div className="mx-auto grid w-full max-w-content grid-cols-2 justify-items-center gap-x-5 gap-y-8 px-6 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-8 lg:px-[60px]">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <HorizontalScrollRow>
          {bestSellers.map((product) => (
            <div key={product.id} className="shrink-0 snap-start">
              <ProductCard product={product} />
            </div>
          ))}
        </HorizontalScrollRow>
      )}
    </section>
  );
}
