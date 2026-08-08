-- user_id isn't in the original spec, but "select only their own" requires
-- something to compare against auth.uid() — added it as the ownership link.
-- Applying therefore requires being signed in.
create table if not exists public.wholesale_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  full_name text not null,
  business_name text not null,
  email text not null,
  phone text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

alter table public.wholesale_applications enable row level security;

create policy "Users can submit their own wholesale application"
  on public.wholesale_applications for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Users can view their own wholesale application"
  on public.wholesale_applications for select
  to authenticated
  using (user_id = auth.uid());

create policy "Admins have full access to wholesale applications"
  on public.wholesale_applications for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
