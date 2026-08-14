# 해기사와 연인들의 항해일지 (해연결 항해일지)

해연결 단톡방 구성원과 그 연인들을 위한 폐쇄형 2D 생활 웹게임. Next.js(App Router) + Supabase + Vercel.

기획서 전문은 개발 시작 시 전달된 통합 개발기획서를 기준으로 하며, 구현 순서는 기획서 10장의 스프린트 순서(골격 → 꾸미기 → 소셜 → 게임경제 → 커플/외부연동 → QA)를 그대로 따른다.

## 현재 진행 상태 — Sprint 1 (골격)

- [x] Next.js App Router + TypeScript + Tailwind 스캐폴딩
- [x] 디자인 토큰 (맑은 파스텬: 하늘/아쿠아/크림 배경, 코랄/민트/골드 포인트, 딥네이비 텍스트, 스카이블루 NEW)
- [x] 커스텀 2D 캐릭터 아트 시스템 (`components/character/CharacterSprite.tsx`) — 2.3~2.5등신, 점눈, 해녀는 청멜빵 기본복
- [x] 커스텀 파스텔 아이콘 세트 (이모지 미사용, `components/icons/GameIcon.tsx`)
- [x] Supabase 스키마 34개 테이블 + RLS (`supabase/migrations/`) + Seed (`supabase/seed.sql`)
- [x] 선용금 원장 RPC (`apply_wallet_transaction`, idempotency 보장, service_role 전용)
- [x] 초대코드 → 카카오 로그인 → 온보딩(캐릭터/관계/파트너/새싹) → 완료(웰컴그랜트 $20) 전체 플로우
- [x] 홈 화면 (기획서 A-5/2.3 레이아웃 그대로: 선용금/출석카드/나의 항해 정보/이벤트 한 줄/3x3 메뉴/고정 하단탭)
- [x] 공동 선실(읽기 + 방명록), 가방(인벤토리 실데이터), 항해일지(D+/D- 계산 + 수정)
- [x] 공지/건의/이벤트/입점신청/명예의 전당/승선확인증/지갑/알림 — 실데이터 연동
- [ ] 갑판 실시간 채팅, 자동낚시, 가게 알바/구매, 커플링/혼인신고 — 다음 스프린트에서 기능 구현 (현재는 UI 자리만 확보된 스텁)

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
