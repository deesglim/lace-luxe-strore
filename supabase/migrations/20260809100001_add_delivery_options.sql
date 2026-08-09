create table if not exists public.delivery_options (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('pickup', 'local_delivery', 'interstate_transport')),
  name text not null,
  description text,
  price numeric not null default 0,
  delivery_time text,
  active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists delivery_options_category_idx on public.delivery_options (category);

alter table public.delivery_options enable row level security;

create policy "Public can view active delivery options"
  on public.delivery_options for select
  to anon, authenticated
  using (active = true);

create policy "Admins have full access to delivery options"
  on public.delivery_options for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create table if not exists public.store_settings (
  id uuid primary key default gen_random_uuid(),
  delivery_notice text not null default '',
  created_at timestamptz not null default now()
);

alter table public.store_settings enable row level security;

create policy "Public can view store settings"
  on public.store_settings for select
  to anon, authenticated
  using (true);

create policy "Admins have full access to store settings"
  on public.store_settings for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

alter table public.orders
  add column if not exists delivery_option_id uuid references public.delivery_options (id) on delete set null,
  add column if not exists delivery_fee numeric not null default 0;

-- Seed data. Guarded by "where not exists" so re-running this migration
-- (e.g. pasted twice by accident) doesn't create duplicate rows.
insert into public.delivery_options (category, name, description, price, delivery_time, display_order)
select * from (values
  ('pickup', 'MTN Mast, New Road, Borokiri', 'Free pickup location', 0::numeric, null::text, 1),

  ('local_delivery', 'Alakahia, Choba, Eneka Link Road', null, 5000, null, 1),
  ('local_delivery', 'Rumuekeni, Igwuruta', null, 7000, null, 2),
  ('local_delivery', 'Rumuibekwe, Sars Road, Rumukparali, Obirekwere, Ogbogoro, Rumuogholu, Rumuokoro, Rumuosi', null, 4500, null, 3),
  ('local_delivery', 'Lagos Bustop to Town, Eastern Bypass, Marine Base', null, 2500, null, 4),
  ('local_delivery', 'Station Road to Mile 1', null, 3000, null, 5),
  ('local_delivery', 'Bori Camp, Odili Road, Elelenwo, Mile 3, Mile 1, Ada George, Station Road, Ozuoba (off Abuloma), Elekahia, Old GRA, Rumuigbo, Oro-azi, Agip, GRA, Rumuola, Waterlines', null, 3500, null, 6),
  ('local_delivery', 'Nta Road, Ozuoba, Rukpokwu, Eliozu, Rumuokwuta/Rumuokalabor, Abuloma (from Bitterleaf), Elibolo', null, 4000, null, 7),
  ('local_delivery', 'PH International Airport, Oyibo', null, 12000, null, 8),

  ('interstate_transport', 'GIG Logistics – Park Pickup', 'Western states (Lagos, Ogun, Oyo, Osun, Ondo, Ekiti, Abuja FCT, Kaduna, Kano, Katsina, Sokoto, all northern states), Bayelsa, Delta, Edo, Akwa Ibom, Cross River, Abia, Anambra, Ebonyi, Enugu, Imo', 7500, '3-5 working days', 1),
  ('interstate_transport', 'GIG Logistics – Home Delivery', 'Western states (Lagos, Ogun, Oyo, Osun, Ondo, Ekiti, Abuja FCT, Kaduna, Kano, Katsina, Sokoto, all northern states), Bayelsa, Delta, Edo, Akwa Ibom, Cross River, Abia, Anambra, Ebonyi, Enugu, Imo', 10500, '3-5 working days', 2),
  ('interstate_transport', 'GIG Logistics – Go Faster', 'Western states (Lagos, Ogun, Oyo, Osun, Ondo, Ekiti, Abuja FCT, Kaduna, Kano, Katsina, Sokoto, all northern states), Bayelsa, Delta, Edo, Akwa Ibom, Cross River, Abia, Anambra, Ebonyi, Enugu, Imo', 15000, '2 working days', 3),
  ('interstate_transport', 'GUO Transport – Park Pickup', 'Lagos, Abuja FCT, Benin, Delta, Abia (incl. Aba), Anambra, Ebonyi, Enugu, Imo, Bayelsa, Edo, Akwa Ibom, Cross Rivers', 6000, '2-3 working days', 4),
  ('interstate_transport', 'Rivers-Joy Transport – Park Pickup', 'Abia, Anambra, Ebonyi, Enugu, Imo, Owerri, all eastern states', 5000, '2-3 working days', 5),
  ('interstate_transport', 'Agofure Motors – Park Pickup', 'Delta, Asaba, Warri, Sapele, surrounding areas', 6000, '2-3 working days', 6),
  ('interstate_transport', 'AKTC (Akwa Ibom Transport Company)', 'Uyo, Calabar, Akwa Ibom. Price to be confirmed by admin.', 0, '2-3 working days', 7),
  ('interstate_transport', 'Galloping Motors', 'Aba', 5000, '1-2 days', 8),
  ('interstate_transport', 'Bayelsa Park (Igbogene)', 'Yenagoa, Bayelsa only', 5000, '1-2 days', 9),
  ('interstate_transport', 'Next Day Delivery (DREAMBOX)', 'Next-day delivery service', 18000, null, 10)
) as v(category, name, description, price, delivery_time, display_order)
where not exists (select 1 from public.delivery_options);

insert into public.store_settings (delivery_notice)
select 'We do not process or ship orders during weekends. Our business operates Monday to Friday, 9:00 AM – 5:00 PM. All deliveries and dispatches are carried out strictly within these hours. Any purchase after 2pm is scheduled for delivery the next day. Within Port Harcourt: delivery is completed within 24 hours after order confirmation. Outside Port Harcourt: orders are delivered to the transport park within 24 hours after confirmation. Kindly ensure all delivery details are accurate before confirming your order to avoid delays.'
where not exists (select 1 from public.store_settings);
