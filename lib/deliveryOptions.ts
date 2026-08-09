import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { DeliveryOption, StoreSettings } from "@/types";

const DELIVERY_OPTION_FIELDS =
  "id, category, name, description, price, delivery_time, active, display_order, created_at";

const STORE_SETTINGS_FIELDS =
  "id, delivery_notice, free_shipping_threshold, hero_image_url, hero_heading, hero_subheading, announcement_text, announcement_active, created_at";

export async function getActiveDeliveryOptions(): Promise<DeliveryOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("delivery_options")
    .select(DELIVERY_OPTION_FIELDS)
    .eq("active", true)
    .order("display_order", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getStoreSettings(): Promise<StoreSettings | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("store_settings")
    .select(STORE_SETTINGS_FIELDS)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// Admin-client variant for contexts without a reliable cookie session (the
// checkout API route and the Paystack webhook both run server-to-server) —
// store_settings is publicly readable anyway, this just sidesteps depending
// on a session that may not exist there.
export async function getStoreSettingsAdmin(): Promise<StoreSettings | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("store_settings")
    .select(STORE_SETTINGS_FIELDS)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// Admin-facing: skips the `active = true` filter so disabled options still
// show up in the dashboard to be re-enabled or edited.
export async function getAllDeliveryOptionsForAdmin(): Promise<DeliveryOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("delivery_options")
    .select(DELIVERY_OPTION_FIELDS)
    .order("display_order", { ascending: true });

  if (error) throw error;
  return data ?? [];
}
