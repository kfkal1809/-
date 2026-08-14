-- 해기사와 연인들의 항해일지 — 초기 스키마
-- 기획서 4장(데이터 구조) + 5.6장(RLS) 기준
-- 모든 시간은 timestamptz, 승선/출석 등 날짜 개념은 date(KST 계산은 애플리케이션 레이어에서 처리)

create extension if not exists pgcrypto;

-- =========================================================
-- 1. profiles
-- =========================================================
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  kakao_user_id text unique,
  nickname text not null,
  role text not null default 'member' check (role in ('member', 'admin')),
  approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- 2. households / household_users
-- =========================================================
create table public.households (
  id uuid primary key default gen_random_uuid(),
  relation_status text check (relation_status in ('dating', 'engaged', 'married')),
  game_marriage_status text not null default 'none'
    check (game_marriage_status in ('none', 'pending_signature', 'married')),
  game_married_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.household_users (
  household_id uuid not null references public.households (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (household_id, user_id)
);

-- =========================================================
-- 3. invite_codes
-- =========================================================
create table public.invite_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  type text not null check (type in ('community', 'partner')),
  created_by uuid references public.profiles (id),
  household_id uuid references public.households (id) on delete cascade,
  target_character_id uuid, -- FK added after characters table exists
  expires_at timestamptz,
  max_uses int not null default 1,
  used_count int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- =========================================================
-- 4. characters / character_managers
-- =========================================================
create table public.characters (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  kind text not null check (kind in ('haenyeo', 'haenam', 'child')),
  nickname text not null,
  department text check (department in ('deck', 'engine', 'other')),
  rank_label text,
  child_gender text check (child_gender in ('male', 'female', 'unset')),
  child_stage text check (
    child_stage in ('infant', 'toddler', 'kindergarten', 'elementary', 'middle', 'high', 'university')
  ),
  appearance_json jsonb not null default '{}'::jsonb,
  managed_only boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.invite_codes
  add constraint invite_codes_target_character_fk
  foreign key (target_character_id) references public.characters (id) on delete set null;

create table public.character_managers (
  character_id uuid not null references public.characters (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  primary key (character_id, user_id)
);

-- max 3 새싹 per household, enforced again server-side at write time
create index characters_household_idx on public.characters (household_id);

-- =========================================================
-- 5. voyages / voyage_change_logs
-- =========================================================
create table public.voyages (
  id uuid primary key default gen_random_uuid(),
  haenam_character_id uuid not null references public.characters (id) on delete cascade,
  boarded_at date,
  expected_signoff_at date,
  actual_signoff_at date,
  vacation_start_at date,
  next_boarding_at date,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.voyage_change_logs (
  id uuid primary key default gen_random_uuid(),
  voyage_id uuid not null references public.voyages (id) on delete cascade,
  changed_by uuid references public.profiles (id),
  before_json jsonb,
  after_json jsonb,
  created_at timestamptz not null default now()
);

-- =========================================================
-- 6. wallets / wallet_transactions / fx_rates
-- =========================================================
create table public.wallets (
  household_id uuid primary key references public.households (id) on delete cascade,
  cached_balance numeric(10, 2) not null default 0,
  updated_at timestamptz not null default now()
);

create table public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  amount numeric(10, 2) not null,
  type text not null,
  idempotency_key text unique not null,
  metadata_json jsonb default '{}'::jsonb,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

create index wallet_transactions_household_idx on public.wallet_transactions (household_id, created_at desc);

create table public.fx_rates (
  rate_date date primary key,
  usd_krw numeric(10, 2) not null,
  provider text,
  fetched_at timestamptz not null default now()
);

-- =========================================================
-- 7. item_catalog / inventory_items / character_equipment
-- =========================================================
create table public.item_catalog (
  id uuid primary key default gen_random_uuid(),
  sku text unique not null,
  name text not null,
  description text,
  category text not null check (
    category in ('hair', 'outfit', 'hat', 'accessory', 'furniture', 'fishing', 'keepsake', 'special')
  ),
  subcategory text,
  rarity text not null default 'common' check (rarity in ('common', 'rare', 'epic', 'legendary')),
  buy_price numeric(10, 2) not null default 0,
  sell_price numeric(10, 2) not null default 0,
  asset_key text,
  layer_key text,
  unique_owned boolean not null default false,
  placeable boolean not null default false,
  interaction_key text,
  source_label text,
  metadata_json jsonb default '{}'::jsonb,
  active boolean not null default true
);

create table public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  catalog_item_id uuid not null references public.item_catalog (id),
  quantity int not null default 1,
  state text not null default 'normal',
  acquired_at timestamptz not null default now(),
  metadata_json jsonb default '{}'::jsonb
);

create index inventory_items_household_idx on public.inventory_items (household_id);

create table public.character_equipment (
  character_id uuid not null references public.characters (id) on delete cascade,
  slot text not null check (slot in ('hair', 'outfit', 'hat', 'accessory')),
  inventory_item_id uuid references public.inventory_items (id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key (character_id, slot)
);

-- =========================================================
-- 8. spaces / stores / space_items / space_visits / guestbook
-- =========================================================
create table public.spaces (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('cabin', 'deck', 'store', 'mess', 'shipping', 'jewelry', 'hall')),
  household_id uuid references public.households (id) on delete cascade,
  store_id uuid, -- FK added after stores table exists
  slug text unique,
  name text not null,
  owner_user_id uuid references public.profiles (id),
  background_asset text,
  promo_text text,
  metadata jsonb default '{}'::jsonb
);

create table public.stores (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  owner_user_id uuid references public.profiles (id),
  space_id uuid references public.spaces (id),
  promo_text text,
  status text not null default 'active',
  metadata jsonb default '{}'::jsonb
);

alter table public.spaces
  add constraint spaces_store_fk foreign key (store_id) references public.stores (id) on delete set null;

create unique index spaces_household_cabin_idx on public.spaces (household_id) where type = 'cabin';

create table public.space_items (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces (id) on delete cascade,
  inventory_item_id uuid references public.inventory_items (id) on delete set null,
  catalog_item_id uuid references public.item_catalog (id),
  x numeric(6, 4) not null default 0.5,
  y numeric(6, 4) not null default 0.5,
  scale numeric(6, 4) not null default 1,
  rotation numeric(6, 2) not null default 0,
  flip_x boolean not null default false,
  z_index int not null default 0,
  metadata jsonb default '{}'::jsonb
);

create index space_items_space_idx on public.space_items (space_id);

create table public.space_visits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  space_id uuid not null references public.spaces (id) on delete cascade,
  visited_on date not null,
  created_at timestamptz not null default now(),
  unique (user_id, space_id, visited_on)
);

create table public.guestbook_entries (
  id uuid primary key default gen_random_uuid(),
  cabin_space_id uuid not null references public.spaces (id) on delete cascade,
  author_user_id uuid not null references public.profiles (id),
  body text not null check (char_length(body) between 1 and 300),
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index guestbook_entries_cabin_idx on public.guestbook_entries (cabin_space_id, created_at desc);

-- =========================================================
-- 9. attendance / mission_catalog / mission_progress
-- =========================================================
create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  date date not null,
  type text not null check (type in ('app', 'kakao')),
  resource_id text,
  created_at timestamptz not null default now(),
  unique (user_id, date, type)
);

create table public.mission_catalog (
  key text primary key,
  cadence text not null check (cadence in ('daily', 'weekly')),
  title text not null,
  description text,
  target int not null default 1,
  reward numeric(10, 2) not null default 0,
  active boolean not null default true,
  sort_order int not null default 0
);

create table public.mission_progress (
  user_id uuid not null references public.profiles (id) on delete cascade,
  mission_key text not null references public.mission_catalog (key),
  period_key text not null,
  progress int not null default 0,
  completed boolean not null default false,
  rewarded boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, mission_key, period_key)
);

-- =========================================================
-- 10. fishing_sessions / fishing_loot
-- =========================================================
create table public.fishing_sessions (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  started_by uuid references public.profiles (id),
  duration_hours int not null check (duration_hours in (4, 8)),
  state text not null default 'running' check (state in ('running', 'claimed')),
  started_at timestamptz not null default now(),
  ends_at timestamptz not null,
  claimed_at timestamptz,
  seed text not null,
  loot_table_version int not null default 1
);

create unique index fishing_sessions_one_running_per_household
  on public.fishing_sessions (household_id) where state = 'running';

create table public.fishing_loot (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.fishing_sessions (id) on delete cascade,
  catalog_item_id uuid references public.item_catalog (id),
  quantity int not null default 1,
  action_taken text,
  created_at timestamptz not null default now()
);

-- =========================================================
-- 11. store_products / store_work_logs / restaurant_orders
-- =========================================================
create table public.store_products (
  store_id uuid not null references public.stores (id) on delete cascade,
  catalog_item_id uuid not null references public.item_catalog (id) on delete cascade,
  sort_order int not null default 0,
  active boolean not null default true,
  primary key (store_id, catalog_item_id)
);

create table public.store_work_logs (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  task_key text not null,
  reward numeric(10, 2) not null,
  reward_item_id uuid references public.item_catalog (id),
  work_date date not null,
  completed_at timestamptz not null default now()
);

create unique index store_work_logs_daily_idx on public.store_work_logs (store_id, user_id, work_date);

create table public.restaurant_orders (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  user_id uuid references public.profiles (id),
  menu_key text not null,
  cost numeric(10, 2) not null,
  reward_item_id uuid references public.item_catalog (id),
  pity_count int not null default 0,
  created_at timestamptz not null default now()
);

-- =========================================================
-- 12. chat_messages / posts / store_applications
-- =========================================================
create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  nickname_snapshot text not null,
  body text not null check (char_length(body) between 1 and 500),
  mentions text[] not null default '{}',
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index chat_messages_created_idx on public.chat_messages (created_at desc);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('notice', 'suggestion', 'event')),
  author_user_id uuid references public.profiles (id),
  title text not null,
  body text,
  status text default 'open',
  admin_reply text,
  start_at timestamptz,
  end_at timestamptz,
  image_asset text,
  reward_json jsonb,
  pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.store_applications (
  id uuid primary key default gen_random_uuid(),
  applicant_user_id uuid references public.profiles (id),
  store_name text not null,
  business_type text,
  intro text,
  desired_theme text,
  status text not null default 'pending',
  admin_note text,
  created_at timestamptz not null default now()
);

-- =========================================================
-- 13. couple_events / hall_of_fame / notifications
-- =========================================================
create table public.couple_events (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  type text not null check (type in ('ring_purchase', 'marriage_request', 'marriage_complete')),
  status text not null default 'pending',
  payload jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table public.hall_of_fame (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references public.households (id) on delete cascade,
  category text not null,
  title text not null,
  description text,
  occurred_at timestamptz not null default now(),
  metadata jsonb default '{}'::jsonb
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  read_at timestamptz,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index notifications_user_idx on public.notifications (user_id, created_at desc);

-- =========================================================
-- 14. kakao_webhook_receipts (dedupe)
-- =========================================================
create table public.kakao_webhook_receipts (
  resource_id text primary key,
  received_at timestamptz not null default now(),
  payload_json jsonb
);
