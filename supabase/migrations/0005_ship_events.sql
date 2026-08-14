-- 지나가는 선박 랜덤 조우 이벤트
-- household당 하루 스케줄(2~3회)을 서버가 결정적으로 계산하고, 도래 시점에만
-- 행을 생성한다(폴링 lazy-spawn). 클라이언트는 절대 직접 insert/update 하지 않는다.

create table public.ship_events (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  event_date date not null,
  slot_index int not null,
  ship_type_key text not null,
  spawned_at timestamptz not null default now(),
  expires_at timestamptz not null,
  status text not null default 'active' check (status in ('active', 'collected', 'auto_collected')),
  reward_cash numeric(10, 2) not null default 0,
  reward_catalog_item_id uuid references public.item_catalog (id),
  reward_item_qty int not null default 0,
  claimed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (household_id, event_date, slot_index)
);

create index ship_events_household_idx on public.ship_events (household_id, spawned_at desc);
create index ship_events_household_active_idx on public.ship_events (household_id) where status = 'active';

alter table public.ship_events enable row level security;

-- 읽기만 허용, 생성/판정(spawn/claim)은 service_role 서버 라우트 전용
create policy ship_events_select on public.ship_events
  for select using (public.is_household_member(household_id) or public.is_admin());
