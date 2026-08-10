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
  const lowStock = inStock && stockQuantity <= 5;

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
  const savePercent = onSale
    ? Math.round(
        (1 - selectedVariant.price / selectedVariant.compare_at_price!) * 100,
      )
    : 0;

  return (
    <div className="flex flex-col gap-4 rounded-brand border border-espresso/[0.08] bg-ivory p-5 shadow-[0_16px_40px_rgba(58,47,42,0.08)] sm:p-6">
      {/* 3. Product title */}
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-product-title font-medium leading-tight text-espresso md:text-product-title-md lg:text-product-title-lg">
          {productName}
        </h1>
        <div className="flex flex-wrap items-center gap-3">
          <StarRatingSummary reviews={reviews} />
          {lowStock && (
            <span className="rounded-full bg-bronze/15 px-2.5 py-1 font-label text-[10px] font-medium uppercase tracking-label text-bronze">
              Only {stockQuantity} left
            </span>
          )}
        </div>
      </div>

      {/* 4. Price */}
      <div className="flex flex-wrap items-center gap-3 rounded-brand bg-blush/30 px-4 py-2.5">
        {onSale ? (
          <>
            <span className="font-sans text-lg text-charcoal/40 line-through">
              {formatNaira(selectedVariant.compare_at_price!)}
            </span>
            <span className="font-sans text-price font-bold text-bronze md:text-price-md lg:text-price-lg">
              {formatNaira(selectedVariant.price)}
            </span>
            <span className="rounded-full bg-espresso px-2.5 py-1 font-label text-[10px] font-medium uppercase tracking-label text-ivory">
              Save {savePercent}%
            </span>
          </>
        ) : (
          <span className="font-sans text-price font-bold text-espresso md:text-price-md lg:text-price-lg">
            {formatNaira(selectedVariant.price)}
          </span>
        )}
      </div>

      {/* 5. Stock status */}
      <div
        className={`flex w-fit items-center gap-2 rounded-full px-3 py-1.5 font-sans text-xs font-medium ${
          inStock ? "bg-green-700/10 text-green-800" : "bg-charcoal/10 text-charcoal/60"
        }`}
      >
        <span
          aria-hidden
          className={`h-1.5 w-1.5 rounded-full ${inStock ? "bg-green-700" : "bg-charcoal/40"}`}
        />
        {inStock ? `${stockQuantity} in stock` : "Out of stock"}
      </div>

      {/* 6. Product description */}
      {description && (
        <p className="font-sans text-body font-normal leading-body text-charcoal/80">
          {description}
        </p>
      )}

      {/* 6. Lace specifications */}
      {laceType && (
        <span className="w-fit rounded-full border border-bronze/40 bg-bronze/10 px-3 py-1.5 font-label text-xs font-medium uppercase tracking-label text-bronze">
          {laceType}
        </span>
      )}

      {/* 7. Product options (color/size) */}
      {colors.length > 0 && (
        <div>
          <p className="mb-1.5 font-label text-xs font-medium uppercase tracking-label text-bronze">
            Color
          </p>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color.id}
                type="button"
                onClick={() => setSelectedColorId(color.id)}
                className={`rounded-full border px-4 py-2 font-sans text-sm transition ${
                  color.id === selectedColorId
                    ? "border-espresso bg-espresso text-ivory"
                    : "border-blush bg-blush/20 text-charcoal hover:border-bronze hover:text-bronze"
                }`}
              >
                {color.color_name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="mb-1.5 font-label text-xs font-medium uppercase tracking-label text-bronze">
          Size
        </p>
        <div className="flex flex-wrap gap-2">
          {variants.map((variant) => (
            <button
              key={variant.id}
              type="button"
              onClick={() => setSelectedVariantId(variant.id)}
              className={`rounded-full border px-4 py-2 font-sans text-sm transition ${
                variant.id === selectedVariant.id
                  ? "border-espresso bg-espresso text-ivory"
                  : "border-blush bg-blush/20 text-charcoal hover:border-bronze hover:text-bronze"
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
        <span className="font-label text-xs font-medium uppercase tracking-label text-bronze">
          Qty
        </span>
        <div className="flex items-center gap-1 rounded-full bg-blush/30 p-1">
          <button
            type="button"
            onClick={() => setQuantity((qty) => Math.max(1, qty - 1))}
            className="flex h-9 w-9 items-center justify-center rounded-full font-sans text-sm text-charcoal transition hover:bg-ivory hover:text-bronze"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="w-8 text-center font-sans text-sm font-medium text-charcoal">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() =>
              setQuantity((qty) => Math.min(Math.max(stockQuantity, 1), qty + 1))
            }
            className="flex h-9 w-9 items-center justify-center rounded-full font-sans text-sm text-charcoal transition hover:bg-ivory hover:text-bronze"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      {/* 8 & 9. Add to Cart / Buy Now */}
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!inStock}
          className={`flex h-[60px] w-full items-center justify-center rounded-button font-sans text-sm font-semibold uppercase tracking-brand transition ${
            inStock
              ? "bg-espresso text-ivory shadow-[0_8px_20px_rgba(58,47,42,0.3)] hover:-translate-y-0.5 hover:bg-espresso/90 hover:shadow-[0_12px_28px_rgba(58,47,42,0.38)]"
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
              ? "bg-bronze text-white shadow-[0_8px_20px_rgba(156,107,63,0.3)] hover:-translate-y-0.5 hover:bg-bronze/90 hover:shadow-[0_12px_28px_rgba(156,107,63,0.38)]"
              : "cursor-not-allowed border border-charcoal/20 bg-charcoal/5 text-charcoal/40"
          }`}
        >
          BUY NOW
        </button>
      </div>

      <p className="w-fit rounded-full bg-blush/40 px-3 py-1.5 font-sans text-xs text-espresso">
        Selling out weekly — restock before you run out!
      </p>
    </div>
  );
}
