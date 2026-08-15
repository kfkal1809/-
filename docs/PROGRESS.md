# 진행 상황 기록 (세션이 끊겨도 여기서 이어감)

마지막 갱신: 작업 중 (사용자가 캐릭터 베이스 체형 + 헤어/의상 그림을 준비해서 전달 예정 —
그 사이 Sprint 5(커플/외부연동)의 카카오 연동을 뺀 나머지 전부 완료함)

## 지금까지 완료된 큰 단위

- **Sprint 1~4** (골격/꾸미기/소셜/게임경제): 전부 완료, 커밋됨. 상세는 `README.md` 상단 참고.
- **회사명 변경**: `(주)해녀쉽핑` → `(주)해녀해운` 전체 반영 완료 (코드 전수 검색 확인함, 잔여 없음).
- **디자인 에셋 Stage 1**: 완료, 커밋/푸시됨.
- **지나가는 선박 랜덤 조우 이벤트 시스템**: 완료, 커밋/푸시됨.
- **Stage 2 (아이템 아이콘 적용)**: 총 55개 아이콘 적용 완료(아래 섹션). **사용자가 캐릭터
  베이스 체형 + 헤어/의상을 직접 그려서 전달하기로 함(비율/정렬은 내가 맞추기로 함)** —
  도착 대기 중.
- **Sprint 5 — 커플링/혼인신고, 공동금고 이자, 환율 재미요소**: 전부 완료, 커밋/푸시됨
  (아래 섹션). **카카오 오픈채팅 출석 인증만 보류** — 아래 "다음에 할 일" 참고.

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
   인벤토리 미리보기용으로 바로 쓸 수 있었음. **복원템/전설템/현창·벽지도 사용자 확인 후
   새 item_catalog row로 추가해 전부 적용 완료(아래 참고).** 여전히 남은 것: sheet-15의
   새싹 신발/양말/가방/소품(카탈로그에 대응 sku 없고, 새싹은 낚시/선박이벤트 같은 획득
   경로가 없어 어디서 얻는 아이템으로 만들지부터 정해야 함 — 보류).

## 이번에 적용한 것: 아이템 아이콘 총 55종

- `public/images/items/`에 55개 PNG:
  - sheet-17: 낚시 물고기 5 + 분실물 6 + 쓰레기 5 + 복원가능아이템 5 + 전설템 5 = 26
  - sheet-02/03(알파채널 있는 시트, 배경제거 불필요): 대게, 머그컵, 탑승권 = 3
  - sheet-16: 가구 8(bed/desk/chair/shelf/fridge/rug/porthole/stand_light) +
    현창변형 2(노을/밤바다) + 벽지 2(구름/파도) = 12
  - sheet-13: 본뿌리 꽃 7
  - sheet-15: 새싹 의상(인벤토리 미리보기용) 3
  - 좌표 기반 크롭 + 배경색 거리 기반 투명화 + 알파 bbox 트림(Stage 1 아이콘 파이프라인과
    동일 기법), 헤더 칩/패널 테두리 bleed는 좌표 미세조정으로 대부분 제거(완전 픽셀퍼펙트는
    아니고 Stage 1과 동일한 수준의 사소한 잔여 있음).
- **신규 item_catalog 항목 12개 추가**(사용자 확인 후 진행): 복원템 5종(restore_radio/
  camera/frame/ship_model/mailbox — 전부 선실 배치 가능), 전설템 3종(legend_compass/
  golden_anchor/shell_jewel), 현창·벽지 4종(ship_vlcc_porthole_sunset/ship_lng_porthole_
  night/ship_bulk_wallpaper_cloud/ship_tanker_wallpaper_wave — **새 메커니즘을 만들지 않고
  기존 선박 이벤트 보상풀에 자연스럽게 편입**시킴). `app/api/loot/restore/route.ts`의
  "사진 조각" 성공 분기를 subcategory='restored' 전체 랜덤 뽑기로 확장해 새 복원템 5종이
  실제로 나오도록 연결. 기존 `ship_vlcc_golden_anchor`와 이름이 겹치던 것은 "황금 닻 브로치"로
  바꿔 새 `legend_golden_anchor`("황금 닻 장식")와 구분되게 함.
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

## Sprint 5 — 커플링/혼인신고 실기능 (완료)

