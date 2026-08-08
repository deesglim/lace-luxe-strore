alter table public.products
  add column if not exists why_choose text[] not null default '{}',
  add column if not exists why_not_choose text[] not null default '{}';

create table if not exists public.product_recommendations (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null,
  recommended_product_id uuid not null,
  reason_label text,
  created_at timestamptz not null default now(),
  constraint product_recommendations_product_id_fkey
    foreign key (product_id) references public.products (id) on delete cascade,
  constraint product_recommendations_recommended_product_id_fkey
    foreign key (recommended_product_id) references public.products (id) on delete cascade,
  constraint product_recommendations_not_self
    check (product_id <> recommended_product_id)
);

create index if not exists product_recommendations_product_id_idx
  on public.product_recommendations (product_id);

alter table public.product_recommendations enable row level security;

create policy "Public can view product recommendations"
  on public.product_recommendations for select
  to anon, authenticated
  using (true);

create policy "Admins have full access to product recommendations"
  on public.product_recommendations for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
