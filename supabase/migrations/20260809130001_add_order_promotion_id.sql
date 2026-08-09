alter table public.orders
  add column if not exists promotion_id uuid references public.promotions (id) on delete set null;
