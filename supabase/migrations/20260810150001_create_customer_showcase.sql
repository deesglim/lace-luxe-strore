create table if not exists public.customer_showcase (
  id uuid primary key default gen_random_uuid(),
  media_url text not null,
  media_type text not null check (media_type in ('image', 'video')),
  handle_text text,
  follower_text text,
  caption_text text,
  product_id uuid references public.products (id) on delete set null,
  display_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists customer_showcase_display_order_idx
  on public.customer_showcase (display_order);

alter table public.customer_showcase enable row level security;

create policy "Public can view active showcase items"
  on public.customer_showcase for select
  to anon, authenticated
  using (active = true);

create policy "Admins have full access to customer showcase"
  on public.customer_showcase for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Public bucket for showcase photos/videos. 50MB/file (enough for a short
-- muted clip), images and a few common video containers.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'customer-showcase',
  'customer-showcase',
  true,
  52428800,
  array[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'video/mp4', 'video/quicktime', 'video/webm'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Public can view customer showcase media"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'customer-showcase');

create policy "Admins can upload customer showcase media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'customer-showcase' and public.is_admin());

create policy "Admins can update customer showcase media"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'customer-showcase' and public.is_admin())
  with check (bucket_id = 'customer-showcase' and public.is_admin());

create policy "Admins can delete customer showcase media"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'customer-showcase' and public.is_admin());
