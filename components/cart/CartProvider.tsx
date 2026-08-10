"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartItem } from "@/types";

const STORAGE_KEY = "lace-luxe-cart";
const TOAST_DURATION_MS = 2500;

export type AddToCartInput = Omit<CartItem, "id" | "quantity"> & {
  quantity: number;
};

export type AddBundleItemInput = Omit<AddToCartInput, "bundleOfferId" | "bundleName" | "bundleImage" | "bundlePriceSnapshot"> & {
  // This item's quantity_required for ONE set of the bundle — CartProvider
  // tags every item with this plus the bundle's own metadata so the cart
  // can group and price them without re-fetching bundle data later.
  bundleUnitQuantity: number;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  // False until the initial localStorage read completes. Consumers that
  // redirect away on an empty cart (checkout) must wait for this — items
  // starts as [] on every mount (matching SSR) before hydrating, so
  // treating that as "genuinely empty" would kick out anyone whose cart
  // hadn't loaded yet.
  hydrated: boolean;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addItem: (input: AddToCartInput, availableStock: number) => void;
  addBundleItems: (bundle: {
    bundleOfferId: string;
    bundleName: string;
    bundleImage: string | null;
    bundlePrice: number;
    items: AddBundleItemInput[];
  }) => void;
  updateQuantity: (lineId: string, quantity: number, availableStock?: number) => void;
  removeItem: (lineId: string) => void;
  removeBundleGroup: (bundleOfferId: string) => void;
  clearCart: () => void;
  toastMessage: string | null;
};

const CartContext = createContext<CartContextValue | null>(null);

function lineIdFor(variantId: string, colorId: string | null) {
  return `${variantId}:${colorId ?? "none"}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Close the drawer on route changes, so clicking a plain nav link (or any
  // link that isn't one of the drawer's own) while it's open doesn't leave
  // it hanging over the new page. usePathname changing is an external
  // signal, same shape as the size/color reset elsewhere in this app —
  // adjusting state during render instead of in an effect avoids an extra
  // render pass.
  const pathname = usePathname();
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setIsDrawerOpen(false);
  }

  // Start with an empty cart (matches SSR output), then hydrate from
  // localStorage after mount to avoid a hydration mismatch. localStorage
  // can't be read during render (unavailable on the server, and reading it
  // on the client's first render would desync from the server-rendered
  // HTML), so this genuinely has to happen in an effect.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setItems(JSON.parse(stored));
      }
    } catch {
      // ignore malformed or unavailable storage
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return; // don't clobber storage with [] before hydration runs
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  function addItem(input: AddToCartInput, availableStock: number) {
    const lineId = lineIdFor(input.variantId, input.colorId);
    let message = "Added to cart";

    setItems((current) => {
      const existingIndex = current.findIndex((item) => item.id === lineId);
      const currentQty = existingIndex >= 0 ? current[existingIndex].quantity : 0;
      const desiredQty = currentQty + input.quantity;
      const cappedQty = Math.max(0, Math.min(desiredQty, availableStock));

      if (cappedQty === currentQty) {
        message =
          availableStock <= 0
            ? "That item is out of stock"
            : "You already have the most we have in stock in your cart";
        return current;
      }

      if (cappedQty < desiredQty) {
        message = `Only ${availableStock} in stock — added what we could`;
      }

      if (existingIndex >= 0) {
        const next = [...current];
        next[existingIndex] = { ...next[existingIndex], quantity: cappedQty };
        return next;
      }

      return [...current, { ...input, id: lineId, quantity: cappedQty }];
    });

    setToastMessage(message);
  }

  // Adds every item from a bundle offer in one atomic update (one setItems
  // call, one toast) rather than looping addItem — a bundle is "all these
  // exact items or nothing," and the offer detail page already checked
  // stock for all of them before enabling the button, so there's no
  // per-item capping to do here the way addItem does for a single product.
  // Every item gets tagged with the bundle's metadata so the cart can group
  // and price them as one card later (see lib/cartGrouping.ts).
  function addBundleItems(bundle: {
    bundleOfferId: string;
    bundleName: string;
    bundleImage: string | null;
    bundlePrice: number;
    items: AddBundleItemInput[];
  }) {
    setItems((current) => {
      let next = current;
      for (const { bundleUnitQuantity, ...rawInput } of bundle.items) {
        const input: AddToCartInput = {
          ...rawInput,
          bundleOfferId: bundle.bundleOfferId,
          bundleName: bundle.bundleName,
          bundleImage: bundle.bundleImage,
          bundleUnitQuantity,
          bundlePriceSnapshot: bundle.bundlePrice,
        };
        const lineId = lineIdFor(input.variantId, input.colorId);
        const existingIndex = next.findIndex((item) => item.id === lineId);
        const desiredQty =
          (existingIndex >= 0 ? next[existingIndex].quantity : 0) + input.quantity;

        next =
          existingIndex >= 0
            ? next.map((item, index) =>
                index === existingIndex
                  ? { ...item, ...input, id: item.id, quantity: desiredQty }
                  : item,
              )
            : [...next, { ...input, id: lineId, quantity: desiredQty }];
      }
      return next;
    });

    setToastMessage(`Added "${bundle.bundleName}" to cart`);
  }

  function updateQuantity(
    lineId: string,
    quantity: number,
    availableStock?: number,
  ) {
    setItems((current) =>
      current.map((item) => {
        if (item.id !== lineId) return item;
        const max = availableStock ?? Infinity;
        return { ...item, quantity: Math.max(1, Math.min(quantity, max)) };
      }),
    );
  }

  function removeItem(lineId: string) {
    setItems((current) => current.filter((item) => item.id !== lineId));
  }

  function removeBundleGroup(bundleOfferId: string) {
    setItems((current) => current.filter((item) => item.bundleOfferId !== bundleOfferId));
  }

  function clearCart() {
    setItems([]);
  }

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );
  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );

  const value: CartContextValue = {
    items,
    itemCount,
    subtotal,
    hydrated,
    isDrawerOpen,
    openDrawer: () => setIsDrawerOpen(true),
    closeDrawer: () => setIsDrawerOpen(false),
    addItem,
    addBundleItems,
    updateQuantity,
    removeItem,
    removeBundleGroup,
    clearCart,
    toastMessage,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
