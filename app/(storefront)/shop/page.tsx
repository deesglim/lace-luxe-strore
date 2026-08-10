import Link from "next/link";
import BestSellersSection from "@/components/BestSellersSection";
import OffersSection from "@/components/OffersSection";
import ProductCard from "@/components/ProductCard";
import type { BundleOfferForShop } from "@/lib/bundleOffers";
import { getActiveBundleOffersForShop } from "@/lib/bundleOffers";
import { getActiveProducts, type ProductSummary } from "@/lib/products";

export const dynamic = "force-dynamic";

function matchesSearch(product: ProductSummary, term: string): boolean {
  const haystack = [product.name, product.description, product.lace_type]
    .filter((value): value is string => Boolean(value))
    .join(" ")
    .toLowerCase();
  return haystack.includes(term);
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; search?: string }>;
}) {
  const { type, search } = await searchParams;
  const searchTerm = search?.trim().toLowerCase() ?? "";

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

  // Type filter, then search — both narrow the main grid only. Best
  // Sellers and Special Offers below are about promoting things, not
  // browsing/searching, so they stay showing everything regardless — except
  // while a search is active, where they'd just be noise around the
  // results the customer specifically asked for, so they hide entirely.
  const typeFiltered = type
    ? products.filter((product) => product.lace_type === type)
    : products;
  const filteredProducts = searchTerm
    ? typeFiltered.filter((product) => matchesSearch(product, searchTerm))
    : typeFiltered;

  const clearSearchHref = type ? `/shop?type=${encodeURIComponent(type)}` : "/shop";
  const clearTypeHref = search ? `/shop?search=${encodeURIComponent(search)}` : "/shop";

  return (
    <main className="flex min-h-screen flex-1 flex-col bg-ivory pb-20">
      <div className="mx-auto w-full max-w-content px-6 lg:px-[60px]">
        <header className="mt-6 mb-8">
          <h1 className="font-heading text-2xl font-medium text-espresso sm:text-3xl">
            Lace Collection
          </h1>
        </header>

        {type && (
          <p className="mb-3 text-center font-sans text-sm text-charcoal/70">
            Showing <span className="text-espresso">{type}</span> ·{" "}
            <Link href={clearTypeHref} className="text-bronze underline underline-offset-4">
              Clear filter
            </Link>
          </p>
        )}

        {search && (
          <p className="mb-6 text-center font-sans text-sm text-charcoal/70">
            Showing results for &ldquo;<span className="text-espresso">{search}</span>&rdquo; ·{" "}
            <Link href={clearSearchHref} className="text-bronze underline underline-offset-4">
              Clear search
            </Link>
          </p>
        )}

        {productsError ? (
          <div className="mb-10">
            <EmptyState
              title="Something went wrong"
              message="We couldn't load the collection right now. Please refresh or try again shortly."
            />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="mb-10">
            <EmptyState
              title={
                search
                  ? `No products found for "${search}"`
                  : type
                    ? "No pieces in this category yet"
                    : "New arrivals coming soon"
              }
              message={
                search
                  ? "Try a different search term, or browse the full collection instead."
                  : type
                    ? "Check back soon, or browse the full collection instead."
                    : "We're putting the finishing touches on the collection. Check back soon."
              }
              showBackLink={Boolean(search || type)}
            />
          </div>
        ) : null}
      </div>

      {!productsError && filteredProducts.length > 0 && (
        <section className="mb-10">
          <div className="mx-auto grid w-full max-w-content grid-cols-2 justify-items-center gap-x-5 gap-y-8 px-6 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-8 lg:px-[60px]">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} fluid />
            ))}
          </div>
        </section>
      )}

      {!search && (
        <>
          <OffersSection offers={offers} />
          <BestSellersSection products={products} layout="grid" />
        </>
      )}
    </main>
  );
}

function EmptyState({
  title,
  message,
  showBackLink,
}: {
  title: string;
  message: string;
  showBackLink?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-24 text-center">
      <h2 className="font-heading text-2xl text-espresso">{title}</h2>
      <p className="max-w-sm font-sans text-sm text-charcoal/70">{message}</p>
      {showBackLink && (
        <Link
          href="/shop"
          className="mt-2 font-sans text-sm uppercase tracking-[0.2em] text-bronze underline underline-offset-4"
        >
          Back to Shop
        </Link>
      )}
    </div>
  );
}
