-- "Was" price for showing a struck-through original price next to the
-- current price. A variant is "on sale" purely by comparison at read
-- time (compare_at_price > price) — no separate on/off flag needed.
alter table public.product_variants
  add column if not exists compare_at_price numeric;
