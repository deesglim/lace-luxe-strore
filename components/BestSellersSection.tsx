import HorizontalScrollRow from "@/components/HorizontalScrollRow";
import ProductCard from "@/components/ProductCard";
import type { ProductSummary } from "@/lib/products";

// Shared between the shop page and the homepage — hides itself entirely
// when no product is marked as a best seller.
export default function BestSellersSection({ products }: { products: ProductSummary[] }) {
  const bestSellers = products.filter((product) => product.is_best_seller);
  if (bestSellers.length === 0) return null;

  return (
    <section className="border-t border-blush py-section md:py-section-md lg:py-section-lg">
      <h2 className="mb-10 text-center font-heading text-2xl text-espresso sm:text-3xl">
        Best Sellers
      </h2>
      <HorizontalScrollRow>
        {bestSellers.map((product) => (
          <div
            key={product.id}
            className="h-[320px] w-[200px] shrink-0 snap-start"
          >
            <ProductCard product={product} className="h-full" imageClassName="h-40 w-full" />
          </div>
        ))}
      </HorizontalScrollRow>
    </section>
  );
}
