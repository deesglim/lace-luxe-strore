import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types";

// cache() dedupes this within a single request, so the layout's admin
// gate and a page rendered inside it don't each pay for a separate
// auth + profile round trip.
export const getCurrentProfile = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, phone, wholesale_status, wholesale_discount_percent, is_admin, created_at")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  return { user, profile };
});