기존에 이미지 미리보기 + "다음 업데이트에서 열려요" 안내문구뿐이던 것을 실제로 동작하는
플로우로 구현. 새 마이그레이션 없이 기존 스키마(`couple_events`, `households.game_marriage_
status/game_married_at`, `hall_of_fame`)를 그대로 사용.

- **귀금속점**(`app/api/jewelry/buy-ring`): 커플링 3종을 실제로 구매 가능 — 지갑 차감(
  `apply_wallet_transaction`) + `inventory_items` 지급 + `couple_events`(type=ring_purchase)
  기록. `RING_SETS`에 `sku` 필드 추가해 `RING_SETS.key`(wave_ring 등)와 카탈로그
  `sku`(ring_wave 등) 네이밍 불일치를 연결.
- **혼인신고서 구매**(`app/api/marriage/buy-document`): 커플링 보유 여부를 서버에서 재검증,
  `households.game_marriage_status`를 조건부 UPDATE(none→pending_signature)로 잠가 중복
  신청 방지, 결제 실패 시 상태 롤백.
- **서명**(`app/api/marriage/sign`): 대기 중인 `couple_events`(marriage_request) 행의
  `payload.signed_by` 배열에 본인 user_id 추가 → `household_users` 전원이 서명 완료되면
  자동으로 `game_marriage_status='married'` + `hall_of_fame`에 "OO ♥ XX 혼인신고 완료" 등재.
  승선확인증 페이지의 "혼인신고 완료/미완료" 표시는 코드 변경 없이 이 상태를 그대로 읽어감.
- `lib/game/marriageData.ts`가 반지 보유·서명 현황·구성원 목록을 한 번에 조회하고,
  `components/marriage/MarriageFlow.tsx`가 상태(반지없음/구매가능/서명대기/혼인완료) 4단계를
  화면 하나로 표시. Mock 데이터로 4단계 전부 스크린샷 확인, build/lint 통과.
- 실제 Supabase 연동으로 두 계정이 순서대로 서명하는 전체 왕복은 이 샌드박스에서 확인 못함
  (다른 기능들과 동일한 한계) — 배포 후 확인 필요.

## Sprint 5 — 공동금고(선내 외화이자) (완료)

- `lib/game/interest.ts`: 지갑 페이지 방문 시 잔액의 0.5%($0.1~$3 사이)를 하루 한 번만
  자동 적립. `apply_wallet_transaction`의 idempotency_key(`interest:household:date`)가
  하루 중복 지급을 막아주므로 매번 호출해도 안전 — attendance 라우트와 동일한 패턴.
  잔액이 0 이하면 지급하지 않음. 새 마이그레이션 불필요(`interest` 타입은 지갑 페이지
  TYPE_LABEL에 이미 존재했음 — 원래도 예정돼 있던 기능).
- 지갑 페이지에서 새로 적립됐을 때만 "오늘의 선내 외화이자 +$X 적립됐어요!" 안내 표시.
- 순수 재미 요소로 설계(실제 환율/이자와 무관, CURRENCY_DISCLAIMER 문구 그대로 유지).

## Sprint 5 — 환율 재미요소 (완료)

- `lib/game/fxRate.ts`: 실제 외부 환율 API를 호출하지 않고, KST 날짜를 시드로 한 결정적
  난수로 "오늘의 선상 환율"(1290~1410원 사이에서 매일 조금씩 출렁임)을 계산. 기존
  `fx_rates` 테이블(rate_date PK)에 오늘 값이 없으면 지연 삽입 — 동시 요청이 둘 다 계산해도
  같은 날짜엔 항상 같은 값이 나오므로 PK 충돌이 나도 안전(무시해도 결과가 같음).
- 지갑 페이지에 "$1 = ₩X,XXX (내 선용금 ≈ ₩Y)" 형태로 표시. 선용금은 실제 화폐가 아니라는
  기존 안내문구는 그대로 유지 — 이 환율도 명백히 게임 내 플레이버라는 톤을 유지.

## 다음에 할 일 (우선순위 순)

1. **사용자가 캐릭터 기본 체형(베이스 바디) + 헤어/의상을 직접 그려서 전달하기로 함**
   (비율/정렬은 내가 맞춰주기로 함, 사용자가 캔버스 맞춰 그릴 필요 없음) — 도착 대기 중.
   도착하면: (a) 벡터 CharacterSprite를 이미지 합성 방식으로 교체, (b) 이미지 리사이즈/
   위치조정으로 비율 맞추기, (c) item_catalog의 hair/outfit/hat/accessory 아이템들과 매핑.
