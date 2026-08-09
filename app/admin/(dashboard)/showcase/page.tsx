import ShowcaseManager from "@/components/admin/ShowcaseManager";
import { getProductOptionsForAdmin } from "@/lib/products";
import { getAllShowcaseItemsForAdmin } from "@/lib/showcase";

export const dynamic = "force-dynamic";

export default async function AdminShowcasePage() {
  const [items, productOptions] = await Promise.all([
    getAllShowcaseItemsForAdmin(),
    getProductOptionsForAdmin(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl text-espresso">Customer Showcase</h1>
      <ShowcaseManager initialItems={items} productOptions={productOptions} />
    </div>
  );
}
