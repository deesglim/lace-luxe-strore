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

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addItem: (input: AddToCartInput, availableStock: number) => void;
  updateQuantity: (lineId: string, quantity: number, availableStock?: number) => void;
  removeItem: (lineId: string) => void;
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
    isDrawerOpen,
    openDrawer: () => setIsDrawerOpen(true),
    closeDrawer: () => setIsDrawerOpen(false),
    addItem,
    updateQuantity,
    removeItem,
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
