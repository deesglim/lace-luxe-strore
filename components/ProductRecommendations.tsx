import Link from "next/link";
import type { ProductRecommendationDisplay } from "@/lib/products";

export default function ProductRecommendations({
  recommendations,
}: {
  recommendations: ProductRecommendationDisplay[];
}) {
  const valid = recommendations.filter((rec) => rec.recommended_product);
  if (valid.length === 0) return null;

  return (
    <section className="bg-espresso py-16 lg:py-20">
      <div className="mx-auto w-full max-w-content px-6 lg:px-[60px]">
        <span className="font-label text-xs font-medium uppercase tracking-label text-bronze">
          Curated For You
        </span>
        <h2 className="mt-2 font-heading text-2xl font-medium text-ivory sm:text-3xl">
          You May Also Like
        </h2>

        {/*
          Grid columns only fill as much width as there are cards for
          (auto-fill with a max card width), rather than a flat grid-cols-4
          that leaves a huge empty gap on this dark band when a product
          only has one or two recommendations set.
        */}
        <div className="mt-8 grid grid-cols-[repeat(auto-fill,minmax(150px,200px))] gap-4 sm:gap-6 lg:gap-8">
          {valid.map((rec) => {
            const product = rec.recommended_product!;
            const image = product.images?.[0];
            return (
              <Link
                key={rec.id}
                href={`/shop/${product.slug}`}
                className="group flex flex-col overflow-hidden rounded-brand border border-ivory/10 bg-ivory transition hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.35)]"
              >
                <div className="aspect-[4/5] w-full overflow-hidden bg-blush">
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={image}
                      alt={product.name}
                      className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="font-heading text-2xl italic text-bronze">LL</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-2 p-3">
                  {rec.reason_label && (
                    <span className="w-fit rounded-full bg-blush px-2.5 py-1 font-label text-[9px] font-medium uppercase tracking-label text-espresso">
                      {rec.reason_label}
                    </span>
                  )}
                  <h3 className="line-clamp-2 font-heading text-sm font-medium text-espresso lg:text-base">
                    {product.name}
                  </h3>
                  <span className="mt-auto font-label text-[11px] font-medium uppercase tracking-label text-bronze">
                    Shop Now →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
