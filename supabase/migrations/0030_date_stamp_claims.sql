-- 해남·해녀 데이트 콘텐츠 4: 데이트 스탬프판 올클리어 보너스.
-- 하루 동안 데이트 스탬프 6종(대화 주제 카드/선물/인증샷 + 낚시/갑판/선내식당 일일미션)을
-- 모두 채우면 household 단위로 하루 1회 추가 보너스를 받는다. 개별 스탬프 상태는
-- date_topic_card_logs/date_gift_logs/date_photos/mission_progress/restaurant_orders에서
-- 그때그때 계산하므로(lib/game/dateStampData.ts), 이 테이블은 "올클리어 보너스를 오늘
-- 이미 받았는지" 게이트만 담당한다.
create table public.date_stamp_claims (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  reward numeric(10, 2) not null,
  claim_date date not null,
  created_at timestamptz not null default now()
);
create unique index date_stamp_claims_daily_idx on public.date_stamp_claims (household_id, claim_date);

alter table public.date_stamp_claims enable row level security;

create policy date_stamp_claims_select on public.date_stamp_claims
  for select using (public.is_household_member(household_id) or public.is_admin());
