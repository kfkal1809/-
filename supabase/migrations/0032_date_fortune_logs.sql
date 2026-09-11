-- 해남·해녀 데이트 콘텐츠 6: 오늘의 운세.
-- date_topic_card_logs와 완전히 동일한 구조 — household 단위 하루 1회, 오늘 뽑은 운세
-- 문구를 기록하고 소액 선용금 보상을 지급한다. 커플이 함께 보는 콘텐츠라 household_id
-- 단위로 게이트한다.
create table public.date_fortune_logs (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  fortune_text text not null,
  reward numeric(10, 2) not null,
  fortune_date date not null,
  created_at timestamptz not null default now()
);
create unique index date_fortune_logs_daily_idx on public.date_fortune_logs (household_id, fortune_date);

alter table public.date_fortune_logs enable row level security;

create policy date_fortune_logs_select on public.date_fortune_logs
  for select using (public.is_household_member(household_id) or public.is_admin());
