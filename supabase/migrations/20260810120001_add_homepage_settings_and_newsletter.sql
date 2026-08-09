alter table public.store_settings
  add column if not exists hero_image_url text,
  add column if not exists hero_heading text default 'Lace Luxe by Dee',
  add column if not exists hero_subheading text default 'Discover premium HD and Swiss lace, crafted for flawless installs.';

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table public.newsletter_subscribers enable row level security;

-- Anyone can subscribe, but only admins (or the service role) can read the
-- list back — subscriber emails aren't public data, unlike everything else
-- with a "Public can view ..." policy elsewhere in this app.
create policy "Public can subscribe to the newsletter"
  on public.newsletter_subscribers for insert
  to anon, authenticated
  with check (true);

create policy "Admins have full access to newsletter subscribers"
  on public.newsletter_subscribers for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
