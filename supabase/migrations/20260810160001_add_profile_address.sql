-- A customer's saved default shipping address, prefilled into checkout on
-- future orders. Deliberately excludes delivery method — that's chosen
-- per-order (available options can change), not something to persist here.
alter table public.profiles
  add column if not exists address_line text,
  add column if not exists city text,
  add column if not exists state text;
