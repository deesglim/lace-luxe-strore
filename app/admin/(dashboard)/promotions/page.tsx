import PromotionsManager from "@/components/admin/PromotionsManager";
import { getDistinctLaceTypes, getProductOptionsForAdmin } from "@/lib/products";
import { getAllPromotionsAdmin } from "@/lib/promotions";

export const dynamic = "force-dynamic";

export default async function AdminPromotionsPage() {
  const [promotions, laceTypes, productOptions] = await Promise.all([
    getAllPromotionsAdmin(),
    getDistinctLaceTypes(),
    getProductOptionsForAdmin(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-heading text-2xl text-espresso">Promotions</h1>
      <PromotionsManager
        initialPromotions={promotions}
        laceTypes={laceTypes}
        productOptions={productOptions}
      />
    </div>
  );
}
