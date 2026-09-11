-- 해남·해녀 데이트 콘텐츠 5: 커플 한 줄 일기.
-- 선실 방명록(guestbook_entries)과 달리 다른 가구(household) 구성원에게는 보이지 않는,
-- 우리 둘만의 비공개 일기다. 하루 1인 1회(unique(author_user_id, entry_date))로 짧은
-- 한 줄을 남기고, household 구성원끼리만 서로의 글을 읽을 수 있다.
create table public.date_diary_entries (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  author_user_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 140),
  entry_date date not null,
  created_at timestamptz not null default now()
);
create unique index date_diary_entries_daily_idx on public.date_diary_entries (author_user_id, entry_date);
create index date_diary_entries_household_idx on public.date_diary_entries (household_id, created_at desc);

alter table public.date_diary_entries enable row level security;

create policy date_diary_entries_select on public.date_diary_entries
  for select using (public.is_household_member(household_id) or public.is_admin());
