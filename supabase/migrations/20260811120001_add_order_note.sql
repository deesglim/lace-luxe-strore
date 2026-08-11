-- Optional free-text note a customer can leave at checkout (e.g. lace prep
-- instructions). Nullable — most orders won't have one, and every place
-- that displays it treats an absent note as "don't show this section" ---
-- not "" (empty string), so a stray whitespace-only note never renders.
alter table public.orders
  add column if not exists order_note text;