2. 여유가 되면 sheet-15의 새싹 신발/양말/가방(획득 경로부터 결정 필요), sheet-06/11(새싹
   마네킹 의상 — sheet-15와 다른 앵글) 검토
3. Sprint 6(QA/PWA) 착수 — 반응형/PWA 설치/알림/테스트/관리자/모니터링

## Sprint 5 — 카카오톡 공유 출항 인증 (완료)

원본 기획서(1.18/3.8/5.14/FR-ATT-002)를 다시 찾아 읽어보니 "오픈채팅 메시지를 읽는" 방식이
아니라 **카카오톡 공유(Kakao Share) + 카카오톡 공유 웹훅**이라는, 실제로 문서화된 카카오
디벨로퍼스 기능이었다. 흐름: 사용자가 앱에서 "카카오톡 출항 인증" 버튼 클릭 → Kakao Share
SDK로 해연결 오픈채팅방에 카드 공유 → 공유 성공 시 카카오 서버가 우리 웹훅을 호출 → 웹훅에서
검증 후 +$1.

- `lib/kakao/shareAuth.ts`: nonce 저장용 테이블이 스키마에 없어서(4.19 attendance, 4.34
  kakao_webhook_receipts 어디에도 없음) DB 조회 없는 **stateless HMAC 서명** 방식을 선택.
  공유 직전에 `userId:date`를 서버 전용 시크릿(`ATTENDANCE_NONCE_SECRET`, 카카오와 무관한
  내부 키 — 새로 만든 게 아니라 `.env.example`에 빈 자리만 추가함)으로 서명해 nonce를
  만들고, 웹훅에서 같은 값을 재계산해 `timingSafeEqual`로 비교. date가 오늘(KST)이 아니면
  거부해 오래된 nonce 재사용도 막는다.
- `app/api/attendance/kakao/nonce`(GET): 로그인한 사용자에게 `{userId, date, nonce}` 발급.
- `app/api/attendance/kakao/webhook`(POST): 기획서에 명시된 순서 그대로 검증 —
  ① `Authorization: KakaoAK {KAKAO_PRIMARY_ADMIN_KEY}` ② `X-Kakao-Resource-ID`를
  `kakao_webhook_receipts`에 insert해 중복(replay) 차단(PK 충돌=이미 처리됨) ③
  `CHAT_TYPE == OpenMultiChat` ④ `HASH_CHAT_ID == HAEYEONGYEOL_OPENCHAT_HASH` ⑤
  serverCallbackArgs의 userId/date/nonce 검증 ⑥ attendance unique 제약으로 하루 1회 보장
  ⑦ `apply_wallet_transaction`으로 +$1. **주의**: 실제 카카오 웹훅 payload의 정확한 필드명
  (`chat_type`/`hashed_chat_id`/`extras` 등)은 기획서에 개념만 있고 정확한 키 이름까지는
  없어서, 카카오 SDK의 통상적인 네이밍으로 구현하고 흔한 변형도 같이 허용해뒀음 — **실제
  카카오 디벨로퍼스 콘솔에서 앱 등록 후 테스트 웹훅을 한 번 받아보고 필드명이 맞는지 최종
  확인 필요** (이건 사용자 본인 카카오 계정으로만 할 수 있는 일이라 이 세션에서는 불가능).
- `components/home/KakaoAttendanceButton.tsx`: 홈 화면에 노란 카카오 버튼 추가(나의 항해
  정보 카드와 이벤트 줄 사이). 클릭 시 Kakao JS SDK를 동적 로드(`NEXT_PUBLIC_KAKAO_JS_KEY`
  없으면 안전하게 에러 상태만 표시, 크래시 없음 — 스크린샷으로 확인함) → nonce 발급 →
  `Kakao.Share.sendDefault(...)` 호출. 공유는 비동기라 버튼은 "공유 창을 여는" 역할만 하고,
  실제 지급은 웹훅에서 처리되므로 홈 새로고침 시 `kakaoAttendedToday`로 완료 상태 표시.
- `lib/game/homeData.ts`: 기존 앱 출석 날짜 계산이 KST가 아닌 UTC slice를 쓰던 걸 발견해서
  같이 `kstDateString()`으로 통일(카카오 출석 필드를 추가하며 바로 옆 코드라 함께 고침).

