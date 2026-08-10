import Link from "next/link";
import type { ProductSummary } from "@/lib/products";
import { formatNaira } from "@/lib/format";

export default function ProductCard({
  product,
  className = "",
  imageClassName = "aspect-[3/4] w-full",
}: {
  product: ProductSummary;
  // Lets callers that place this inside a fixed-height wrapper (e.g. the
  // horizontal scroll rows) pass "h-full" so the card fills it — a no-op
  // for the plain wrapping grid, which doesn't need it.
  className?: string;
  // Default preserves the plain shop-grid card's proportional image.
  // Carousel callers (BestSellersSection) pass a fixed small height instead,
  // since a proportional image inside a fixed-height card eats most of it.
  imageClassName?: string;
}) {
  const cheapestVariant = product.product_variants.reduce<
    (typeof product.product_variants)[number] | null
  >((cheapest, variant) => {
    if (!cheapest || variant.price < cheapest.price) return variant;
    return cheapest;
  }, null);
  const fromPrice = cheapestVariant?.price ?? null;
  const onSale =
    cheapestVariant?.compare_at_price != null &&
    cheapestVariant.compare_at_price > cheapestVariant.price;
  const image = product.images?.[0];

  return (
    <Link
      href={`/shop/${product.slug}`}
      className={`group flex flex-col overflow-hidden rounded-md border border-blush bg-ivory shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${className}`}
    >
      <div className={`shrink-0 overflow-hidden bg-blush ${imageClassName}`}>
        {image ? (
          // Plain <img> for now rather than next/image + remotePatterns;
          // fine while the catalog is small, worth revisiting later.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-heading text-2xl italic text-bronze">LL</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 px-4 py-4 text-center">
        {product.lace_type && (
          <p className="line-clamp-1 font-sans text-xs uppercase tracking-[0.3em] text-bronze">
            {product.lace_type}
          </p>
        )}
        <h3 className="line-clamp-2 min-h-[3.5rem] font-heading text-xl text-espresso">
          {product.name}
        </h3>
        {onSale && cheapestVariant ? (
          <p className="mt-auto flex items-baseline justify-center gap-2 font-sans text-sm">
            <span className="text-charcoal/40 line-through">
              {formatNaira(cheapestVariant.compare_at_price!)}
            </span>
            <span className="font-semibold text-bronze">{formatNaira(fromPrice!)}</span>
          </p>
        ) : (
          <p className="mt-auto font-sans text-sm text-charcoal/70">
            {fromPrice !== null ? `From ${formatNaira(fromPrice)}` : "Price unavailable"}
          </p>
        )}
      </div>
    </Link>
  );
}
