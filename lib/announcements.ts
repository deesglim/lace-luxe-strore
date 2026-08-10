import { createClient } from "@/lib/supabase/server";

export type Announcement = {
  id: string;
  text: string;
};

export async function getActiveAnnouncements(): Promise<Announcement[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_announcements")
    .select("id, text")
    .eq("active", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export type AdminAnnouncement = {
  id: string;
  text: string;
  active: boolean;
  displayOrder: number;
  createdAt: string;
};

function mapRow(row: {
  id: string;
  text: string;
  active: boolean;
  display_order: number;
  created_at: string;
}): AdminAnnouncement {
  return {
    id: row.id,
    text: row.text,
    active: row.active,
    displayOrder: row.display_order,
    createdAt: row.created_at,
  };
}

export async function getAllAnnouncementsForAdmin(): Promise<AdminAnnouncement[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_announcements")
    .select("id, text, active, display_order, created_at")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapRow);
}
