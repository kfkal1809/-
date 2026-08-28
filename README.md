# 해기사와 연인들의 항해일지 (해연결 항해일지)

해연결 단톡방 구성원과 그 연인들을 위한 폐쇄형 2D 생활 웹게임. Next.js(App Router) + Supabase + Vercel.

기획서 전문은 개발 시작 시 전달된 통합 개발기획서를 기준으로 하며, 구현 순서는 기획서 10장의 스프린트 순서(골격 → 꾸미기 → 소셜 → 게임경제 → 커플/외부연동 → QA)를 그대로 따른다.

## 현재 진행 상태

### Sprint 1 — 골격 (완료)

- [x] Next.js App Router + TypeScript + Tailwind 스캐폴딩
- [x] 디자인 토큰 (맑은 파스텬: 하늘/아쿠아/크림 배경, 코랄/민트/골드 포인트, 딥네이비 텍스트, 스카이블루 NEW)
- [x] 커스텀 2D 캐릭터 아트 시스템 (`components/character/CharacterSprite.tsx`) — 2.3~2.5등신, 점눈, 해녀는 청멜빵 기본복
- [x] 커스텀 파스텔 아이콘 세트 (이모지 미사용, `components/icons/GameIcon.tsx`)
- [x] Supabase 스키마 34개 테이블 + RLS (`supabase/migrations/`) + Seed (`supabase/seed.sql`)
- [x] 선용금 원장 RPC (`apply_wallet_transaction`, idempotency 보장, service_role 전용)
- [x] 카카오 로그인 → 온보딩(캐릭터/관계/파트너/새싹) → 완료(웰컴그랜트 $20) 전체 플로우
- [x] 홈 화면 (기획서 A-5/2.3 레이아웃 그대로: 선용금/출석카드/나의 항해 정보/이벤트 한 줄/3x3 메뉴/고정 하단탭)
- [x] 공지/건의/이벤트/입점신청/명예의 전당/승선확인증/지갑/알림 — 실데이터 연동

### Sprint 2 — 꾸미기 (완료)

- [x] 옷/헤어/모자/소품 4종 실루엣 확장 (원피스/맨투맨/잠옷/후드) 및 아이템→외형 매핑 테이블
- [x] 캐릭터 꾸미기 화면(`/character/[id]/customize`) — 가방에서 아이템을 골라 즉시 착용, `character_equipment` + `appearance_json` 서버 반영
- [x] 공동 선실 자유배치 편집기(`/cabin/edit`) — 드래그 이동/회전/크기/좌우반전/앞뒤순서/가방으로 회수, 서버 소유권 검증 후 저장
- [x] 가방에서 바로 착용·배치로 연결되는 액션 버튼
- [x] Supabase 미연결 상태에서 500 대신 빈 상태로 표시되도록 전체 서버 페이지 점검 (`lib/supabase/safeQuery.ts`)

### Sprint 3 — 소셜 (완료)

- [x] 갑판 Presence — Supabase Realtime presence 채널(`deck:main`)로 현재 접속자 캐릭터를 실시간 표시
- [x] 갑판 실시간 채팅 — `chat_messages` INSERT를 postgres_changes로 구독, 전송은 RLS로 보호된 브라우저 클라이언트 직접 insert
- [x] @멘션 자동완성 — 현재 접속자 닉네임 기준 필터링, 캐릭터 클릭 시 승선확인증/태그 액션
- [x] `chat_messages`를 Realtime publication에 추가하는 마이그레이션(`0004_realtime.sql`)

### Sprint 4 — 게임경제 (완료)

- [x] 자동낚시(4h/8h) — 서버 시간 기준 완료 판정, 조건부 UPDATE로 결과 reroll 방지, 지속시간별 가중치 loot 테이블
- [x] 낚시 결과 액션 — 판매/조리하기(생선→회·구이·탕·해물모둠 등)/분실물 복원(해남이 쪽지·깜짝 용돈·사진 조각·복원한 휴대폰)
- [x] 선내식당 주문 — 3단계 메뉴, 10회 올클리어 시 희귀 이상 보장(pity), 원자적 차감+지급
- [x] 가게 알바(본뿌리/리리양곱창) — 3~5탭 미니 인터랙션, 하루 1회 제한(DB unique 제약), 낮은 확률 테마 소품
- [x] 본뿌리 상품 구매 — store_products 진열 검증 후 차감+지급, 선실 배치 가능

