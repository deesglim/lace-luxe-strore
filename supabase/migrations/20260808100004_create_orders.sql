create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.profiles (id) on delete set null,
  guest_email text,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled')),
  subtotal numeric not null,
  discount_amount numeric not null default 0,
  total numeric not null,
  shipping_address jsonb,
  payment_reference text,
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'paid', 'failed')),
  created_at timestamptz not null default now()
);

create index if not exists orders_customer_id_idx on public.orders (customer_id);

alter table public.orders enable row level security;

-- No insert/update policy for customers here: order creation will go through
-- a server-side route (checkout) using the service role key once checkout is
-- built, so pricing/stock/totals can't be tampered with from the client.
create policy "Customers can view their own orders"
  on public.orders for select
  to authenticated
  using (customer_id = auth.uid());

create policy "Admins have full access to orders"
  on public.orders for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
