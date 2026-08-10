import BestSellersSection from "@/components/BestSellersSection";
import CategorySection from "@/components/CategorySection";
import CustomerShowcaseSection from "@/components/CustomerShowcaseSection";
import HomeHero from "@/components/HomeHero";
import NewsletterSignup from "@/components/NewsletterSignup";
import OffersTeaser from "@/components/OffersTeaser";
import type { BundleOfferForShop } from "@/lib/bundleOffers";
import { getActiveBundleOffersForShop } from "@/lib/bundleOffers";
import { getStoreSettings } from "@/lib/deliveryOptions";
import {
  getActiveProducts,
  getProductCategoriesForShop,
  type ProductCategoryCard,
  type ProductSummary,
} from "@/lib/products";
import { getActiveShowcaseItemsForHomepage } from "@/lib/showcase";
import type { ShowcaseItem } from "@/lib/showcase";
import type { StoreSettings } from "@/types";

export const dynamic = "force-dynamic";

const DEFAULT_HERO_HEADING = "Luxury Lace For Flawless Installs";
const DEFAULT_HERO_SUBHEADING =
  "Premium HD Lace and Swiss Lace crafted for luxury wigmakers, hairstylists, and beauty brands.";

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

  let showcaseItems: ShowcaseItem[] = [];
  try {
    showcaseItems = await getActiveShowcaseItemsForHomepage();
  } catch {
    showcaseItems = [];
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
      <OffersTeaser offers={offers} />
      <CustomerShowcaseSection items={showcaseItems} />
      <NewsletterSignup />
    </main>
  );
}
