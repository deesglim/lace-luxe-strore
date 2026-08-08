create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  size_label text not null,
  price numeric not null,
  stock_quantity integer not null default 0,
  sku text,
  created_at timestamptz not null default now()
);

create index if not exists product_variants_product_id_idx
  on public.product_variants (product_id);

alter table public.product_variants enable row level security;

create policy "Public can view product variants"
  on public.product_variants for select
  to anon, authenticated
  using (true);

create policy "Admins have full access to product variants"
  on public.product_variants for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
