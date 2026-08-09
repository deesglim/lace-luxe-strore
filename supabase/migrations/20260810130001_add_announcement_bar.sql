alter table public.store_settings
  add column if not exists announcement_text text,
  add column if not exists announcement_active boolean not null default false;
