import Link from "next/link";
import type { ProductSummary } from "@/lib/products";
import { formatNaira } from "@/lib/format";

// The single shared product-card style used everywhere a product shows up
// as an image+name+price tile (homepage Best Sellers, Shop page Lace
// Collection, Shop page Best Sellers). Fixed size so every card is
// identical regardless of which row it's in — the image gets whatever
// height is left after the compact text block, so the photo dominates the
// card rather than the text.
export default function ProductCard({ product }: { product: ProductSummary }) {
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
      className="group flex h-[320px] w-[200px] flex-col overflow-hidden rounded-brand border border-espresso/[0.08] bg-ivory shadow-[0_8px_25px_rgba(0,0,0,0.04)] transition"
    >
      <div className="w-full flex-1 overflow-hidden bg-blush">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-heading text-2xl italic text-bronze">LL</span>
          </div>
        )}
      </div>

      <div className="flex shrink-0 flex-col gap-0.5 bg-ivory px-3 py-2.5">
        {product.lace_type && (
          <p className="line-clamp-1 font-label text-[11px] font-medium uppercase tracking-label text-bronze">
            {product.lace_type}
          </p>
        )}
        <h3 className="line-clamp-1 font-sans text-[18px] font-semibold text-charcoal lg:text-[20px]">
          {product.name}
        </h3>
        {onSale && cheapestVariant ? (
          <p className="flex flex-wrap items-baseline gap-1.5">
            <span className="font-sans text-xs text-charcoal/40 line-through">
              {formatNaira(cheapestVariant.compare_at_price!)}
            </span>
            <span className="font-sans text-[14px] font-semibold text-bronze lg:text-[16px]">
              {formatNaira(fromPrice!)}
            </span>
          </p>
        ) : (
          <p className="font-sans text-[14px] font-semibold text-charcoal lg:text-[16px]">
            {fromPrice !== null ? formatNaira(fromPrice) : "Price unavailable"}
          </p>
        )}
      </div>
    </Link>
  );
}
