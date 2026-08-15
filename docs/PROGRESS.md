# 진행 상황 기록 (세션이 끊겨도 여기서 이어감)

마지막 갱신: 작업 중 (Stage 2 — 낚시/가구/본뿌리 아이콘 적용 완료, 사용자가 헤어/의상
투명 레이어를 직접 그려서 전달 예정 — 그 전까지 다른 Stage 2 항목 계속 진행 중)

## 지금까지 완료된 큰 단위

- **Sprint 1~4** (골격/꾸미기/소셜/게임경제): 전부 완료, 커밋됨. 상세는 `README.md` 상단 참고.
- **회사명 변경**: `(주)해녀쉽핑` → `(주)해녀해운` 전체 반영 완료 (코드 전수 검색 확인함, 잔여 없음).
- **디자인 에셋 Stage 1**: 완료, 커밋/푸시됨.
- **지나가는 선박 랜덤 조우 이벤트 시스템**: 완료, 커밋/푸시됨.
- **Stage 2 (아이템 아이콘 적용)**: 낚시 결과물 16종 + 선실 가구 8종 + 본뿌리 꽃 7종 = 31개
  적용 완료(아래 섹션). **사용자가 캐릭터 헤어/의상 투명 레이어를 직접 그려서 전달하기로 함**
  — 도착하면 레이어 합성 작업 재개.

## 디자인 에셋 Stage 1 체크리스트

- [x] 사용자가 GitHub `design-assets/` 및 루트에 업로드한 39개 원본 이미지를 `public/images/`로 정리
  (`icons/`, `npcs/`, `backgrounds/`, `misc/`, `rings/`, `reference-sheets/`)
- [x] 게임 아이콘 19종 — `게임아이콘.png` 그리드에서 배경 제거 후 개별 크롭 → `GameIcon.tsx`를
      SVG 벡터에서 실제 이미지(`<Image>`)로 교체. 기존 컴포넌트 API(name/size/className/withBadge)는
      그대로 유지해 호출부 무변경.
- [x] NPC 4명(아랍/두부/마미/리리) 초상화 적용 — `SpaceStub`이 `npcAppearance`(벡터) 대신
      `npcId`(이미지 경로) prop을 받도록 변경. shipping 페이지는 SpaceStub 재사용하도록 리팩터링.
- [x] 공간 배경 7곳 적용 (갑판/명예의전당/(주)해녀해운 사무실/본뿌리/리리양곱창/선내식당/귀금속점)
      — `SpaceStub`에 `bgId` prop 추가, deck/jewelry/hall-of-fame은 개별 페이지에서 직접 배경 삽입.
- [x] 앱 아이콘/파비콘 — 기존 `ImageResponse` 동적 생성 방식(app/icon.tsx 등) 제거,
      실제 디자인 이미지를 정적 파일(`app/icon.png`, `app/apple-icon.png`, `public/icons/icon-192.png`,
      `public/icons/icon-512.png`)로 교체.
- [x] 커플링 3종 — `커플링 디자인.png`에서 개별 크롭(`public/images/rings/`) → 귀금속점 페이지에
      실제 반지 이미지 표시.
- [x] 혼인신고서 — 실제 디자인 이미지를 `/marriage` 페이지에 미리보기로 적용.
- [x] 승선확인증 카드 — 실제 데이터가 들어가야 해서(이름/역할/D+/D- 등) 이미지를 그대로 쓰지 않고,
      시안을 참고해 CSS로 재구현(남색 컷코너 보더, 닻 장식, 점선 구분선, 붉은 스탬프, 크림 배경).
- [x] 앱 로고 워드마크(`logo-wordmark.png`)를 오프닝 화면(`app/page.tsx`)과 홈 화면 헤더에 적용
- [x] 홈 화면을 실제 UI 목업(`home-mockup.png`)에 맞춰 재작업 — 로고 헤더 + 선용금 카드,
      "나의 항해 정보" 리본배너 카드(출항하기 버튼을 카드 모서리로 통합), 진행중 이벤트 줄에 캘린더 아이콘,
      기능 메뉴를 3x3 그리드에서 가로 스크롤 1행으로 변경(목업과 동일한 배치). `AttendanceCard`는
      `VoyageInfoCard`에 흡수 통합하고 삭제함(중복 컴포넌트 제거).
- [x] Stage 1 전체 build/lint 통과 확인 + Playwright 스크린샷으로 시안과 실제 비교
      (오프닝/홈/귀금속점/혼인신고/갑판/(주)해녀해운/선내식당/본뿌리/리리양곱창 — 전부 정상 렌더,
      콘솔 에러 없음, 회사명 리네임 반영 확인)

