"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import StarRatingSummary from "@/components/StarRatingSummary";
import { formatNaira } from "@/lib/format";
import type { ProductVariant, ProductVariantColor, Review } from "@/types";

type ColorDetail = Pick<ProductVariantColor, "id" | "color_name" | "stock_quantity">;
type VariantDetail = Pick<
  ProductVariant,
  "id" | "size_label" | "price" | "compare_at_price" | "stock_quantity" | "sku"
> & {
  product_variant_colors: ColorDetail[];
};

export default function ProductPurchaseFlow({
  variants,
  reviews,
  images,
  productName,
  productId,
  productSlug,
  laceType,
  description,
}: {
  variants: VariantDetail[];
  reviews: Review[];
  images: string[];
  productName: string;
  productId: string;
  productSlug: string;
  laceType: string | null;
  description: string | null;
}) {
  const router = useRouter();
  const { addItem } = useCart();
  const [selectedVariantId, setSelectedVariantId] = useState(variants[0]?.id);
  const selectedVariant =
    variants.find((variant) => variant.id === selectedVariantId) ?? variants[0];

  const colors = selectedVariant?.product_variant_colors ?? [];
  const [selectedColorId, setSelectedColorId] = useState(colors[0]?.id);

  // Re-default to the first color whenever the size changes, so switching
  // sizes never leaves a color selected that doesn't belong to it. Adjusting
  // state during render (React's documented pattern for this) instead of in
  // an effect avoids an extra render pass.
  const [colorsResetForVariantId, setColorsResetForVariantId] = useState(
    selectedVariant?.id,
  );
  if (selectedVariant?.id !== colorsResetForVariantId) {
    setColorsResetForVariantId(selectedVariant?.id);
    setSelectedColorId(colors[0]?.id);
  }

  const [quantity, setQuantity] = useState(1);

  if (!selectedVariant) {
    return (
      <p className="font-sans text-sm text-charcoal/70">
        Sizes for this piece will be available soon.
      </p>
    );
  }

  const selectedColor = colors.find((color) => color.id === selectedColorId);
  const stockQuantity =
    colors.length > 0
      ? (selectedColor?.stock_quantity ?? 0)
      : selectedVariant.stock_quantity;
  const inStock = stockQuantity > 0;

  function handleAddToCart() {
    addItem(
      {
        productId,
        productSlug,
        variantId: selectedVariant.id,
        colorId: selectedColor?.id ?? null,
        sizeLabel: selectedVariant.size_label,
        colorName: selectedColor?.color_name ?? null,
        name: productName,
        image: images[0] ?? null,
        price: selectedVariant.price,
        quantity,
        laceType,
      },
      stockQuantity,
    );
    setQuantity(1);
  }

  function handleBuyNow() {
    handleAddToCart();
    router.push("/cart");
  }

  const onSale =
    selectedVariant.compare_at_price != null &&
    selectedVariant.compare_at_price > selectedVariant.price;

  return (
    <div className="flex flex-col gap-6">
      {/* 3. Product title */}
      <h1 className="font-heading text-product-title font-medium leading-tight text-espresso md:text-product-title-md lg:text-product-title-lg">
        {productName}
      </h1>

      <StarRatingSummary reviews={reviews} />

      {/* 4. Price */}
      {onSale ? (
        <p className="flex items-baseline gap-3">
          <span className="font-sans text-lg text-charcoal/40 line-through">
            {formatNaira(selectedVariant.compare_at_price!)}
          </span>
          <span className="font-sans text-price font-bold text-bronze md:text-price-md lg:text-price-lg">
            {formatNaira(selectedVariant.price)}
          </span>
        </p>
      ) : (
        <p className="font-sans text-price font-bold text-espresso md:text-price-md lg:text-price-lg">
          {formatNaira(selectedVariant.price)}
        </p>
      )}

      {/* 5. Stock status */}
      <div className="flex items-center gap-2 font-sans text-sm">
        <span
          aria-hidden
          className={`h-2 w-2 rounded-full ${inStock ? "bg-green-700" : "bg-red-700"}`}
        />
        <span className={inStock ? "text-charcoal/70" : "text-bronze"}>
          {inStock ? `${stockQuantity} in stock` : "Out of stock"}
        </span>
      </div>

      {/* 6. Product description */}
      {description && (
        <p className="font-sans text-body font-normal leading-body text-charcoal/80">
          {description}
        </p>
      )}

      {/* 6. Lace specifications */}
      {laceType && (
        <p className="font-label text-xs font-medium uppercase tracking-label text-bronze">
          Lace Type:{" "}
          <span className="font-sans normal-case tracking-normal text-charcoal/70">
            {laceType}
          </span>
        </p>
      )}

      {/* 7. Product options (color/size) */}
      {colors.length > 0 && (
        <div>
          <p className="mb-2 font-label text-xs font-medium uppercase tracking-label text-bronze">
            Color
          </p>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color.id}
                type="button"
                onClick={() => setSelectedColorId(color.id)}
                className={`rounded-md border px-4 py-2 font-sans text-sm transition ${
                  color.id === selectedColorId
                    ? "border-espresso bg-espresso text-ivory"
                    : "border-charcoal/30 text-charcoal hover:border-bronze hover:text-bronze"
                }`}
              >
                {color.color_name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="mb-2 font-label text-xs font-medium uppercase tracking-label text-bronze">
          Size
        </p>
        <div className="flex flex-wrap gap-2">
          {variants.map((variant) => (
            <button
              key={variant.id}
              type="button"
              onClick={() => setSelectedVariantId(variant.id)}
              className={`rounded-md border px-4 py-2 font-sans text-sm transition ${
                variant.id === selectedVariant.id
                  ? "border-espresso bg-espresso text-ivory"
                  : "border-charcoal/30 text-charcoal hover:border-bronze hover:text-bronze"
              }`}
            >
              {variant.size_label}
            </button>
          ))}
        </div>
        <Link
          href="/size-guide"
          className="mt-2 inline-block font-sans text-xs text-bronze underline underline-offset-4"
        >
          View Size Guide
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setQuantity((qty) => Math.max(1, qty - 1))}
          className="h-10 w-10 rounded-md border border-charcoal/20 font-sans text-sm text-charcoal transition hover:border-bronze hover:text-bronze"
          aria-label="Decrease quantity"
        >
          −
        </button>
        <span className="w-6 text-center font-sans text-sm text-charcoal">
          {quantity}
        </span>
        <button
          type="button"
          onClick={() =>
            setQuantity((qty) => Math.min(Math.max(stockQuantity, 1), qty + 1))
          }
          className="h-10 w-10 rounded-md border border-charcoal/20 font-sans text-sm text-charcoal transition hover:border-bronze hover:text-bronze"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>

      {/* 8 & 9. Add to Cart / Buy Now */}
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!inStock}
          className={`flex h-[60px] w-full items-center justify-center rounded-button font-sans text-sm font-semibold uppercase tracking-brand transition ${
            inStock
              ? "bg-espresso text-ivory hover:bg-espresso/90"
              : "cursor-not-allowed border border-charcoal/20 bg-charcoal/5 text-charcoal/40"
          }`}
        >
          ADD TO CART
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={!inStock}
          className={`flex h-[60px] w-full items-center justify-center rounded-button font-sans text-sm font-semibold uppercase tracking-brand transition ${
            inStock
              ? "bg-bronze text-white hover:bg-bronze/90"
              : "cursor-not-allowed border border-charcoal/20 bg-charcoal/5 text-charcoal/40"
          }`}
        >
          BUY NOW
        </button>
      </div>

      <p className="font-sans text-xs text-charcoal/60">
        Selling out weekly — restock before you run out!
      </p>
    </div>
  );
}
