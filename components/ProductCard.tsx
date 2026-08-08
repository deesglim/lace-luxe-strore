import Link from "next/link";
import type { ProductSummary } from "@/lib/products";
import { formatNaira } from "@/lib/format";

export default function ProductCard({ product }: { product: ProductSummary }) {
  const prices = product.product_variants.map((variant) => variant.price);
  const fromPrice = prices.length > 0 ? Math.min(...prices) : null;
  const image = product.images?.[0];

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-md border border-blush bg-ivory shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="aspect-[3/4] w-full overflow-hidden bg-blush">
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
      <div className="flex flex-col gap-1 px-4 py-4 text-center">
        <h3 className="font-heading text-xl text-espresso">{product.name}</h3>
        {product.lace_type && (
          <p className="font-sans text-xs uppercase tracking-[0.15em] text-bronze">
            {product.lace_type}
          </p>
        )}
        <p className="font-sans text-sm text-charcoal/70">
          {fromPrice !== null ? `From ${formatNaira(fromPrice)}` : "Price unavailable"}
        </p>
      </div>
    </Link>
  );
}
