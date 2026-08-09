"use client";

import { useCart } from "@/components/cart/CartProvider";
import type { CartDisplayGroup } from "@/lib/cartGrouping";
import { formatNaira } from "@/lib/format";

export default function BundleCartGroup({
  group,
  compact,
}: {
  group: Extract<CartDisplayGroup, { kind: "bundle" }>;
  compact?: boolean;
}) {
  const { removeBundleGroup } = useCart();

  return (
    <div className="flex gap-3">
      <div
        style={{
          width: compact ? 80 : 96,
          height: compact ? 80 : 96,
        }}
        className="shrink-0 grow-0 basis-auto overflow-hidden rounded-md bg-blush"
      >
        {group.bundleImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={group.bundleImage}
            alt={group.bundleName}
            style={{ width: "100%", height: "100%" }}
            className="block object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-heading text-sm italic text-bronze">LL</span>
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-sans text-sm text-espresso">
              {group.bundleName}
              {group.setCount > 1 ? ` × ${group.setCount}` : ""}
            </p>
            <p className="font-sans text-xs uppercase tracking-[0.1em] text-bronze">
              Bundle
            </p>
          </div>
          <p className="shrink-0 whitespace-nowrap font-sans text-sm text-charcoal">
            {formatNaira(group.totalPrice)}
          </p>
        </div>

        <ul className="flex flex-col gap-0.5">
          {group.items.map((item) => (
            <li key={item.id} className="truncate font-sans text-xs text-charcoal/60">
              {item.name} — {item.sizeLabel}
              {item.colorName ? ` · ${item.colorName}` : ""} × {item.quantity}
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => removeBundleGroup(group.bundleOfferId)}
          className="mt-auto self-start font-sans text-xs text-bronze underline underline-offset-4"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
