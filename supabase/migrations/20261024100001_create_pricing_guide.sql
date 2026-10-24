-- Hair Service Pricing Guide: a paid digital product. A customer has access
-- while they have at least one purchase row with status 'paid'. Rows are
-- created and updated only by server code using the service-role key
-- (checkout, Paystack webhook, admin grant/revoke), never from the browser.

create table if not exists public.pricing_guide_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  amount numeric not null default 0,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'failed', 'revoked')),
  source text not null default 'paystack'
    check (source in ('paystack', 'granted')),
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create index if not exists pricing_guide_purchases_user_id_idx
  on public.pricing_guide_purchases (user_id);

alter table public.pricing_guide_purchases enable row level security;

create policy "Customers can view their own pricing guide purchases"
  on public.pricing_guide_purchases for select
  to authenticated
  using (user_id = auth.uid());

create policy "Admins have full access to pricing guide purchases"
  on public.pricing_guide_purchases for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- One row per signed-in browser session that has opened the calculator.
-- Used to limit each buyer to a small number of active devices: opening it
-- on a new device switches off the oldest one.
create table if not exists public.pricing_guide_sessions (
  user_id uuid not null references public.profiles (id) on delete cascade,
  session_id text not null,
  last_seen timestamptz not null default now(),
  revoked boolean not null default false,
  primary key (user_id, session_id)
);

alter table public.pricing_guide_sessions enable row level security;

create policy "Admins have full access to pricing guide sessions"
  on public.pricing_guide_sessions for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
