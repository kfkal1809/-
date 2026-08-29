-- 초대코드(가입 게이트) 제거 이후, 두 사람이 같은 household로 합쳐질 방법이 없어진 문제를
-- 고치기 위한 마이그레이션. 예전엔 "파트너 초대코드"로 온보딩 중인 사용자를 기존
-- household/캐릭터에 연결했는데, 그 가입 게이트 자체를 없애면서 이 연결 경로도 같이
-- 없어졌다(온보딩 "상대 캐릭터도 만들어요"에서 만든 managed_only 플레이스홀더 캐릭터를
-- 실제 상대가 넘겨받을 방법이 없었음).
--
-- household마다 짧은 "연결 코드"를 하나 발급해서, 아직 household가 없는 신규 가입자가
-- 그 코드를 입력하면(온보딩 맨 앞 /onboarding/join) 같은 household로 들어가고, 상대가
-- 미리 만들어둔 managed_only 플레이스홀더 캐릭터를 그대로 넘겨받게 한다
-- (app/api/onboarding/join-household, app/api/onboarding/character 참고).
alter table public.households
  add column if not exists join_code text
  default upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 6));

-- 기존 household에도 코드를 하나씩 채워준다(대문자+숫자 6자리, 8글자 hex 앞부분 사용 —
-- 이 시점엔 각 household가 유니크한 gen_random_uuid()를 이미 갖고 있으니 그 앞 6글자를
-- 대문자로 써서 별도 충돌 검사 없이 간단히 채운다).
update public.households
set join_code = upper(substring(replace(id::text, '-', '') from 1 for 6))
where join_code is null;

alter table public.households
  alter column join_code set not null;

alter table public.households
  add constraint households_join_code_unique unique (join_code);

create index if not exists households_join_code_idx on public.households (join_code);
