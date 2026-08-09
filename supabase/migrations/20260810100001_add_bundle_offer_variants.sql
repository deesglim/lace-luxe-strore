alter table public.bundle_offers
  add column if not exists image_url text;

-- Nullable at the DB level (existing bundle_offer_items rows predate this
-- change and have no variant/color set) — "required" for specific_products
-- items is enforced in the admin form instead. A row with variant_id null
-- simply never matches any cart contents, so pre-existing bundles just stop
-- qualifying until their admin re-picks an exact size/color for each item.
alter table public.bundle_offer_items
  add column if not exists variant_id uuid references public.product_variants (id) on delete cascade,
  add column if not exists color_id uuid references public.product_variant_colors (id) on delete cascade;
