-- 해남·해녀 데이트 콘텐츠 2: 선물 보내기.
-- 하루 1회, 로그인한 사용자 본인 기준으로(파트너 각자 하루 1회) 기존 우편함(mailbox_items)
-- 인프라를 통해 파트너에게 다정한 메시지 + 작은 선용금 선물을 보낸다. mailbox_items 자체는
-- household 단위 공유함이라 발신자 구분이 없으므로, 이 테이블이 "누가/언제 보냈는지" +
-- "하루 1회 발신" 게이트(unique(sender_user_id, send_date))를 담당한다. store_work_logs와
-- 마찬가지로 household 전체가 아니라 sender_user_id별로 게이트해서, 커플이 각자 하루
-- 한 번씩 서로에게 선물을 보낼 수 있다(대화 주제 카드 date_topic_card_logs는 household
-- 단위 공동 활동이라 반대로 household_id로 게이트했던 것과 대비됨).
create table public.date_gift_logs (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  sender_user_id uuid not null references public.profiles (id) on delete cascade,
  message text not null,
  mailbox_item_id uuid references public.mailbox_items (id) on delete set null,
  send_date date not null,
  created_at timestamptz not null default now()
);
create unique index date_gift_logs_daily_idx on public.date_gift_logs (sender_user_id, send_date);

alter table public.date_gift_logs enable row level security;

create policy date_gift_logs_select on public.date_gift_logs
  for select using (public.is_household_member(household_id) or public.is_admin());