## 지나가는 선박 랜덤 조우 이벤트 시스템 (완료)

- **데이터 스키마**: `supabase/migrations/0005_ship_events.sql`의 `ship_events` 테이블
  (household_id, event_date, slot_index, ship_type_key, spawned_at, expires_at, status,
  reward_cash, reward_catalog_item_id, reward_item_qty). RLS는 읽기만 허용, 생성/판정은
  service_role 서버 라우트 전용(기존 fishing_sessions 패턴과 동일).
- **선종 7종 설정**: `lib/domain/shipEvents.ts`의 `SHIP_TYPES` 배열 하나로 전부 관리(스폰
  가중치 container=25/bulk=20/tanker=18/car_carrier=15/chemical=10/lng=8/vlcc=4 = 합 100,
  색상, hullShape, 현금 보상 범위, 아이템 드랍 확률, 카탈로그 subcategory). 코드 어디에도
  선종별 if/switch 분기가 없고, 스폰·보상·렌더링 로직은 전부 이 설정을 데이터로 읽는다.
- **스케줄링**: 크론 없이 폴링 시점에 lazy-spawn. `lib/game/shipEventEngine.ts`가
  household+날짜 시드 기반 결정적 랜덤으로 하루 스폰 횟수(2~3회)와 각 슬롯 시간(09~23시
  KST, 최소 90분 간격)을 계산하고, 폴링 때 그 시각이 지났으면 그 자리에서 1건만 생성한다.
  같은 선종이 연달아 나오지 않도록 직전 스폰 선종을 제외하고 가중치 뽑기.
- **API**: `/api/ship-events/status`(GET, 폴링·lazy-spawn), `/api/ship-events/claim`(POST,
  조건부 UPDATE로 중복 수령 방지), `/api/ship-events/debug-spawn`(POST, QA 전용·운영
  빌드에서는 404). 현금 보상은 기존 `apply_wallet_transaction` RPC로, 아이템 보상은 기존
  `inventory_items` 테이블에 그대로 적립 — 새 지갑/재화 시스템을 만들지 않음.
- **논스트레스 설계**: 그레이스 기간(6시간) 동안 수령하지 않아도 사라지지 않고, 기간이
  지나면 서버가 조용히 자동 적립 후 `notifications`에 안내를 남긴다. 보상을 놓쳐도 잃지 않음.
- **보상 아이템**: `supabase/seed.sql`에 선종별 테마 아이템 14종 추가(`item_catalog`,
  subcategory=`ship_container`/`ship_bulk`/`ship_tanker`/`ship_car_carrier`/`ship_chemical`/
  `ship_lng`/`ship_vlcc`), 대부분 선실에 배치 가능한 keepsake.
- **비주얼**: `components/ships/ShipSprite.tsx` — 선종 7종을 위한 단일 제네릭 SVG
  컴포넌트(hullShape 한 값으로만 갑판 디테일 분기, 색상은 설정값). 실제 업로드 에셋이 없는
  신규 시스템이라 기존 캐릭터 스프라이트와 같은 벡터 방식 사용.
- **연출**: `components/ships/ShipEventOverlay.tsx` — `(game)` 레이아웃에 전역 마운트되어
  어느 화면에서든 보인다. 배가 수평선에서 등장해 가로지름(7초 애니메이션) → 이벤트 배너
  드롭다운 → 보상 상자가 bob 애니메이션과 함께 우하단에 고정 → 탭하면 바텀시트로 보상
  확인 후 수령. `localStorage`에 마지막으로 본 이벤트 id를 저장해, 이미 본 이벤트는
  새로고침해도 진입 애니메이션을 다시 재생하지 않고 바로 상자 상태로 보여준다.
- **QA 디버그 트리거**: 개발 빌드(NODE_ENV !== production)에서만 좌하단에 작은
  "DEV: 선박 스폰" 버튼이 보이며 즉시 스폰 가능. 운영 빌드에서는 버튼도 안 보이고
  API도 404. 서버 판정값(NODE_ENV)만으로 게이팅해 하이드레이션 불일치 없음.
- **검증**: `lib/game/shipEventEngine.ts`의 순수 함수(가중치 뽑기/스케줄/보상 범위)를
  10000회 시뮬레이션으로 분포·간격·anti-streak·보상 범위 확인 완료. 이 샌드박스에는
  Supabase가 연결되어 있지 않아 실제 스폰→수령 API 왕복은 라이브로 확인하지 못했고,
  이는 배포 후 최우선 확인 필요 사항으로 아래에 남겨둠.

