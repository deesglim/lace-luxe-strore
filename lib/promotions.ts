import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Promotion } from "@/types";

const PROMOTION_FIELDS =
  "id, type, value, scope, scope_reference, code, active, starts_at, ends_at, created_at";

/**
 * Customer-facing fetch for the checkout page. Uses the cookie client, so
 * the "Public can view active promotions within date range" RLS policy does
 * the active/date filtering — this only ever returns promotions that are
 * currently applicable, never inactive/future/expired ones.
 */
export async function getActivePromotionsForCheckout(): Promise<Promotion[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("promotions")
    .select(PROMOTION_FIELDS)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/**
 * Admin-client fetch of every promotion regardless of active/date range —
 * used by the admin promotions page (drafts and expired ones still need to
 * show up to be edited/reactivated) and by the checkout API's server-side
 * discount revalidation, which applies isPromotionCurrentlyValid() itself
 * rather than depending on RLS's now() to match its own.
 */
export async function getAllPromotionsAdmin(): Promise<Promotion[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("promotions")
    .select(PROMOTION_FIELDS)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}
