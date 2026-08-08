create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  customer_name text not null,
  rating integer not null check (rating between 1 and 5),
  comment text,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists reviews_product_id_idx on public.reviews (product_id);

alter table public.reviews enable row level security;

create policy "Public can view approved reviews"
  on public.reviews for select
  to anon, authenticated
  using (approved = true);

create policy "Admins have full access to reviews"
  on public.reviews for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
