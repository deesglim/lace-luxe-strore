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
    <div className="flex flex-col gap-3">
      <h2 className="font-heading text-xl text-espresso">
        Recommended Alternatives
      </h2>
      <ul className="flex flex-col gap-2">
        {valid.map((rec) => (
          <li key={rec.id} className="font-sans text-sm text-charcoal/80">
            {rec.reason_label ? `If ${rec.reason_label} → ` : ""}Choose{" "}
            <Link
              href={`/shop/${rec.recommended_product!.slug}`}
              className="text-bronze underline underline-offset-4"
            >
              {rec.recommended_product!.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
