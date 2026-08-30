-- household_users의 기본키는 (household_id, user_id) 복합키라 household_id 없이
-- user_id만으로 "내 household 찾기"를 조회하면(홈/선실/캐릭터 꾸미기 등 거의 모든 화면
-- 진입 시 실행되는 조회) 인덱스를 못 타고 순차 스캔이 된다. user_id 단독 인덱스를 추가한다.
create index if not exists household_users_user_idx on public.household_users (user_id);

-- character_managers도 기본키가 (character_id, user_id) 복합키인데, "내가 관리하는
-- 캐릭터 찾기"(갑판/메뉴/승선확인증 등 거의 모든 화면에서 반복되는 조회)는 user_id만으로
-- 필터링한다 — 마찬가지로 인덱스를 못 타므로 user_id 단독 인덱스를 추가한다.
create index if not exists character_managers_user_idx on public.character_managers (user_id);
