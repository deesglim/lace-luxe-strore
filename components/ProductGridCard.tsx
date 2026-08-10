import Link from "next/link";
import type { ProductSummary } from "@/lib/products";
import { formatNaira } from "@/lib/format";

// Minimal luxury-style card for the Shop page's main product grid only —
// deliberately a separate component from ProductCard (shared with Best
// Sellers/carousels elsewhere), which keeps its own bordered-card,
// "From ₦X" styling untouched. This card shows image, category, name, and
// price only — no add-to-cart, rating, or badges, and the border/radius
// sits on the image itself rather than framing the whole card.
export default function ProductGridCard({ product }: { product: ProductSummary }) {
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
    <Link href={`/shop/${product.slug}`} className="group flex flex-col p-card">
      <div className="aspect-[4/5] w-full overflow-hidden rounded-brand border border-border bg-blush">
        {image ? (
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

      <div className="flex flex-col gap-1 pt-4">
        {product.lace_type && (
          <p className="line-clamp-1 font-sans text-[13px] font-medium uppercase tracking-brand text-bronze">
            {product.lace_type}
          </p>
        )}
        <h3 className="line-clamp-2 font-sans text-[18px] font-semibold text-espresso lg:text-[20px]">
          {product.name}
        </h3>
        {onSale && cheapestVariant ? (
          <p className="flex flex-wrap items-baseline gap-2">
            <span className="font-sans text-sm text-charcoal/40 line-through">
              {formatNaira(cheapestVariant.compare_at_price!)}
            </span>
            <span className="font-sans text-[18px] font-bold text-bronze lg:text-[22px]">
              {formatNaira(fromPrice!)}
            </span>
          </p>
        ) : (
          <p className="font-sans text-[18px] font-bold text-espresso lg:text-[22px]">
            {fromPrice !== null ? formatNaira(fromPrice) : "Price unavailable"}
          </p>
        )}
      </div>
    </Link>
  );
}
