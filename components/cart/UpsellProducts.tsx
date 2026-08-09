"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { formatNaira } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";

// Fetch a batch of the most recent active products, then filter out ones
// already in the cart client-side — the cart lives in localStorage, so
// there's no server-side query that already knows its contents. Fine while
// the catalog is small (same tradeoff ProductCard's plain <img> comment
// notes elsewhere).
const FETCH_LIMIT = 12;
const DISPLAY_LIMIT = 4;

type UpsellProduct = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  fromPrice: number | null;
};

export default function UpsellProducts({
  compact = false,
}: {
  compact?: boolean;
}) {
  const { items } = useCart();
  const [products, setProducts] = useState<UpsellProduct[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    supabase
      .from("products")
      .select("id, name, slug, images, product_variants(price)")
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(FETCH_LIMIT)
      .then(({ data }) => {
        if (cancelled || !data) return;
        setProducts(
          data.map((product) => {
            const prices = (product.product_variants ?? []).map(
              (variant: { price: number }) => variant.price,
            );
            return {
              id: product.id,
              name: product.name,
              slug: product.slug,
              image: product.images?.[0] ?? null,
              fromPrice: prices.length > 0 ? Math.min(...prices) : null,
            };
          }),
        );
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!products) return null;

  const cartProductIds = new Set(items.map((item) => item.productId));
  const suggestions = products
    .filter((product) => !cartProductIds.has(product.id))
    .slice(0, DISPLAY_LIMIT);

  if (suggestions.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-heading text-lg text-espresso">You May Also Like</h3>
      <div
        className={`grid gap-3 ${compact ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4"}`}
      >
        {suggestions.map((product) => (
          <Link
            key={product.id}
            href={`/shop/${product.slug}`}
            className="group flex flex-col gap-1.5"
          >
            <div className="aspect-square w-full overflow-hidden rounded-md bg-blush">
              {product.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="font-heading text-sm italic text-bronze">
                    LL
                  </span>
                </div>
              )}
            </div>
            <span className="truncate font-sans text-xs text-charcoal">
              {product.name}
            </span>
            <span className="font-sans text-xs text-charcoal/60">
              {product.fromPrice !== null
                ? `from ${formatNaira(product.fromPrice)}`
                : ""}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
