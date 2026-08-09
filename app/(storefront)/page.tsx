import BestSellersSection from "@/components/BestSellersSection";
import CategorySection from "@/components/CategorySection";
import HomeHero from "@/components/HomeHero";
import NewsletterSignup from "@/components/NewsletterSignup";
import OffersTeaser from "@/components/OffersTeaser";
import TestimonialsSection from "@/components/TestimonialsSection";
import TrustBadges from "@/components/TrustBadges";
import type { BundleOfferForShop } from "@/lib/bundleOffers";
import { getActiveBundleOffersForShop } from "@/lib/bundleOffers";
import { getStoreSettings } from "@/lib/deliveryOptions";
import {
  getActiveProducts,
  getFeaturedReviews,
  getProductCategoriesForShop,
  type FeaturedReview,
  type ProductCategoryCard,
  type ProductSummary,
} from "@/lib/products";
import type { StoreSettings } from "@/types";

export const dynamic = "force-dynamic";

const DEFAULT_HERO_HEADING = "Lace Luxe by Dee";
const DEFAULT_HERO_SUBHEADING =
  "Discover premium HD and Swiss lace, crafted for flawless installs.";

export default async function Home() {
  let settings: StoreSettings | null = null;
  try {
    settings = await getStoreSettings();
  } catch {
    settings = null;
  }

  let products: ProductSummary[] = [];
  try {
    products = await getActiveProducts();
  } catch {
    products = [];
  }

  let categories: ProductCategoryCard[] = [];
  try {
    categories = await getProductCategoriesForShop();
  } catch {
    categories = [];
  }

  let offers: BundleOfferForShop[] = [];
  try {
    offers = await getActiveBundleOffersForShop();
  } catch {
    offers = [];
  }

  let reviews: FeaturedReview[] = [];
  try {
    reviews = await getFeaturedReviews();
  } catch {
    reviews = [];
  }

  return (
    <main className="flex flex-1 flex-col bg-ivory">
      <HomeHero
        imageUrl={settings?.hero_image_url ?? null}
        heading={settings?.hero_heading ?? DEFAULT_HERO_HEADING}
        subheading={settings?.hero_subheading ?? DEFAULT_HERO_SUBHEADING}
      />
      <CategorySection categories={categories} />
      <BestSellersSection products={products} />
      <TestimonialsSection reviews={reviews} />
      <OffersTeaser offers={offers} />
      <TrustBadges />
      <NewsletterSignup />
    </main>
  );
}
