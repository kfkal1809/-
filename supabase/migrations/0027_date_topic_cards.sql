-- 해남·해녀 데이트 콘텐츠 1: 대화 주제 카드 뽑기.
-- 하루 1회 household(커플) 단위로 대화 주제 카드를 뽑아 완료하면 소정의 선용금 보상을 받는다.
-- 카드 문구 자체는 store_work_logs의 BONPPURI_WORK_TASKS/LIRI_WORK_TASKS와 동일하게
-- lib/domain/constants.ts(DATE_TOPIC_CARDS)에 정적 배열로 관리하고, 이 테이블은
-- "하루 1회 완료" 게이트(unique index)와 지급 이력만 기록한다. store_work_logs는
-- user_id 단위(개인당 알바 1회)지만, 이건 커플이 함께 하는 활동이라 household_id 단위로 게이트한다.
create table public.date_topic_card_logs (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  card_text text not null,
  reward numeric(10, 2) not null,
  draw_date date not null,
  completed_at timestamptz not null default now()
);
create unique index date_topic_card_logs_daily_idx on public.date_topic_card_logs (household_id, draw_date);

alter table public.date_topic_card_logs enable row level security;

create policy date_topic_card_logs_select on public.date_topic_card_logs
  for select using (public.is_household_member(household_id) or public.is_admin());
