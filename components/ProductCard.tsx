import Link from "next/link";
import type { ProductSummary } from "@/lib/products";
import { formatNaira } from "@/lib/format";

// The single shared product-card style used everywhere a product shows up
// as an image+name+price tile (homepage Best Sellers, Shop page Lace
// Collection, Shop page Best Sellers). Fixed 200px width by default — right
// for the horizontal-scroll rows this was designed for, where each card
// needs a real, unchanging size. Grid callers (Shop page, Best Sellers
// grid layout) pass `fluid` instead: at the 2-column mobile breakpoint the
// grid track itself is narrower than 200px, so a fixed-width card there
// overflows its track and collides with its neighbor — `fluid` lets the
// card fill whatever width its track actually has below `sm`, then locks
// back to the normal 200px from `sm` up, where every track is already
// wide enough.
export default function ProductCard({
  product,
  fluid = false,
}: {
  product: ProductSummary;
  fluid?: boolean;
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
      className={`group flex h-[320px] flex-col overflow-hidden rounded-brand border border-espresso/[0.08] bg-ivory shadow-[0_8px_25px_rgba(0,0,0,0.04)] transition ${
        fluid ? "w-full sm:w-[200px]" : "w-[200px]"
      }`}
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
          <p className="flex flex-col gap-0.5">
            <span className="truncate font-sans text-xs text-charcoal/40 line-through">
              {formatNaira(cheapestVariant.compare_at_price!)}
            </span>
            <span className="truncate font-sans text-[14px] font-semibold text-bronze lg:text-[16px]">
              {formatNaira(fromPrice!)}
            </span>
          </p>
        ) : (
          <p className="truncate font-sans text-[14px] font-semibold text-charcoal lg:text-[16px]">
            {fromPrice !== null ? formatNaira(fromPrice) : "Price unavailable"}
          </p>
        )}
      </div>
    </Link>
  );
}
