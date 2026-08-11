import { NextResponse, type NextRequest } from "next/server";
import { getAllBundleOffersAdmin } from "@/lib/bundleOffers";
import { getStoreSettingsAdmin } from "@/lib/deliveryOptions";
import { pickBestDeal } from "@/lib/discount";
import { initializePaystackTransaction } from "@/lib/paystack";
import { upsertMailerLiteSubscriber } from "@/lib/mailerlite";
import { checkPromoCodeEligibility } from "@/lib/promoRedemptions";
import { getAllPromotionsAdmin } from "@/lib/promotions";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ShippingAddress } from "@/types";

export const runtime = "nodejs";

type CheckoutItemInput = {
  variantId: string;
  colorId: string | null;
  quantity: number;
};

type CheckoutRequestBody = {
  items: CheckoutItemInput[];
  customer: {
    fullName: string;
    email: string;
    phone: string;
    addressLine: string;
    city: string;
    state: string;
  };
  createAccount: boolean;
  password?: string;
  deliveryOptionId: string;
  promoCode?: string | null;
  orderNote?: string | null;
};

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function POST(request: NextRequest) {
  let body: CheckoutRequestBody;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid request body.");
  }

  const { items, customer, createAccount, password, deliveryOptionId, promoCode, orderNote } =
    body;

  if (!Array.isArray(items) || items.length === 0) {
    return badRequest("Your cart is empty.");
  }
  if (!customer?.fullName?.trim()) return badRequest("Please enter your full name.");
  if (!customer?.email?.trim()) return badRequest("Please enter your email address.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim())) {
    return badRequest("Please enter a valid email address.");
  }
  if (!customer?.phone?.trim()) return badRequest("Please enter your phone number.");
  if (!customer?.addressLine?.trim()) return badRequest("Please enter your delivery address.");
  if (!customer?.city?.trim()) return badRequest("Please enter your city.");
  if (!customer?.state?.trim()) return badRequest("Please enter your state.");
  if (createAccount && (!password || password.length < 6)) {
    return badRequest("Password must be at least 6 characters.");
  }
  if (!deliveryOptionId || typeof deliveryOptionId !== "string") {
    return badRequest("Please select a delivery method.");
  }

  const supabaseAdmin = createAdminClient();
  const cookieClient = await createClient();

  // Re-derive the delivery fee from the live database too — same reasoning
  // as item prices below, the client's number can't be trusted.
  const { data: deliveryOption, error: deliveryOptionError } = await supabaseAdmin
    .from("delivery_options")
    .select("id, price, active")
    .eq("id", deliveryOptionId)
    .maybeSingle();

  if (deliveryOptionError) throw deliveryOptionError;
  if (!deliveryOption || !deliveryOption.active) {
    return badRequest("That delivery method is no longer available. Please choose another.");
  }

  // Re-derive price and stock from the live database — the cart is
  // client-side (localStorage), so nothing about price or availability from
  // the request body can be trusted for what actually gets charged/ordered.
  type ResolvedItem = {
    variantId: string;
    colorId: string | null;
    quantity: number;
    price: number;
    productId: string;
    laceType: string | null;
  };
  const resolvedItems: ResolvedItem[] = [];

  for (const rawItem of items) {
    if (
      typeof rawItem?.variantId !== "string" ||
      !Number.isInteger(rawItem?.quantity) ||
      rawItem.quantity < 1
    ) {
      return badRequest("Invalid item in cart.");
    }

    const { data: variant, error: variantError } = await supabaseAdmin
      .from("product_variants")
      .select("id, price, stock_quantity, product_id, products(name, lace_type)")
      .eq("id", rawItem.variantId)
      .maybeSingle();

    if (variantError) throw variantError;
    if (!variant) {
      return badRequest("One of the items in your cart is no longer available.");
    }

    // supabase-js infers this to-one embed as an array without generated
    // DB types (same quirk noted in lib/orders.ts) — at runtime it's always
    // a single object or null.
    const productRow = Array.isArray(variant.products)
      ? (variant.products[0] ?? null)
      : variant.products;
    const itemLabel = productRow?.name ?? "One of the items in your cart";

    let availableStock = variant.stock_quantity;

    if (rawItem.colorId) {
      const { data: color, error: colorError } = await supabaseAdmin
        .from("product_variant_colors")
        .select("id, stock_quantity, variant_id")
        .eq("id", rawItem.colorId)
        .maybeSingle();

      if (colorError) throw colorError;
      if (!color || color.variant_id !== rawItem.variantId) {
        return badRequest("One of the items in your cart is no longer available.");
      }
      availableStock = color.stock_quantity;
    }

    if (rawItem.quantity > availableStock) {
      return badRequest(
        availableStock <= 0
          ? `${itemLabel} is currently out of stock — please remove it from your cart.`
          : `Only ${availableStock} left in stock for ${itemLabel} — please reduce the quantity in your cart.`,
      );
    }

    resolvedItems.push({
      variantId: rawItem.variantId,
      colorId: rawItem.colorId ?? null,
      quantity: rawItem.quantity,
      price: variant.price,
      productId: variant.product_id,
      laceType: productRow?.lace_type ?? null,
    });
  }

  const subtotal = resolvedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  // Re-derive from the live store settings too — same reasoning as prices
  // and stock above, nothing from the client can be trusted for what
  // actually gets charged.
  const settings = await getStoreSettingsAdmin();
  const freeShippingThreshold = settings?.free_shipping_threshold ?? 0;
  const freeShippingApplied =
    freeShippingThreshold > 0 && subtotal >= freeShippingThreshold;
  const deliveryFee = freeShippingApplied ? 0 : deliveryOption.price;

  // Resolve who's placing the order: an already-logged-in session wins for
  // *attribution* (customer_id, order history), otherwise create an account
  // (and sign them in) or fall back to guest. Independent of that, the
  // email typed into the checkout form is always what correspondence for
  // this order goes to — a stale/shared-device session shouldn't silently
  // redirect the receipt to whatever email that account was originally
  // created with instead of what the person in front of the form typed.
  // Resolved before the discount block below too, since a code's
  // eligibility depends on whether there's an *existing* logged-in session
  // — a guest checking "create an account" in this same request still
  // wasn't logged in when they typed the code, so that shouldn't retroactively
  // unlock code usage.
  const {
    data: { user: existingUser },
  } = await cookieClient.auth.getUser();

  // Same "never trust the client" treatment as everything else above: the
  // client's claimed discount is ignored entirely — only the submitted code
  // (if any) carries over, and the actual amount is recomputed here against
  // the live promotions and bundles tables, picking whichever of (best
  // automatic promotion, submitted code, best qualifying bundle) discounts
  // the most.
  const [promotions, bundles] = await Promise.all([
    getAllPromotionsAdmin(),
    getAllBundleOffersAdmin(),
  ]);

  // Codes are guest-only-blocked, not feature-gated entirely — automatic
  // (no-code) promotions and bundles still apply for everyone below
  // regardless of what happens to promoCode here. Bypassing the UI (typing
  // a code as a guest, or replaying a used one) gets refused server-side,
  // same as every other "never trust the client" check in this route.
  const trimmedPromoCode = promoCode?.trim() || null;
  if (trimmedPromoCode) {
    const eligibility = await checkPromoCodeEligibility(
      supabaseAdmin,
      promotions,
      trimmedPromoCode,
      existingUser?.id ?? null,
    );
    if (!eligibility.ok) {
      return badRequest(eligibility.error);
    }
  }

  const discountCartItems = resolvedItems.map((item) => ({
    productId: item.productId,
    variantId: item.variantId,
    colorId: item.colorId,
    laceType: item.laceType,
    price: item.price,
    quantity: item.quantity,
  }));
  const deal = pickBestDeal(promotions, bundles, discountCartItems, trimmedPromoCode);
  const discountAmount = deal.amount;

  const total = subtotal - discountAmount + deliveryFee;

  let customerId: string | null = null;
  const contactEmail: string = customer.email;

  if (existingUser) {
    customerId = existingUser.id;
  } else if (createAccount) {
    const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: customer.email,
      password,
      email_confirm: true,
      user_metadata: { full_name: customer.fullName },
    });

    if (createError || !created.user) {
      const message = createError?.message ?? "";
      if (message.toLowerCase().includes("already")) {
        return badRequest(
          "An account with this email already exists. Uncheck 'create an account' to check out as a guest, or log in first.",
        );
      }
      console.error("checkout: admin.createUser failed", createError);
      return NextResponse.json(
        { error: "Could not create your account. Please try again." },
        { status: 500 },
      );
    }

    customerId = created.user.id;

    // Best-effort: sign them into the browser session too. Not fatal if it
    // fails — the order still goes through, they just stay logged out.
    await cookieClient.auth.signInWithPassword({
      email: customer.email,
      password: password!,
    });
  }

  const shippingAddress: ShippingAddress = {
    full_name: customer.fullName,
    phone: customer.phone,
    address_line: customer.addressLine,
    city: customer.city,
    state: customer.state,
    country: "Nigeria",
  };

  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .insert({
      customer_id: customerId,
      guest_email: contactEmail,
      status: "pending",
      subtotal,
      discount_amount: discountAmount,
      promotion_id: deal.type === "promotion" ? deal.promotion.id : null,
      bundle_id: deal.type === "bundle" ? deal.bundle.id : null,
      delivery_option_id: deliveryOption.id,
      delivery_fee: deliveryFee,
      total,
      shipping_address: shippingAddress,
      payment_status: "pending",
      order_note: orderNote?.trim() || null,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    console.error("checkout: orders insert failed", orderError);
    return NextResponse.json(
      { error: "Could not create your order. Please try again." },
      { status: 500 },
    );
  }

  const { error: itemsError } = await supabaseAdmin.from("order_items").insert(
    resolvedItems.map((item) => ({
      order_id: order.id,
      variant_id: item.variantId,
      color_id: item.colorId,
      quantity: item.quantity,
      price_at_purchase: item.price,
    })),
  );

  if (itemsError) {
    console.error("checkout: order_items insert failed", itemsError);
    await supabaseAdmin.from("orders").delete().eq("id", order.id);
    return NextResponse.json(
      { error: "Could not create your order. Please try again." },
      { status: 500 },
    );
  }

  // Marketing sync — anyone who reaches this point (guest or logged-in)
  // gets tracked as having started checkout, so an abandoned-cart sequence
  // can be built directly in MailerLite for orders that never reach
  // "paid". Never blocks/fails checkout, see lib/mailerlite.ts.
  const checkoutStartedGroupId = process.env.MAILERLITE_GROUP_CHECKOUT_STARTED;
  if (checkoutStartedGroupId) {
    await upsertMailerLiteSubscriber({
      email: contactEmail,
      name: customer.fullName,
      phone: customer.phone,
      groupId: checkoutStartedGroupId,
    });
  }

  try {
    const origin = new URL(request.url).origin;
    const { authorizationUrl, reference } = await initializePaystackTransaction({
      email: customer.email,
      amountNaira: total,
      reference: order.id,
      callbackUrl: `${origin}/checkout/success?order_id=${order.id}`,
      metadata: { order_id: order.id },
    });

    await supabaseAdmin
      .from("orders")
      .update({ payment_reference: reference })
      .eq("id", order.id);

    return NextResponse.json({ authorizationUrl, orderId: order.id });
  } catch (paystackError) {
    console.error("checkout: Paystack initialize failed", paystackError);
    // Payment couldn't be started — don't leave a dangling unpayable order.
    await supabaseAdmin.from("orders").delete().eq("id", order.id);
    return NextResponse.json(
      { error: "Could not start payment. Please try again." },
      { status: 500 },
    );
  }
}
