-- 미션 보상 수령 + 우편함(운영자 보상 지급) 기능
-- =========================================================
-- 1. mission_progress.metadata — cabin_visit5(서로 다른 선실 5곳)/deck_visit4(서로 다른 4일 갑판)처럼
--    "distinct set" 카운트가 필요한 미션을 위해 방문한 항목의 키를 배열로 기록한다.
--    (progress 컬럼은 그대로 두고, metadata.seen의 길이를 progress로 동기화해서 쓴다)
-- =========================================================
alter table public.mission_progress
  add column metadata jsonb not null default '{}'::jsonb;

-- =========================================================
-- 2. mailbox_items — 운영자가 특정 가구(household)에 보상(현금/아이템)을 보내고,
--    가구 구성원이 수령(claim)하는 우편함. 지갑/인벤토리와 동일하게 household 단위로 스코프.
--    쓰기는 서비스 롤(관리자 API)에서만 수행하고, 일반 사용자는 읽기 + 서버 경유 claim만 가능.
-- =========================================================
create table public.mailbox_items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  title text not null,
  body text,
  cash_reward numeric(10, 2) not null default 0,
  catalog_item_id uuid references public.item_catalog (id),
  item_quantity int not null default 1,
  created_by uuid references public.profiles (id),
  claimed_at timestamptz,
  claimed_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

create index mailbox_items_household_idx on public.mailbox_items (household_id, claimed_at);

alter table public.mailbox_items enable row level security;

create policy mailbox_items_select on public.mailbox_items
  for select using (public.is_household_member(household_id) or public.is_admin());
