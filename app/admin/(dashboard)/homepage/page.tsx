import AnnouncementsManager from "@/components/admin/AnnouncementsManager";
import HomepageSettingsManager from "@/components/admin/HomepageSettingsManager";
import { getAllAnnouncementsForAdmin, type AdminAnnouncement } from "@/lib/announcements";
import { getStoreSettings } from "@/lib/deliveryOptions";

export const dynamic = "force-dynamic";

export default async function AdminHomepagePage() {
  const settings = await getStoreSettings();

  let announcements: AdminAnnouncement[] = [];
  try {
    announcements = await getAllAnnouncementsForAdmin();
  } catch {
    announcements = [];
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-heading text-2xl text-espresso">Homepage</h1>
      <HomepageSettingsManager initialSettings={settings} />
      <AnnouncementsManager initialItems={announcements} />
    </div>
  );
}
