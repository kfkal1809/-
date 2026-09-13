-- 항해일지에 커플 기념일(연애 시작일/결혼기념일)을 기록할 수 있게 households에 컬럼 추가.
-- 기존 voyages 테이블(승선/하선)은 배를 타는 항해 사이클마다 새로 쌓이는 기록이라 영구적인
-- 커플 기념일과는 성격이 달라서, household 단위로 딱 하나만 있으면 되는 이 두 날짜는
-- households 테이블에 직접 둔다. 게임 내 혼인신고서 서명 완료일(households.game_married_at)과도
-- 별개다 — 실제 결혼기념일은 유저가 직접 입력하는 값으로, 인게임 혼인신고 이벤트 날짜와
-- 다를 수 있다.
alter table public.households
  add column dating_started_at date,
  add column wedding_anniversary_at date;
