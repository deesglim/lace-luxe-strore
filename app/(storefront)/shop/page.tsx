import ProductCard from "@/components/ProductCard";
import { getActiveProducts, type ProductSummary } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  let products: ProductSummary[] = [];
  let loadError = false;

  try {
    products = await getActiveProducts();
  } catch {
    loadError = true;
  }

  return (
    <main className="flex min-h-screen flex-1 flex-col bg-ivory px-6 py-20 sm:px-12">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-16 text-center">
          <span className="font-sans text-xs uppercase tracking-[0.3em] text-bronze">
            The Collection
          </span>
          <h1 className="mt-3 font-heading text-4xl font-medium text-espresso sm:text-5xl">
            Shop
          </h1>
        </header>

        {loadError ? (
          <EmptyState
            title="Something went wrong"
            message="We couldn't load the collection right now. Please refresh or try again shortly."
          />
        ) : products.length === 0 ? (
          <EmptyState
            title="New arrivals coming soon"
            message="We're putting the finishing touches on the collection. Check back soon."
          />
        ) : (
          <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-24 text-center">
      <h2 className="font-heading text-2xl text-espresso">{title}</h2>
      <p className="max-w-sm font-sans text-sm text-charcoal/70">{message}</p>
    </div>
  );
}
