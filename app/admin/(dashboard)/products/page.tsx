import Link from "next/link";
import { getAllProductsForAdmin } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await getAllProductsForAdmin();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl text-espresso">Products</h1>
        <Link
          href="/admin/products/new"
          className="bg-espresso px-5 py-2.5 font-sans text-sm uppercase tracking-[0.2em] text-ivory"
        >
          Add New Product
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="font-sans text-sm text-charcoal/70">
          No products yet. Add your first one to get started.
        </p>
      ) : (
        <div className="overflow-x-auto border border-blush">
          <table className="w-full border-collapse text-left font-sans text-sm">
            <thead>
              <tr className="border-b border-blush bg-blush/30 text-xs uppercase tracking-[0.1em] text-bronze">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Lace Type</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Variants</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-blush/60 last:border-0"
                >
                  <td className="px-4 py-3 text-charcoal">{product.name}</td>
                  <td className="px-4 py-3 text-charcoal/70">
                    {product.lace_type ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 text-xs uppercase tracking-wide ${
                        product.active
                          ? "bg-blush text-espresso"
                          : "bg-charcoal/10 text-charcoal/50"
                      }`}
                    >
                      {product.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-charcoal/70">
                    {product.product_variants.length}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="text-bronze underline underline-offset-4"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