## Stage 2 — reference-sheets 20장 전수 분류 결과 (중요, 다음 세션 필독)

`public/images/reference-sheets/sheet-01~21.png` (19번은 애초에 업로드되지 않아 20장만 존재)를
전부 열어 내용을 확인했다. 크게 세 종류로 나뉜다:

1. **캐릭터에 입혀서 보여주는 헤어스타일 참고 이미지** (sheet-10, 12, 14, 15 등) — 헤어가
   전부 "얼굴+헤어가 합쳐진 완성 일러스트"로만 존재하고, 투명 배경의 헤어 단독 레이어가 없다.
   유일한 예외인 sheet-20은 얼굴 없이 헤어만 있지만, 스타일이 전부 비슷한 한 가지 컷의 색상
   변형 12개일 뿐이라 기존 5~6종의 이름 붙은 헤어스타일(웨이브/포니/단발/트윈/올림머리 등)을
   대체하기엔 부족하다. **결론: 캐릭터 위에 입히는 헤어/의상 레이어 합성(당초 계획한 "Stage 2"의
   핵심)은 이 에셋만으로는 품질 있게 구현 불가능** — 벡터로 그린 머리(CharacterSprite)에 화풍이
   다른 페인터리 헤어 이미지를 얹으면 스타일이 어긋나 보임. 시도하지 않기로 결정함.
   (사용자 확인 필요: ① 헤어/의상별로 투명 배경 개별 PNG를 새로 받거나, ② CharacterSprite
   전체를 페인터리 화풍으로 다시 그리거나, ③ 레이어 합성은 포기하고 지금의 벡터 시스템 유지.)
2. **완성된 의상/모자/액세서리를 목이 없는 마네킹에 걸쳐놓은 참고 이미지** (sheet-01, 07, 08,
   09, 11, 21 등) — 개별적으로는 깔끔하게 분리돼 있지만 벡터 캐릭터에 그대로 합성하면 역시
   화풍이 어긋남. 인벤토리 카드의 "미리보기 아이콘"으로는 쓸 수 있음(사람이 착용한 게 아니라
   옷 자체만 보여주는 용도라 화풍 문제가 상대적으로 덜함) — 다음 패스 후보.
3. **아이템 자체가 결과물인 소품/가구/낚시 결과물/꽃 등** (sheet-02, 03, 04, 05, 06, 13, 15,
   16, 17 등) — 캐릭터에 입히는 게 아니라 그 자체로 UI에 노출되는 아이템이라 화풍 문제가 없고,
   `item_catalog`의 sku와 라벨이 매우 정확하게 일치한다. **적용 완료: sheet-17(낚시결과물
   16종+대게) + sheet-03(분실물 2종: 머그컵/탑승권) + sheet-16(가구 8종) + sheet-13(본뿌리
   꽃 7종) + sheet-15(새싹 의상 3종: 후드/멜빵바지/원피스, 인벤토리 미리보기용) = 총 37개**
   (아래 참고). sheet-15(새싹 마스터시트)와 sheet-18(해녀 마스터시트)도 확인했는데, 헤어는
   여기도 전부 "얼굴+헤어" 완성 일러스트라 위 1번 결론(레이어 합성 불가)이 그대로 적용됨.
   다만 새싹 시트의 "의상 아이템"/"가방·소품" 섹션은 마네킹 없이 옷만 딱 떠 있는 형태라
   인벤토리 미리보기용으로 바로 쓸 수 있었음. 미반영 상태로 다음 패스 후보로 남은 것:
   sheet-17의 복원/전설 아이템(라벨이 카탈로그 sku와 정확히 1:1 매칭되지 않아 건너뜀 — 새
   sku를 만들지, 기존 아이템에 맞출지 결정 필요), sheet-16의 나머지(현창 변형 2종/벽지 2종 —
   카탈로그에 대응 sku 없음), sheet-15의 새싹 신발/양말/가방/소품(카탈로그에 대응 sku 없음).

## 이번에 적용한 것: 낚시/가구/본뿌리 아이콘 31종

- `public/images/items/`에 31개 PNG — sheet-17(낚시 16종) + sheet-16(가구 8종:
  furniture_bed/desk/chair/shelf/fridge/rug/porthole/stand_light) + sheet-13(본뿌리 7종:
  bonppuri_season_bouquet/peony_bouquet/mini_vase/peony_vase/wedding_bouquet/
  premium_bouquet/season_deco). 좌표 기반 크롭 + 배경색 거리 기반 투명화 + 알파 bbox
  트림(Stage 1 아이콘 파이프라인과 동일 기법), 헤더 칩/패널 테두리 bleed는 좌표 미세조정으로
  대부분 제거(완전히 픽셀퍼펙트는 아니고 Stage 1과 동일한 수준의 사소한 잔여 있음).
