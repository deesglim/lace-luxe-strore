import { createClient } from "@/lib/supabase/server";

export type NewsletterSubscriber = {
  id: string;
  email: string;
  created_at: string;
};

export async function getAllNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .select("id, email, created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}
