create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  lace_type text,
  images text[] not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

-- Only active (published) products are visible to shoppers; admins can see
-- drafts too via the admin policy below.
create policy "Public can view active products"
  on public.products for select
  to anon, authenticated
  using (active = true);

create policy "Admins have full access to products"
  on public.products for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
