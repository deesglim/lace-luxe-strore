create table if not exists public.site_announcements (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists site_announcements_display_order_idx
  on public.site_announcements (display_order);

alter table public.site_announcements enable row level security;

create policy "Public can view active announcements"
  on public.site_announcements for select
  to anon, authenticated
  using (active = true);

create policy "Admins have full access to site announcements"
  on public.site_announcements for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