- `lib/domain/itemIcons.ts`: sku → 이미지 경로 매핑을 화이트리스트(Set)로 관리. 목록에 없는
  sku는 자동으로 기존 희귀도 배지 플레이스홀더/기본 GameIcon으로 폴백 — 깨진 이미지가 뜨지 않음.
- `lib/game/inventoryData.ts`, `components/inventory/InventoryTabs.tsx`: 인벤토리 카드에
  실제 아이콘 표시(있으면 이미지, 없으면 기존처럼 별 배지).
- `app/api/fishing/claim/route.ts`, `components/fishing/FishingScreen.tsx`: 조업 완료 결과
  카드에도 동일하게 실제 아이콘 표시.
- `lib/game/cabinData.ts`, `lib/game/cabinEditData.ts`, `components/cabin/CabinRoom.tsx`,
  `components/cabin/CabinEditor.tsx`: 선실에 배치된 가구/가방의 "배치하기" 목록 전부 실제
  가구 이미지로 교체(기존엔 아이템 이름 앞 두 글자만 표시하던 자리).
- `lib/game/storeData.ts`, `components/store/StoreProductGrid.tsx`: 상점 진열 카드에 실제
  상품 이미지 표시(없으면 기존 GameIcon "flower"로 폴백 — liri-gopchang 등 다른 상점은 영향 없음).
- Mock 데이터로 인벤토리 탭/선실 에디터/상점 그리드를 렌더링해 아이콘·폴백 동작을 스크린샷으로
  확인함(실제 Supabase 데이터로는 이 샌드박스에 연결이 없어 끝까지 확인 못함 — 위와 동일한 한계).

## 다음에 할 일 (우선순위 순)

1. **사용자가 캐릭터 기본 체형(베이스 바디) + 헤어/의상 투명 레이어 PNG를 직접 그려서 전달
   하기로 함** — 도착 대기 중. 도착하면: (a) 벡터 CharacterSprite를 이미지 합성 방식으로
   교체, (b) 받은 베이스 체형 기준으로 헤어/의상 레이어가 들어갈 정확한 좌표를 사용자에게
   회신, (c) item_catalog의 hair/outfit/hat/accessory 아이템들과 매핑.
2. 여유가 되면 sheet-06/11(새싹 마네킹 의상 — sheet-15와 다른 앵글), 남은 가구/현창 변형 검토
3. sheet-17의 복원/전설 아이템, sheet-16의 현창 변형/벽지 — 새 item_catalog sku 추가할지
   여부 사용자 확인 필요

## 확인이 필요했지만 진행을 막지 않고 넘어간 것들 (나중에 사용자 확인용)

- 아이콘 크롭 시 일부(특히 `deck`)는 원본 일러스트 자체에 하늘색 배경이 포함되어 있어 완전
  투명 배경으로 만들지 못했음 — 다른 아이콘과 톤이 살짝 다르게 보일 수 있음. 필요시 재요청.
- 승선확인증은 이미지 그대로 쓰지 않고 CSS로 재구현한 것이 맞는 방향인지 확인 필요
  (동적 데이터 때문에 불가피했다고 판단했음).
- 혼인신고서는 아직 실제 입력/서명 기능 없이 이미지 미리보기 + 안내문구만 있음 (원래도 스텁이었음,
  Sprint 5에서 실제 기능 예정).
- 선박 스프라이트는 실제 업로드된 일러스트가 없어 다른 시스템(캐릭터)과 같은 벡터 SVG로
  제작함 — 나중에 사용자가 실제 선박 일러스트를 주면 `ShipSprite` 자리를 이미지로 교체 가능.
- 선박 이벤트의 실시간 스폰→수령 전 과정은 이 환경에 Supabase가 연결되어 있지 않아
  브라우저로 끝까지 실행해보지 못했음(로직은 시뮬레이션으로 검증). 실제 배포 환경에서
  1순위로 확인 필요.

## 알려진 기술 부채 / TODO

- `lib/domain/characterPresets.ts`의 `NPC_APPEARANCE`는 이제 어디서도 안 쓰임(NPC가 실사진으로
  교체됨) — 삭제하지 않고 유지 중 (Stage 2에서 캐릭터 커스터마이즈 미리보기 등에 재사용 가능성).
