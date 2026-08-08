create table if not exists public.promotions (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('percentage', 'fixed')),
  value numeric not null,
  scope text not null check (scope in ('sitewide', 'category', 'product')),
  scope_reference text,
  code text unique,
  active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.promotions enable row level security;

create policy "Public can view active promotions within date range"
  on public.promotions for select
  to anon, authenticated
  using (
    active = true
    and (starts_at is null or starts_at <= now())
    and (ends_at is null or ends_at >= now())
  );

create policy "Admins have full access to promotions"
  on public.promotions for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
