import DeliveryOptionsManager from "@/components/admin/DeliveryOptionsManager";
import {
  getAllDeliveryOptionsForAdmin,
  getStoreSettings,
} from "@/lib/deliveryOptions";

export const dynamic = "force-dynamic";

export default async function AdminDeliveryPage() {
  const [options, settings] = await Promise.all([
    getAllDeliveryOptionsForAdmin(),
    getStoreSettings(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-heading text-2xl text-espresso">Delivery Options</h1>
      <DeliveryOptionsManager initialOptions={options} initialSettings={settings} />
    </div>
  );
}
