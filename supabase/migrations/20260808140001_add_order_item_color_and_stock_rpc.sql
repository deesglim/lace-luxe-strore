-- order_items only recorded size (variant_id) — colors were added in a
-- later migration, so there was nowhere to record which color was ordered.
alter table public.order_items
  add column if not exists color_id uuid references public.product_variant_colors (id) on delete set null;

-- Atomic stock decrement for a paid order line. Doing this as a single SQL
-- UPDATE (rather than reading stock_quantity in application code, subtracting,
-- and writing it back) avoids a lost-update race if two orders for the same
-- variant/color are confirmed at nearly the same time. greatest(0, ...)
-- guards against going negative if something is double-counted.
create or replace function public.decrement_stock_for_order_item(
  p_variant_id uuid,
  p_color_id uuid,
  p_quantity integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_color_id is not null then
    update public.product_variant_colors
    set stock_quantity = greatest(0, stock_quantity - p_quantity)
    where id = p_color_id;
  else
    update public.product_variants
    set stock_quantity = greatest(0, stock_quantity - p_quantity)
    where id = p_variant_id;
  end if;
end;
$$;
