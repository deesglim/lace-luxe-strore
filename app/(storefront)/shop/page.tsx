import Link from "next/link";
import BestSellersSection from "@/components/BestSellersSection";
import OffersSection from "@/components/OffersSection";
import ProductCard from "@/components/ProductCard";
import type { BundleOfferForShop } from "@/lib/bundleOffers";
import { getActiveBundleOffersForShop } from "@/lib/bundleOffers";
import { getActiveProducts, type ProductSummary } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;

  let products: ProductSummary[] = [];
  let productsError = false;

  try {
    products = await getActiveProducts();
  } catch {
    productsError = true;
  }

  // Offers failing to load isn't fatal to the page — the section just
  // doesn't render, same "degrade quietly" treatment as other optional
  // sections elsewhere in the storefront (e.g. checkout's delivery/promo
  // fetches).
  let offers: BundleOfferForShop[] = [];
  try {
    offers = await getActiveBundleOffersForShop();
  } catch {
    offers = [];
  }

  // The type filter only narrows the main grid — Best Sellers and Special
  // Offers below are about promoting things, not browsing a category, so
  // they stay showing everything regardless.
  const filteredProducts = type
    ? products.filter((product) => product.lace_type === type)
    : products;

  return (
    <main className="flex min-h-screen flex-1 flex-col bg-ivory py-20">
      <div className="mx-auto w-full max-w-6xl px-6 sm:px-12">
        <header className="mb-16 text-center">
          <span className="font-sans text-xs uppercase tracking-[0.3em] text-bronze">
            The Collection
          </span>
          <h1 className="mt-3 font-heading text-4xl font-medium text-espresso sm:text-5xl">
            Shop
          </h1>
        </header>

        <section className="mb-20">
          {type && (
            <p className="mb-6 text-center font-sans text-sm text-charcoal/70">
              Showing <span className="text-espresso">{type}</span> ·{" "}
              <Link
                href="/shop"
                className="text-bronze underline underline-offset-4"
              >
                Clear filter
              </Link>
            </p>
          )}

          {productsError ? (
            <EmptyState
              title="Something went wrong"
              message="We couldn't load the collection right now. Please refresh or try again shortly."
            />
          ) : filteredProducts.length === 0 ? (
            <EmptyState
              title={type ? "No pieces in this category yet" : "New arrivals coming soon"}
              message={
                type
                  ? "Check back soon, or browse the full collection instead."
                  : "We're putting the finishing touches on the collection. Check back soon."
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </div>

      <OffersSection offers={offers} />
      <BestSellersSection products={products} />
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
