import HomepageSettingsManager from "@/components/admin/HomepageSettingsManager";
import { getStoreSettings } from "@/lib/deliveryOptions";

export const dynamic = "force-dynamic";

export default async function AdminHomepagePage() {
  const settings = await getStoreSettings();

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-heading text-2xl text-espresso">Homepage</h1>
      <HomepageSettingsManager initialSettings={settings} />
    </div>
  );
}