## 캐릭터 레이어 아트 (헤어/의상) — 에셋 크롭 완료, 실제 화면 적용은 다음 세션

사용자가 보내준 캐릭터 원본 시트(`design-assets/해녀 헤어.png`, `해녀 의상.png`, `해남이
헤어.png`, `기관사 항해사 해남이 의상 (1-4).png`, `새싹 헤어 및 의상.png`, `새싹 헤어, 새싹
의상.png`)에서 배경 제거 + bbox 트림 + 라벨 텍스트 제거를 거쳐 개별 PNG 90장을 잘라
`public/images/character/{haenyeo,haenam,child}/{hair,outfit}/*.png`로 정리했다
(해녀 헤어 20 + 해녀 의상 20, 해남 헤어 20 + 해남 기관사 의상 10 + 해남 갑판 의상 10, 새싹
헤어 10 + 새싹 의상 10). 몽타주 스크린샷으로 전수 확인, 라벨 잔여물 등 사소한 흠은 기존
Stage 1/2와 동일한 품질 기준(완벽보다 "충분히 좋음")으로 수용했다.

**중요한 발견 — 別도 "얼굴 합성" 작업이 필요 없다.** 처음엔 헤어 PNG 안에 뚫린 "얼굴 구멍"을
자동으로 찾아(`scipy.ndimage.label` 등) 그 자리에 별도 얼굴 레이어를 끼워 넣으려 했는데,
얼굴 구멍이 머리카락 사이 틈(주로 턱선)을 통해 배경과 이어져 있어 연결영역 탐지가 계속
실패했다(팽창 반복 6~16회로 튜닝해봤지만 매번 너무 작거나 아예 못 찾음). 그런데 실제로 헤어
원본 시트를 다시 보니 **얼굴(피부톤 타원 + 귀 + 목)이 이미 헤어 일러스트 자체에 다 그려져
있었다** — 눈코입만 비어있는 상태. 즉 얼굴은 "찾아서 끼워 넣을" 대상이 아니라 헤어 레이어에
포함된 완성품이었다. 그래서 합성은 아주 단순해진다:

```
1. 의상 레이어를 캔버스 아래쪽에 배치
2. 헤어 레이어(얼굴 포함)를 의상 위, 목 부분이 옷깃과 자연스럽게 겹치도록
   overlap_ratio ≈ 헤어 높이의 16% 만큼 위로 겹쳐서 배치
3. 끝 — 별도 얼굴 레이어, 홀 디텍션 전부 불필요
```

해녀 2장 + 해남 2장 + 새싹 1장으로 이 방식을 프로토타이핑해 확인했고(스크린샷 확보, 사용자
에게도 전송함), 대부분 자연스럽게 붙는다. 다만 해남/새싹 일부 헤어는 크롭 과정에서 턱 아래가
살짝 평평하게 잘려 옷깃과 만나는 지점에 얇은 경계선이 보이는 경우가 있음(라벨 제거용 bbox
트림의 부작용) — 인지된 사소한 흠, 필요시 해당 헤어들만 재크롭하면 해결됨.

**아직 실제 게임 화면(`CharacterSprite.tsx`)에는 연결하지 않았다.** 이유: 지금의
`CharacterSprite`는 SVG 벡터 조합이고, 이걸 이미지 레이어 합성으로 바꾸려면 (a) 새 헤어/의상
90장을 `item_catalog`의 어떤 아이템(또는 새 프리셋 옵션)과 매핑할지 결정, (b) 홈/선실/갑판
Presence/캐릭터 커스터마이즈/명예의 전당 등 캐릭터를 렌더링하는 모든 화면에서 SVG 대신 이미지
레이어를 쓰도록 교체, (c) 커스터마이즈 화면의 "선택 가능한 헤어/의상 목록" UI도 함께 갱신
— 이 세 가지가 얽힌 규모 있는 리팩터라 시간/컨텍스트가 부족한 상태에서 무리하게 라이브 앱에
바로 박아 넣기보다는, 에셋을 정리해두고 다음 세션에서 제대로 설계해 붙이는 쪽을 선택했다.
프로토타입 합성 스크립트는 커밋하지 않고 세션 scratchpad에만 남겨둠(앱 코드 아님).

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
