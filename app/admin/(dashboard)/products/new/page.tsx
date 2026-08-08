import ProductForm from "@/components/admin/ProductForm";
import { getProductOptionsForAdmin } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const productOptions = await getProductOptionsForAdmin();

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-heading text-2xl text-espresso">Add New Product</h1>
      <ProductForm productOptions={productOptions} />
    </div>
  );
}
