import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client — bypasses RLS entirely. Server-only: never
 * import this into a Client Component or anything that ships to the browser.
 * Used for operations RLS deliberately blocks from anon/authenticated roles
 * (creating orders, decrementing stock, admin-creating an auth user during
 * checkout, reading an order for the confirmation page regardless of who's
 * viewing it).
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
