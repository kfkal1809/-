-- 해녀/해남 각자의 생일을 기록해 D-day를 보여주기 위한 컬럼. household 단위인
-- dating_started_at/wedding_anniversary_at과 달리 생일은 사람별로 다르므로 characters에 둔다.
alter table public.characters
  add column birthday date;
