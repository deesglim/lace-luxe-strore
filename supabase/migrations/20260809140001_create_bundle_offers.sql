create table if not exists public.bundle_offers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  bundle_type text not null check (bundle_type in ('specific_products', 'flexible_quantity')),
  bundle_price numeric not null,
  -- Used for flexible_quantity only.
  required_quantity integer,
  scope text check (scope in ('sitewide', 'category')),
  scope_reference text,
  active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.bundle_offers enable row level security;

create policy "Public can view active bundle offers within date range"
  on public.bundle_offers for select
  to anon, authenticated
  using (
    active = true
    and (starts_at is null or starts_at <= now())
    and (ends_at is null or ends_at >= now())
  );

create policy "Admins have full access to bundle offers"
  on public.bundle_offers for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Only meaningful for bundle_type = 'specific_products' — the set of
-- products (and how many of each) required for that bundle to qualify.
create table if not exists public.bundle_offer_items (
  id uuid primary key default gen_random_uuid(),
  bundle_offer_id uuid not null references public.bundle_offers (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  quantity_required integer not null default 1
);

create index if not exists bundle_offer_items_bundle_offer_id_idx
  on public.bundle_offer_items (bundle_offer_id);

alter table public.bundle_offer_items enable row level security;

create policy "Public can view bundle offer items"
  on public.bundle_offer_items for select
  to anon, authenticated
  using (true);

create policy "Admins have full access to bundle offer items"
  on public.bundle_offer_items for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Never set alongside promotion_id — enforced in application logic (the
-- discount-selection code only ever picks one winning promotion or bundle
-- per order), not as a DB constraint.
alter table public.orders
  add column if not exists bundle_id uuid references public.bundle_offers (id) on delete set null;
