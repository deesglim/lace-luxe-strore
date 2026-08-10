-- Tracks one redemption per (promotion, customer) so a code-based promotion
-- can only ever be used once per signed-up customer. Only written by the
-- server (checkout route's eligibility check, payment-completion's actual
-- redemption record) via the service-role client, which bypasses RLS — no
-- insert/update/delete policy is needed for anon/authenticated roles.
create table if not exists public.promo_redemptions (
  id uuid primary key default gen_random_uuid(),
  promotion_id uuid not null references public.promotions (id) on delete cascade,
  customer_id uuid not null references public.profiles (id) on delete cascade,
  order_id uuid references public.orders (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (promotion_id, customer_id)
);

create index if not exists promo_redemptions_customer_id_idx on public.promo_redemptions (customer_id);

alter table public.promo_redemptions enable row level security;

create policy "Admins can view promo redemptions"
  on public.promo_redemptions for select
  to authenticated
  using (public.is_admin());
