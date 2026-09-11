-- 해남·해녀 데이트 콘텐츠 3: 데이트 스팟 인증샷.
-- 하루 1회 household(커플) 단위로 기존 배경(deck/fishing/jewelry 등) 중 하나를 골라
-- 해녀+해남 캐릭터를 합성한 "인증샷"을 저장하고 소정의 선용금 보상을 받는다.
-- date_topic_card_logs와 동일하게 커플이 함께 하는 활동이라 household_id 단위로 게이트한다.
-- 실제 이미지를 서버에서 합성/저장하지 않고 bg_id만 기록해서, 볼 때마다
-- 캐릭터 현재 외형 + 배경을 그대로 다시 렌더링하는 방식(승선확인증 등 기존 화면과 동일하게
-- 스냅샷을 남기지 않고 항상 "현재" 모습을 보여준다).
create table public.date_photos (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  bg_id text not null,
  taken_by uuid not null references public.profiles (id) on delete cascade,
  reward numeric(10, 2) not null,
  photo_date date not null,
  created_at timestamptz not null default now()
);
create unique index date_photos_daily_idx on public.date_photos (household_id, photo_date);

alter table public.date_photos enable row level security;

create policy date_photos_select on public.date_photos
  for select using (public.is_household_member(household_id) or public.is_admin());
