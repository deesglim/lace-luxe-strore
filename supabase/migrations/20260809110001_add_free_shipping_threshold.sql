alter table public.store_settings
  add column if not exists free_shipping_threshold numeric not null default 200000;
