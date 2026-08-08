create table if not exists public.product_variant_colors (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references public.product_variants (id) on delete cascade,
  color_name text not null,
  stock_quantity integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists product_variant_colors_variant_id_idx
  on public.product_variant_colors (variant_id);

alter table public.product_variant_colors enable row level security;

create policy "Public can view product variant colors"
  on public.product_variant_colors for select
  to anon, authenticated
  using (true);

create policy "Admins have full access to product variant colors"
  on public.product_variant_colors for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
