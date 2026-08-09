alter table public.products
  add column if not exists is_best_seller boolean not null default false;
