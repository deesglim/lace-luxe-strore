import CheckoutForm from "@/components/checkout/CheckoutForm";
import { getCurrentProfile } from "@/lib/auth";
import type { BundleOfferWithItems } from "@/lib/bundles";
import { getActiveBundleOffersForCheckout } from "@/lib/bundleOffers";
import { getActiveDeliveryOptions, getStoreSettings } from "@/lib/deliveryOptions";
import { getActivePromotionsForCheckout } from "@/lib/promotions";
import type { DeliveryOption, Promotion, StoreSettings } from "@/types";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  let deliveryOptions: DeliveryOption[] = [];
  let settings: StoreSettings | null = null;
  let promotions: Promotion[] = [];
  let bundles: BundleOfferWithItems[] = [];

  try {
    [deliveryOptions, settings, promotions, bundles] = await Promise.all([
      getActiveDeliveryOptions(),
      getStoreSettings(),
      getActivePromotionsForCheckout(),
      getActiveBundleOffersForCheckout(),
    ]);
  } catch {
    // If delivery options can't load, the form still renders with an empty
    // list — Place Order stays disabled (no method to select) rather than
    // taking down the whole checkout page. Promotions/bundles failing the
    // same way just means no discount can be previewed/applied client-side;
    // the server still re-validates independently at submit time.
  }

  // Logged-in customers get their contact/address fields pre-filled from
  // their account — still editable/overridable for this specific order,
  // never enforced.
  const { user, profile } = await getCurrentProfile();
  const initialCustomer = user
    ? {
        fullName: profile?.full_name ?? "",
        email: user.email ?? "",
        phone: profile?.phone ?? "",
        addressLine: profile?.address_line ?? "",
        city: profile?.city ?? "",
        state: profile?.state ?? "",
      }
    : null;

  return (
    <CheckoutForm
      deliveryOptions={deliveryOptions}
      deliveryNotice={settings?.delivery_notice ?? null}
      freeShippingThreshold={settings?.free_shipping_threshold ?? 0}
      promotions={promotions}
      bundles={bundles}
      initialCustomer={initialCustomer}
    />
  );
}