### Sprint 5 — 커플/외부연동 (완료)

- [x] 커플링 구매(귀금속점) → 혼인신고서 구매(귀금속점에서 반지 보유 확인) → 양쪽 서명 →
  자동으로 명예의 전당 등재까지 실제 동작하는 플로우로 구현(`app/api/jewelry/buy-ring`,
  `app/api/marriage/{buy-document,sign}`, `components/marriage/MarriageFlow.tsx`)
- [x] 공동금고(선내 외화이자) — 지갑 페이지 방문 시 하루 1회, 잔액의 0.5%($0.1~$3)를 자동
  적립(`lib/game/interest.ts`, idempotency_key로 중복 지급 방지)
- [x] 환율 재미요소 — "오늘의 선상 환율" 표시(`lib/game/fxRate.ts`, 날짜 시드 기반 결정적
  값, `fx_rates` 테이블에 하루 1건 지연 삽입, 실제 외부 API 호출 없음)
- [x] 카카오톡 공유 출항 인증 — Kakao Share SDK로 해연결방에 카드 공유 → 카카오 공유
  성공 웹훅에서 Authorization/X-Kakao-Resource-ID/CHAT_TYPE/HASH_CHAT_ID/서명된 nonce를
  검증 후 +$1 지급(`app/api/attendance/kakao/{nonce,webhook}`, `lib/kakao/shareAuth.ts`).
  실제 카카오 디벨로퍼스 앱 등록·웹훅 URL 등록은 사용자가 직접 해야 함(계정 필요).

### 캐릭터 실제 일러스트 적용 (완료, 커스터마이징 반영은 다음 단계)

- [x] 사용자 제공 "기본 캐릭터 얼굴 및 체형" 8장(해녀/해남/새싹 6종)을 크롭해
  `public/images/character/base/*.png`로 저장, `CharacterSprite`가 `kind`/`childGender`/
  `childStage`를 받으면 실제 일러스트를 그리도록 교체(값이 없으면 기존 벡터로 폴백)
- [x] 오프닝/홈/선실/갑판 Presence/항해일지/승선확인증/캐릭터 커스터마이즈/온보딩 폼까지
  캐릭터가 나오는 모든 화면에 실제 일러스트 반영
- [ ] 사용자가 보내준 헤어/의상 낱개 90장(`public/images/character/{haenyeo,haenam,
  child}/{hair,outfit}/*.png`)을 기본 체형 위에 얹어, 사용자가 커스터마이즈 화면에서 고른
  헤어/의상이 실제로 반영되게 하기 (지금은 kind+성별+연령대가 같으면 다 같은 그림)

### 다음 — Sprint 6 (QA/PWA)

- [ ] 반응형/PWA 설치/알림/테스트/관리자/모니터링은 아직 스텁 상태

## 로컬 개발

```bash
npm install
cp .env.example .env.local   # Supabase/Kakao 값 채우기
npm run dev
```

Supabase 프로젝트가 아직 연결되지 않은 상태에서도 홈/온보딩 등 주요 화면은 데모 데이터로 렌더링됩니다.

### Supabase 스키마 적용

```bash
supabase link --project-ref <project-ref>
supabase db push          # supabase/migrations/*.sql 적용
supabase db execute -f supabase/seed.sql
```

Kakao 로그인은 Supabase Auth의 Kakao Provider를 사용합니다. Supabase 대시보드에서 Kakao REST API Key / Client Secret을 등록하고 Redirect URL을 `<APP_URL>/auth/callback`으로 설정하세요.

### 필요 환경변수

`.env.example` 참고 (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, Kakao 관련 키 등).

## 배포

Vercel에 저장소를 연결하고 위 환경변수를 프로젝트 설정에 등록하면 자동 배포됩니다.

## 폴더 구조

```
app/                 App Router 페이지 (public/onboarding/game/api)
components/          character, icons, home, cabin, onboarding, inventory, ui 등
lib/domain/          도메인 타입/상수/캐릭터 프리셋
lib/game/            서버 데이터 조회 헬퍼 (KST, 지갑/선실/인벤토리/항해 데이터)
lib/supabase/        브라우저/서버/서비스 클라이언트
supabase/migrations/ DB 스키마 + RLS
supabase/seed.sql    NPC/가게/아이템/미션 초기 데이터
```
