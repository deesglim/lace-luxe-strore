"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useCart } from "@/components/cart/CartProvider";
import type { BundleOfferWithItems } from "@/lib/bundles";
import { formatDeliveryPrice, groupDeliveryOptionsByCategory } from "@/lib/delivery";
import { describeAppliedDiscount, findPromotionByCode, pickBestDeal } from "@/lib/discount";
import { formatNaira } from "@/lib/format";
import type { DeliveryOption, Promotion } from "@/types";

const inputClass =
  "h-14 rounded-button border border-charcoal/15 bg-ivory px-4 font-sans text-sm text-charcoal focus:border-espresso focus:outline-none";

// Customer-facing category copy differs slightly from the admin dashboard's
// (which mirrors the DB category name) — override just the display label here.
const CHECKOUT_CATEGORY_LABELS: Partial<Record<DeliveryOption["category"], string>> = {
  interstate_transport: "Interstate Delivery",
};

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-2 font-sans text-sm text-charcoal">
      <span className="font-label text-xs font-medium uppercase tracking-label text-bronze">
        {label}
      </span>
      {children}
    </label>
  );
}

export type CheckoutInitialCustomer = {
  fullName: string;
  email: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
};

export default function CheckoutForm({
  deliveryOptions,
  deliveryNotice,
  freeShippingThreshold,
  promotions,
  bundles,
  initialCustomer,
}: {
  deliveryOptions: DeliveryOption[];
  deliveryNotice: string | null;
  freeShippingThreshold: number;
  promotions: Promotion[];
  bundles: BundleOfferWithItems[];
  initialCustomer: CheckoutInitialCustomer | null;
}) {
  const router = useRouter();
  const { items, subtotal, hydrated } = useCart();
  const isLoggedIn = initialCustomer !== null;

  const [fullName, setFullName] = useState(initialCustomer?.fullName ?? "");
  const [email, setEmail] = useState(initialCustomer?.email ?? "");
  const [phone, setPhone] = useState(initialCustomer?.phone ?? "");
  const [addressLine, setAddressLine] = useState(initialCustomer?.addressLine ?? "");
  const [city, setCity] = useState(initialCustomer?.city ?? "");
  const [state, setState] = useState(initialCustomer?.state ?? "");
  const [createAccount, setCreateAccount] = useState(false);
  const [password, setPassword] = useState("");
  const [deliveryOptionId, setDeliveryOptionId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<
    DeliveryOption["category"] | null
  >(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [checkingCode, setCheckingCode] = useState(false);
  const [orderNote, setOrderNote] = useState("");

  useEffect(() => {
    // Wait for the cart to actually finish loading from localStorage
    // before treating it as empty — items starts as [] on every mount
    // (to match SSR) even when a real cart is about to hydrate in a
    // moment, e.g. on a hard refresh or a direct link straight to
    // /checkout. Redirecting on that transient empty state would kick
    // out a customer who has real items waiting.
    if (hydrated && items.length === 0) {
      router.replace("/shop");
    }
  }, [hydrated, items.length, router]);

  const groupedDelivery = groupDeliveryOptionsByCategory(deliveryOptions);
  const selectedDelivery = deliveryOptions.find(
    (option) => option.id === deliveryOptionId,
  );
  const freeShippingApplied =
    freeShippingThreshold > 0 && subtotal >= freeShippingThreshold;
  const deliveryFee = freeShippingApplied ? 0 : (selectedDelivery?.price ?? 0);

  // Best of: the highest-value automatic (no-code) sale, the customer's
  // applied code, or the best qualifying bundle — never stacked, only ever
  // one wins. Recomputes live as the cart changes, same as the
  // free-shipping progress elsewhere.
  const discountItems = items.map((item) => ({
    productId: item.productId,
    variantId: item.variantId,
    colorId: item.colorId,
    laceType: item.laceType,
    price: item.price,
    quantity: item.quantity,
  }));
  const deal = pickBestDeal(promotions, bundles, discountItems, appliedCode);
  const total = subtotal - deal.amount + deliveryFee;

  async function handleApplyCode() {
    const trimmed = promoCodeInput.trim();
    if (!trimmed) return;

    // Cheap local check first — matches the promotions already loaded on
    // this page, no round trip needed for a code that's obviously wrong.
    const matched = findPromotionByCode(promotions, trimmed);
    if (!matched) {
      setCodeError("That code isn't valid or has expired.");
      setAppliedCode(null);
      return;
    }

    // A code can look valid locally but still be blocked for this specific
    // customer (already redeemed) — that can only be known server-side, so
    // check live right here rather than letting it surface for the first
    // time at final submission. Hits the exact same eligibility check
    // /api/checkout runs before charging, so this can't disagree with it.
    setCodeError(null);
    setCheckingCode(true);
    try {
      const response = await fetch("/api/checkout/check-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: trimmed }),
      });
      const data = await response.json();

      if (!response.ok) {
        setCodeError(data.error ?? "That code isn't valid or has expired.");
        setAppliedCode(null);
        return;
      }

      setAppliedCode(trimmed);
    } catch {
      setCodeError("Could not check that code. Please try again.");
      setAppliedCode(null);
    } finally {
      setCheckingCode(false);
    }
  }

  // Once free shipping kicks in, every delivery option is free — the
  // customer still picks one for pickup/zone/carrier purposes, they just
  // don't pay for it. formatDeliveryPrice's "Free"/"Price TBD" distinction
  // only matters at an option's own list price, not here.
  function displayPrice(option: DeliveryOption): string {
    return freeShippingApplied ? "FREE" : formatDeliveryPrice(option);
  }

  function handleCategoryClick(
    category: DeliveryOption["category"],
    options: DeliveryOption[],
  ) {
    setActiveCategory(category);
    // A single pickup option needs no further drill-down — the category
    // choice IS the option choice.
    if (category === "pickup" && options.length === 1) {
      setDeliveryOptionId(options[0].id);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!deliveryOptionId) {
      setError("Please select a delivery method to continue.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            variantId: item.variantId,
            colorId: item.colorId,
            quantity: item.quantity,
          })),
          customer: { fullName, email, phone, addressLine, city, state },
          createAccount,
          password: createAccount ? password : undefined,
          deliveryOptionId,
          promoCode: appliedCode,
          orderNote: orderNote.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Something went wrong placing your order.");
        setSubmitting(false);
        return;
      }

      window.location.href = data.authorizationUrl;
    } catch {
      setError("Something went wrong placing your order. Please try again.");
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <main className="flex min-h-screen flex-1 flex-col bg-ivory px-6 pt-6 pb-20 sm:pt-8 lg:px-[60px] lg:pt-10">
      <div className="mx-auto w-full max-w-5xl">
        <Link
          href="/cart"
          className="mb-2 inline-block font-sans text-xs uppercase tracking-[0.2em] text-bronze underline underline-offset-4"
        >
          ← Back to Cart
        </Link>
        <h1 className="mb-6 font-heading text-3xl font-medium text-espresso">Checkout</h1>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px] lg:gap-12">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 lg:gap-8">
            {error && (
              <p className="rounded-md border border-bronze bg-blush/40 px-4 py-3 font-sans text-sm text-espresso">
                {error}
              </p>
            )}

            <div className="rounded-brand border border-blush bg-ivory p-6 shadow-[0_8px_25px_rgba(0,0,0,0.04)]">
              <div className="flex flex-col divide-y divide-blush">
                <div className="flex flex-col gap-4 pb-6 sm:pb-7">
                  <h2 className="font-heading text-2xl font-medium text-espresso">
                    Contact
                  </h2>
                  <Field label="Full Name">
                    <input
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Email">
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Phone">
                    <input
                      required
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                </div>

                <div className="flex flex-col gap-4 py-6 sm:py-7">
                  <h2 className="font-heading text-2xl font-medium text-espresso">
                    Shipping Address
                  </h2>
                  <Field label="Address Line">
                    <input
                      required
                      value={addressLine}
                      onChange={(e) => setAddressLine(e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="City">
                      <input
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="State">
                      <input
                        required
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className={inputClass}
                      />
                    </Field>
                  </div>
                  <p className="font-sans text-xs text-charcoal/60">
                    We currently deliver within Nigeria only.
                  </p>
                </div>

                <div className="flex flex-col gap-4 pt-6 sm:pt-7">
                  {deliveryNotice && (
                    <p className="rounded-md border border-blush bg-blush/20 px-4 py-3 font-sans text-xs leading-relaxed text-charcoal/70">
                      {deliveryNotice}
                    </p>
                  )}

                  <h2 className="font-heading text-2xl font-medium text-espresso">
                    Delivery Method
                  </h2>

                  {freeShippingApplied && (
                    <p className="font-sans text-sm text-espresso">
                      🎉 You&apos;ve unlocked free shipping — choose any
                      method below at no charge.
                    </p>
                  )}

                  <div className="flex flex-col gap-3">
                    {groupedDelivery.map((group) => {
                      const isOpen = activeCategory === group.category;
                      const isSelected =
                        selectedDelivery?.category === group.category;
                      const isSinglePickup =
                        group.category === "pickup" && group.options.length === 1;
                      const showDrilldown = isOpen && !isSinglePickup;

                      return (
                        <div key={group.category} className="flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleCategoryClick(group.category, group.options)
                            }
                            className={`flex cursor-pointer items-center justify-between gap-3 rounded-button border px-4 py-3 text-left font-sans text-sm transition ${
                              isOpen || isSelected
                                ? "border-espresso bg-espresso/5"
                                : "border-charcoal/20 hover:border-bronze"
                            }`}
                          >
                            <span className="min-w-0 truncate text-charcoal">
                              {CHECKOUT_CATEGORY_LABELS[group.category] ?? group.label}
                            </span>
                            {isSelected && selectedDelivery ? (
                              <span className="shrink-0 whitespace-nowrap text-xs text-espresso">
                                {selectedDelivery.name} ·{" "}
                                {displayPrice(selectedDelivery)}
                              </span>
                            ) : (
                              <span className="shrink-0 whitespace-nowrap text-xs text-charcoal/40">
                                {isSinglePickup
                                  ? displayPrice(group.options[0])
                                  : "Select"}
                              </span>
                            )}
                          </button>

                          {showDrilldown && (
                            <div className="ml-2 flex flex-col gap-2">
                              {group.options.map((option) => {
                                const selected = option.id === deliveryOptionId;
                                return (
                                  <label
                                    key={option.id}
                                    className={`flex cursor-pointer items-center justify-between gap-3 rounded-button border px-4 py-3 font-sans text-sm transition ${
                                      selected
                                        ? "border-espresso bg-espresso/5"
                                        : "border-charcoal/20 hover:border-bronze"
                                    }`}
                                  >
                                    <span className="flex min-w-0 items-center gap-3">
                                      <input
                                        type="radio"
                                        name="delivery-option"
                                        checked={selected}
                                        onChange={() => setDeliveryOptionId(option.id)}
                                        className="h-4 w-4 shrink-0 accent-espresso"
                                      />
                                      <span className="flex min-w-0 flex-col">
                                        <span className="truncate text-charcoal">
                                          {option.name}
                                        </span>
                                        {(option.delivery_time || option.description) && (
                                          <span className="text-xs text-charcoal/60">
                                            {[option.delivery_time, option.description]
                                              .filter(Boolean)
                                              .join(" · ")}
                                          </span>
                                        )}
                                      </span>
                                    </span>
                                    <span className="shrink-0 whitespace-nowrap text-espresso">
                                      {displayPrice(option)}
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {!isLoggedIn && (
              <div className="flex flex-col gap-3">
                <p className="font-sans text-sm text-charcoal">
                  Already have an account?{" "}
                  <Link
                    href="/login?redirect=/checkout"
                    className="text-bronze underline underline-offset-4"
                  >
                    Log in
                  </Link>
                </p>

                <label className="flex items-center gap-2 font-sans text-sm text-charcoal">
                  <input
                    type="checkbox"
                    checked={createAccount}
                    onChange={(e) => setCreateAccount(e.target.checked)}
                  />
                  Create an account to track this order (optional)
                </label>
                {createAccount ? (
                  <Field label="Password">
                    <input
                      required
                      type="password"
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                ) : (
                  <p className="font-sans text-xs text-charcoal/60">
                    You&apos;ll check out as a guest — we&apos;ll email your
                    receipt to the address above.
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <span className="font-label text-xs font-medium uppercase tracking-label text-bronze">
                Order Note (Optional)
              </span>
              <p className="font-sans text-xs text-charcoal/60">
                Any special instructions? E.g. how you&apos;d like your lace
                prepped.
              </p>
              <textarea
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                rows={3}
                className="rounded-button border border-charcoal/15 bg-ivory px-4 py-3 font-sans text-sm text-charcoal focus:border-espresso focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !deliveryOptionId}
              title={
                !deliveryOptionId ? "Select a delivery method to continue" : undefined
              }
              className="h-14 rounded-button bg-espresso px-6 font-sans text-sm uppercase tracking-[0.2em] text-ivory transition hover:bg-espresso/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Placing Order…" : "Place Order"}
            </button>
          </form>

          <div className="h-fit rounded-brand border border-blush bg-ivory p-6 shadow-[0_8px_25px_rgba(0,0,0,0.04)]">
            <h2 className="mb-4 font-heading text-xl font-medium text-espresso">
              Order Summary
            </h2>
            <div className="flex flex-col divide-y divide-blush">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 py-4 first:pt-0 last:pb-0"
                >
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-blush">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="font-heading text-sm italic text-bronze">
                          LL
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate font-sans text-sm text-espresso">
                      {item.name}
                    </span>
                    <span className="font-sans text-xs text-charcoal/60">
                      {item.sizeLabel}
                      {item.colorName ? ` · ${item.colorName}` : ""} ×{" "}
                      {item.quantity}
                    </span>
                  </div>
                  <span className="shrink-0 font-sans text-sm text-charcoal">
                    {formatNaira(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-col gap-2 border-t border-blush pt-4">
              <span className="font-label text-xs font-medium uppercase tracking-label text-bronze">
                Discount Code
              </span>
              {isLoggedIn ? (
                <>
                  <div className="flex gap-2">
                    <input
                      value={promoCodeInput}
                      onChange={(e) => {
                        setPromoCodeInput(e.target.value);
                        setCodeError(null);
                      }}
                      placeholder="e.g. DEES10"
                      className={`${inputClass} flex-1`}
                    />
                    <button
                      type="button"
                      onClick={handleApplyCode}
                      disabled={!promoCodeInput.trim() || checkingCode}
                      className="h-14 shrink-0 rounded-button border border-espresso px-4 font-sans text-xs uppercase tracking-[0.15em] text-espresso transition hover:bg-espresso hover:text-ivory disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {checkingCode ? "Checking…" : "Apply"}
                    </button>
                  </div>
                  {codeError && (
                    <p className="font-sans text-xs text-bronze">{codeError}</p>
                  )}
                  {appliedCode &&
                    !codeError &&
                    deal.promotion?.code?.toUpperCase() !== appliedCode.toUpperCase() && (
                      <p className="font-sans text-xs text-charcoal/60">
                        Code &ldquo;{appliedCode}&rdquo; is valid, but{" "}
                        {deal.type === "bundle" ? "a bundle deal" : "an automatic discount"}{" "}
                        already applied is bigger — that one&apos;s being used
                        instead.
                      </p>
                    )}
                </>
              ) : (
                <p className="font-sans text-xs text-charcoal/60">
                  <Link
                    href="/login?redirect=/checkout"
                    className="text-bronze underline underline-offset-4"
                  >
                    Log in
                  </Link>{" "}
                  to use a discount code.
                </p>
              )}
            </div>

            <div className="mt-4 flex flex-col gap-2 border-t border-blush pt-4">
              <div className="flex items-center justify-between font-sans text-sm text-charcoal">
                <span>Subtotal</span>
                <span>{formatNaira(subtotal)}</span>
              </div>
              {deal.type && deal.amount > 0 && (
                <div className="flex items-center justify-between font-sans text-sm text-espresso">
                  <span>{describeAppliedDiscount(deal.bundle?.name ?? null, deal.promotion?.code ?? null)}</span>
                  <span>-{formatNaira(deal.amount)}</span>
                </div>
              )}
              {selectedDelivery && (
                <div className="flex items-center justify-between font-sans text-sm text-charcoal">
                  <span>Delivery ({selectedDelivery.name})</span>
                  <span>{displayPrice(selectedDelivery)}</span>
                </div>
              )}
              <div className="flex items-center justify-between font-heading text-lg text-espresso">
                <span>Total</span>
                <span>{formatNaira(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
