-- 커플 버킷리스트. household 공유 체크리스트로, 누구나 추가/완료토글/삭제할 수 있다
-- (선물/일기와 달리 하루 1회 같은 게이트가 없는 상시 리스트).
create table public.date_bucket_list_items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  text text not null check (char_length(text) between 1 and 100),
  completed boolean not null default false,
  created_by uuid not null references public.profiles (id) on delete cascade,
  completed_by uuid references public.profiles (id) on delete set null,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);
create index date_bucket_list_items_household_idx on public.date_bucket_list_items (household_id, created_at desc);

alter table public.date_bucket_list_items enable row level security;

create policy date_bucket_list_items_select on public.date_bucket_list_items
  for select using (public.is_household_member(household_id) or public.is_admin());
