alter table public.orders
  add column if not exists tracking_note text;
