import BundlesManager from "@/components/admin/BundlesManager";
import { getAllBundleOffersAdmin } from "@/lib/bundleOffers";
import { getDistinctLaceTypes, getProductsWithVariantsForAdmin } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function AdminBundlesPage() {
  const [bundles, laceTypes, productsWithVariants] = await Promise.all([
    getAllBundleOffersAdmin(),
    getDistinctLaceTypes(),
    getProductsWithVariantsForAdmin(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-heading text-2xl text-espresso">Bundles</h1>
      <BundlesManager
        initialBundles={bundles}
        laceTypes={laceTypes}
        productsWithVariants={productsWithVariants}
      />
    </div>
  );
}
