-- ============================================
-- smart_alerts
-- ============================================
create table if not exists public.smart_alerts (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  type          text not null,
  title         text not null,
  message       text not null,
  priority      text not null check (priority in ('high', 'medium', 'low')),
  status        text not null default 'unread' check (status in ('unread', 'read', 'dismissed')),
  equipment_id  uuid references public.equipment(id) on delete set null,
  booking_id    uuid references public.bookings(id) on delete set null,
  data          jsonb,
  action_url    text,
  created_at    timestamptz not null default now()
);

alter table public.smart_alerts enable row level security;

create policy "Users manage own alerts"
  on public.smart_alerts
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index smart_alerts_user_id_idx  on public.smart_alerts(user_id);
create index smart_alerts_status_idx   on public.smart_alerts(status);
create index smart_alerts_created_idx  on public.smart_alerts(created_at desc);

-- ============================================
-- equipment_bundles
-- ============================================
create table if not exists public.equipment_bundles (
  id                    uuid primary key default gen_random_uuid(),
  owner_id              uuid not null references auth.users(id) on delete cascade,
  name                  text not null,
  description           text not null default '',
  equipment_ids         uuid[] not null default '{}',
  discount_percentage   numeric(5,2) not null default 0 check (discount_percentage >= 0 and discount_percentage <= 100),
  original_daily_rate   numeric(10,2) not null default 0,
  discounted_daily_rate numeric(10,2) not null default 0,
  min_rental_days       int not null default 1,
  max_rental_days       int not null default 30,
  is_active             boolean not null default true,
  created_at            timestamptz not null default now()
);

alter table public.equipment_bundles enable row level security;

create policy "Anyone can view active bundles"
  on public.equipment_bundles
  for select
  using (is_active = true);

create policy "Owners manage own bundles"
  on public.equipment_bundles
  for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create index equipment_bundles_owner_id_idx  on public.equipment_bundles(owner_id);
create index equipment_bundles_is_active_idx on public.equipment_bundles(is_active);

-- ============================================
-- equipment_warranties
-- ============================================
create table if not exists public.equipment_warranties (
  id               uuid primary key default gen_random_uuid(),
  equipment_id     uuid not null references public.equipment(id) on delete cascade,
  warranty_type    text not null check (warranty_type in ('manufacturer', 'extended', 'third_party')),
  provider         text not null,
  coverage_details text not null default '',
  start_date       date not null,
  end_date         date not null,
  claim_contact    text,
  claim_phone      text,
  documents        text[],
  status           text not null default 'active' check (status in ('active', 'expired', 'claimed')),
  created_at       timestamptz not null default now()
);

alter table public.equipment_warranties enable row level security;

create policy "Equipment owners view warranties"
  on public.equipment_warranties
  for select
  using (
    exists (
      select 1 from public.equipment e
      where e.id = equipment_id
        and e.owner_id = auth.uid()
    )
  );

create policy "Equipment owners manage warranties"
  on public.equipment_warranties
  for all
  using (
    exists (
      select 1 from public.equipment e
      where e.id = equipment_id
        and e.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.equipment e
      where e.id = equipment_id
        and e.owner_id = auth.uid()
    )
  );

create index equipment_warranties_equipment_id_idx on public.equipment_warranties(equipment_id);
create index equipment_warranties_end_date_idx     on public.equipment_warranties(end_date);
create index equipment_warranties_status_idx       on public.equipment_warranties(status);

-- ============================================
-- bulk_bookings
-- ============================================
create table if not exists public.bulk_bookings (
  id              uuid primary key default gen_random_uuid(),
  renter_id       uuid not null references auth.users(id) on delete cascade,
  items           jsonb not null default '[]',
  subtotal        numeric(10,2) not null default 0,
  discount_amount numeric(10,2) not null default 0,
  service_fee     numeric(10,2) not null default 0,
  total_deposit   numeric(10,2) not null default 0,
  total_amount    numeric(10,2) not null default 0,
  payment_status  text not null default 'pending' check (payment_status in ('pending', 'paid', 'refunded')),
  booking_status  text not null default 'pending' check (booking_status in ('pending', 'confirmed', 'active', 'completed', 'cancelled')),
  created_at      timestamptz not null default now()
);

alter table public.bulk_bookings enable row level security;

create policy "Renters manage own bulk bookings"
  on public.bulk_bookings
  for all
  using (auth.uid() = renter_id)
  with check (auth.uid() = renter_id);

create index bulk_bookings_renter_id_idx on public.bulk_bookings(renter_id);
create index bulk_bookings_created_idx   on public.bulk_bookings(created_at desc);
