import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

// Auth emails aren't queryable via PostgREST (auth.users isn't exposed),
// so this is the one place that needs the service-role client even though
// the rest of this file uses the cookie-bound admin-RLS client like the
// other admin list queries. Paginates through every user rather than
// looking each one up individually — a handful of admin API calls beats
// N calls for N customers.
async function getEmailsByUserId(): Promise<Map<string, string>> {
  const supabaseAdmin = createAdminClient();
  const emailById = new Map<string, string>();
  const perPage = 200;
  let page = 1;

  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    for (const user of data.users) {
      if (user.email) emailById.set(user.id, user.email);
    }

    if (data.users.length < perPage) break;
    page += 1;
  }

  return emailById;
}

export type AdminCustomer = {
  id: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  createdAt: string;
  paidOrderCount: number;
};

// "Completed/paid" is payment_status = 'paid', not order status — a paid
// order's status moves on to processing/shipped/etc immediately (see
// lib/orderStatus.ts), but payment_status is the durable signal that a
// real purchase happened, which is what "loyal repeat customer" means here.
export async function getAllCustomersForAdmin(): Promise<AdminCustomer[]> {
  const supabase = await createClient();

  const [{ data: profiles, error: profilesError }, { data: orderRows, error: ordersError }, emailById] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, phone, created_at")
        .eq("is_admin", false),
      supabase.from("orders").select("customer_id").eq("payment_status", "paid"),
      getEmailsByUserId(),
    ]);

  if (profilesError) throw profilesError;
  if (ordersError) throw ordersError;

  const paidOrderCountByCustomer = new Map<string, number>();
  for (const row of orderRows ?? []) {
    if (!row.customer_id) continue;
    paidOrderCountByCustomer.set(
      row.customer_id,
      (paidOrderCountByCustomer.get(row.customer_id) ?? 0) + 1,
    );
  }

  return (profiles ?? [])
    .map((profile) => ({
      id: profile.id,
      fullName: profile.full_name,
      email: emailById.get(profile.id) ?? null,
      phone: profile.phone,
      createdAt: profile.created_at,
      paidOrderCount: paidOrderCountByCustomer.get(profile.id) ?? 0,
    }))
    .sort((a, b) => b.paidOrderCount - a.paidOrderCount);
}

export type AdminCustomerDetail = {
  id: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  createdAt: string;
};

export async function getCustomerForAdmin(
  customerId: string,
): Promise<AdminCustomerDetail | null> {
  const supabase = await createClient();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, full_name, phone, created_at")
    .eq("id", customerId)
    .maybeSingle();

  if (error) throw error;
  if (!profile) return null;

  const supabaseAdmin = createAdminClient();
  const { data: userData } = await supabaseAdmin.auth.admin.getUserById(customerId);

  return {
    id: profile.id,
    fullName: profile.full_name,
    email: userData?.user?.email ?? null,
    phone: profile.phone,
    createdAt: profile.created_at,
  };
}
