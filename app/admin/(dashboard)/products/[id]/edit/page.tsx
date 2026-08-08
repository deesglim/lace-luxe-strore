import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import {
  getProductByIdForAdmin,
  getProductOptionsForAdmin,
  getProductRecommendationsForAdmin,
} from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, productOptions, recommendations] = await Promise.all([
    getProductByIdForAdmin(id),
    getProductOptionsForAdmin(),
    getProductRecommendationsForAdmin(id),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-heading text-2xl text-espresso">Edit Product</h1>
      <ProductForm
        product={product}
        productOptions={productOptions}
        recommendations={recommendations}
      />
    </div>
  );
}
