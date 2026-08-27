-- 낚시 실시간 연출 + 타이밍 미니게임(기획서 3.12/3.13 확장, 사용자 피드백):
-- 예전엔 세션 종료 시점에 로또처럼 한 번에 개수를 뽑았는데(4시간 2~4개, 8시간 5~8개 —
-- 대략 1~2시간에 한 개꼴), (1) 너무 뜸해서 지루하다, (2) 낚시 중에 실시간으로 하나씩
-- 잡히는 연출이 있으면 좋겠다, (3) 잡히는 순간 터치 타이밍 미니게임으로 보너스를 노릴 수
-- 있으면 좋겠다는 요청 — 세 가지를 모두 해결하려면 "언제 무엇이 잡히는지"를 세션 시작
-- 시점에 미리 정해두고 저장해야, 화면에 실시간으로 하나씩 보여주면서도 나중에 claim할 때
-- 클라이언트가 몰래 결과를 조작할 여지가 없다(서버가 시작 시점에 이미 확정한 스케줄을
-- 그대로 사용, 미니게임 성공분만 보너스로 추가).
alter table public.fishing_sessions
  add column if not exists scheduled_loot jsonb not null default '[]'::jsonb,
  add column if not exists tap_bonus_indices integer[] not null default '{}'::integer[];

comment on column public.fishing_sessions.scheduled_loot is
  '세션 시작 시점에 확정한 [{"catalogItemId": uuid, "offsetMinutes": number}, ...] — claim 때 이 목록을 그대로 지급한다.';
comment on column public.fishing_sessions.tap_bonus_indices is
  '실시간 타이밍 미니게임을 성공한 scheduled_loot 인덱스 목록 — claim 때 해당 항목을 1개씩 추가로 더 지급한다.';
