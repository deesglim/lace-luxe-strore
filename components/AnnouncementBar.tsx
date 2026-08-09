import { getStoreSettings } from "@/lib/deliveryOptions";

export default async function AnnouncementBar() {
  let settings;
  try {
    settings = await getStoreSettings();
  } catch {
    settings = null;
  }

  if (!settings?.announcement_active || !settings.announcement_text?.trim()) {
    return null;
  }

  return (
    <div className="bg-espresso px-4 py-2 text-center">
      <p className="font-sans text-xs uppercase tracking-[0.1em] text-ivory sm:text-sm">
        {settings.announcement_text}
      </p>
    </div>
  );
}
