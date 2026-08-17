# 진행 상황 기록 (세션이 끊겨도 여기서 이어감)

마지막 갱신: 사용자가 보내준 캐릭터 기본 체형(해녀/해남/새싹 6종) 일러스트를 실제 게임
화면 전체에 연결 완료 — 아래 "캐릭터 일러스트 실제 적용" 절 참고.

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

**(이후 세션에서 상태 갱신) 헤어/의상 낱개 레이어 합성은 여전히 라이브에 연결 안 됨** —
아래 "캐릭터 일러스트 실제 적용" 절에서 설명하는 **기본 체형(얼굴+헤어+기본 의상이 하나로
합쳐진 그림)** 을 대신 연결했고, 이 90장짜리 헤어/의상 낱개 세트는 그보다 더 정밀한
다음 단계(사용자가 고른 헤어/의상 조합을 실제로 반영) 작업용으로 남겨둔 상태다.

## 캐릭터 일러스트 실제 적용 (완료)

사용자가 이번엔 위 헤어/의상 세트와는 별도로 **"기본 캐릭터 얼굴 및 체형"** 시트 8장을
보내줬다 — 해녀 1장, 해남 1장, 새싹 6장(유아/유치원/초등학생 × 남/여). 각 시트는 얼굴+헤어+
기본 속옷 차림 몸 전체가 하나로 합쳐진 완성된 일러스트(정면/후면/측면/앉은자세 4포즈)라서,
이번엔 위의 "레이어 합성" 문제 자체가 없다 — 그냥 정면 포즈 하나를 잘라 그대로 쓰면 된다.

- **크롭**: 각 시트가 실제로는 완전 투명 배경(alpha 0~254)인데 은은한 글로우 효과 때문에
  `Image.getbbox()`가 캔버스 전체를 잡아버리는 문제가 있어서, alpha>120 임계값으로 마스킹한
  뒤 연결영역(`scipy.ndimage.label`)을 구해 "세로 길이가 이미지 높이의 30% 이상인 것 중
  가장 왼쪽" 컴포넌트를 정면 포즈로 자동 선택했다(라벨 리본 배지처럼 작은 도형은 높이
  조건에서 자동 제외됨). 8장 전부 사람 손으로 좌표를 재지 않고 이 방식으로 성공.
- **저장**: `public/images/character/base/{haenyeo,haenam,child_{toddler,kindergarten,
  elementary}_{male,female}}.png` (8장), 매핑 헬퍼는 `lib/domain/characterPortrait.ts`
  (`characterPortraitSrc({kind, childGender, childStage})`). 그림에 없는 연령대(영아/
  중고생/대학생)는 가장 가까운 단계로 근사(영아→유아, 중고생 이상→초등학생).
- **CharacterSprite 교체**: 완전히 새 컴포넌트로 바꾸는 대신 `kind`/`childGender`/
  `childStage`를 옵션 prop으로 추가해, 값이 오면 실제 일러스트를, 안 오면 기존 SVG 벡터를
  그리도록 했다(하위 호환 폴백). `size`의 의미가 벡터(가로 기준, 220:260 비율)에서 실사
  일러스트(세로 기준, 훨씬 슬림한 인물 비율)로 바뀌기 때문에 값 자체는 그대로 두되 "세로
  높이"로 재해석하도록 통일했다.
- **전 화면 반영**: 오프닝(`app/page.tsx`), 홈 나의 항해 정보 카드, 선실(`CabinRoom`),
  갑판 Presence(`DeckScreen` — Realtime presence payload에 kind/child_gender/child_stage
  추가해 다른 접속자에게도 정확한 그림이 broadcast되도록 함), 항해일지(`voyage/page.tsx`),
  승선확인증, 캐릭터 커스터마이즈 화면, 성인/새싹 온보딩 생성 폼 미리보기까지 전부 실제
  일러스트로 교체. 이 과정에서 `characters` 테이블 select에 `child_gender`/`child_stage`가
  빠져있던 곳(승선확인증, 커스터마이즈, 갑판 presence)도 같이 채웠다.
- **알려진 트레이드오프 (의상 색상은 이후 해결)**: 헤어스타일/의상 실루엣 자체는 여전히
  같은 kind+성별+연령대면 다 같은 그림이 나온다 — 90장짜리 헤어/의상 낱개 세트를 이 기본
  체형에 얹는 작업은 아직 안 함(두 세트가 서로 다른 비율/구도로 그려져 있어 단순 합성으로는
  부자연스러움, 아래 참고). 다만 **의상 "색상"만큼은** 실제로 반영되도록 만들었다 — 흰
  탱크탑/반바지 영역을 색상 거리 기반으로 마스킹해(`public/images/character/base/
  masks/*_outfit_mask.png`) `CharacterSprite`에서 `mask-image` + `mix-blend-mode:
  multiply`로 `appearance.outfitColor`를 그 자리에만 입힌다. 헤어/피부는 원본 그대로.
  마스크를 처음엔 grayscale(L 모드, 알파채널 없음)로 저장했더니 CSS `mask-image`의 기본
  alpha 기반 마스킹이 "알파 채널 없으면 전체 불투명"으로 처리해버려서 사각형 전체가
  통째로 물드는 버그가 있었음 — 마스크 값을 알파 채널에 인코딩한 RGBA PNG로 바꿔서 해결.
- **헤어/의상 낱개 세트가 기본 체형과 안 맞는 이유**: 두 세트를 나란히 놓고 비교해보니
  헤어/의상 90장은 상반신 위주로 크게 그려진 "플랫레이" 구도(비율이 기본 체형보다 훨씬
  큼)라, 지금의 전신 기본 체형에 그대로 얹으면 머리/옷 크기가 몸에 안 맞아 어색해 보인다.
  이 정도 비율 차이는 단순 리사이즈로는 자연스럽게 안 맞을 가능성이 높음 — 사용자가 기본
  체형과 같은 구도/비율로 새로 그려주거나, 정교한 워핑 작업이 필요해 보류.
- **(재검증, 이후 세션) 실제로 합성 시도해서 확인함**: 사용자가 "헤어 의상 입히는 작업부터"
  라고 재요청해서 높이 기준 스케일 / 어깨너비 기준 스케일 두 방식으로 실제 합성 테스트를
  해봤다(`haenyeo_outfit_01` + `haenyeo.png` 기본 체형). 결과: 의상 세트가 자체적으로
  얼굴 자리·팔·다리·신발까지 다 포함된 독립 "인형" 구도라, 어떤 스케일로 맞춰도 기본
  체형의 팔다리와 겹쳐 이중으로 보이고 얼굴이 머리카락에 가려짐 — 단순 스케일/위치조정
  문제가 아니라 90장 전체를 기본 체형 비율로 다시 그려야 하는 작업임을 확정. 결론 이미지를
  사용자에게 전달하고 이 작업은 보류, 대신 이미 반영된 의상 색상 커스터마이징(#62)을
  유지하기로 함.
- `deck.png`(갑판 광장 메뉴 아이콘)도 사용자가 새로 그려준 투명배경 원본으로 교체(이전엔
  하늘색 배경이 박혀있었음).

## 확인이 필요했지만 진행을 막지 않고 넘어간 것들 (나중에 사용자 확인용) — 후속 처리

- **`deck.png` 하늘색 배경 문제 (해결됨)**: 사용자에게 정확히 어떤 파일인지 전달했더니
  투명배경 원본을 새로 그려서 보내줬고, 그대로 교체 완료.
- **승선확인증 이미지화 (해결됨)**: `design-assets/boarding-pass-and-logo-sheet.png`의
  실제 카드 이미지에서 샘플 사진/날짜만 카드 배경색으로 지운 프레임
  (`public/images/misc/boarding-pass-frame.png`)을 만들고, 성명/선박명/직책/승선일/하선일
  값과 캐릭터 사진을 그 위에 퍼센트 좌표로 오버레이하도록 `app/(game)/boarding-pass/
  [characterId]/page.tsx`를 재작성했다. 좌표는 706×925 프레임에 50px 그리드를 오버레이해
  직접 실측(라벨 줄 위치를 잘못 잡아 텍스트가 겹치는 버그가 있었는데, 콜론 뒤 빈 줄의 실제
  x좌표를 다시 재서 수정함). 원본 목업엔 없던 관계/함께 승선/혼인신고 상태는 카드 아래
  별도 요약 카드로 유지. 선박명 칸은 실제 데이터가 없어 `SHIP_NAME`("해연결호") 상수로 채움.
- 혼인신고서는 아직 실제 입력/서명 기능 없이 이미지 미리보기 + 안내문구만 있음 (원래도 스텁이었음,
  Sprint 5에서 실제 기능 예정) — 사용자 확인, 현행 유지하기로 함.
- **선박 일러스트 스펙 전달**: 실제 업로드된 일러스트가 없어 `ShipSprite`는 여전히 벡터 SVG.
  사용자가 직접 그려주기로 해서 스펙(측면뷰, 가로:세로 약 2.3~2.5:1, 투명 배경, 7종 각각의
  특징 — 컨테이너선/벌크선/탱커선/카캐리선/케미컬선/LNG선/VLCC)을 전달함. 도착하면 크롭 후
  `ShipSprite` 자리를 이미지로 교체.
- 선박 이벤트의 실시간 스폰→수령 전 과정은 이 환경에 Supabase가 연결되어 있지 않아
  브라우저로 끝까지 실행해보지 못했음(로직은 시뮬레이션으로 검증). 실제 배포 환경에서
  확인하기로 사용자와 합의 — 우선순위 낮춤(나중에 함께 확인).

## 선실 아이소메트릭 배경 + 벽지/바닥재 + 인테리어 소품 100종 (이후 세션)

- 사용자가 새로 그려준 "기본 선실.png"(등대 창문/문/현창이 있는 아이소메트릭 방 코너 구도)를
  `public/images/cabin/room-base.png`로 트림해 `CabinRoom`/`CabinEditor`의 배경으로 교체.
  좌측벽/우측벽/바닥 3개 영역을 `clip-path: polygon(...)`으로 나눠(`lib/domain/cabinDecor.ts`의
  `ROOM_CLIP`, 100px 그리드 오버레이 스크린샷에서 좌표 실측) `mix-blend-mode: multiply`로
  벽지/바닥재 스와치를 얹는 `RoomBackground` 컴포넌트를 새로 만듦. 처음엔 바닥 틴트가 안 보여서
  "polygon 좌표가 틀렸나" 의심했는데, 원래 고른 바닥 스와치가 기본 바닥과 색이 비슷해서 안
  보였던 것뿐 — 채도 차이가 큰 스와치로 바꿔서 재확인해 정상 작동 확인.
- 벽지/바닥재 스와치 50장(`벽지와 바닥재 (1)~(5).png`)을 배경색 거리 기반 + connected-component
  로 자동 추출(`extract_swatches`), `public/images/cabin/wallpaper|floor/*.png` 30+20장으로 저장.
  선택 상태는 스키마 변경 없이 `spaces.metadata jsonb`(`{wallpaper, floor}`)에 저장,
  `/api/cabin/decor`가 소유권 검증 후 갱신. `CabinEditor`에 스와치 선택 UI 추가.
- 가구 배치 아이콘을 48px→32px로 줄여 좁은 방에 소품을 더 많이 놓을 수 있게 함.
- **헤어/의상 실루엣 커스터마이징 재시도, 다시 보류 확정**: 사용자가 "헤어 의상 입히는 작업부터"
  재요청해서 실제 합성 테스트(높이 기준/어깨너비 기준 스케일 2가지)를 해봤는데, 기존 90장 세트가
  얼굴 자리·팔·다리·신발까지 다 그려진 독립 "인형" 구도라 기본 체형에 얹으면 팔다리가 이중으로
  겹치고 얼굴이 가려짐 — 단순 변환으로는 해결 불가 확정. 결과 이미지를 사용자에게 전달하고
  의상 색상 커스터마이징(#62)만 유지하기로 함.
- **인테리어 소품 100종 적용**: `design-assets/인테리어 아이템 (1)~(10).png` 10장을
  connected-component 자동분리로 크롭(터치 중인 아이템 3쌍은 row-sum 최솟값 지점에서 수동
  분리). `public/images/items/interior_*.png`로 저장, `item_catalog`에 `subcategory =
  'interior_pack'`으로 100개 등록(`supabase/seed.sql` + 기존 가족에게도 적용되도록 신규
  마이그레이션 `0006_interior_pack.sql`에 동일 카탈로그 삽입 + 모든 household에 무료 지급하는
  backfill 포함). 신규 가입자는 `app/api/onboarding/complete/route.ts`에서 cabin 생성 시 같이
  지급받음. `lib/domain/itemIcons.ts`의 `ITEM_ICON_SKUS`에 100개 sku 등록.
  **주의**: 이 세션은 라이브 Supabase에 접근할 수 없어 `0006_interior_pack.sql` 마이그레이션은
  작성만 했고 실제 적용(`supabase db push` 등)은 사용자가 직접 해야 함 — 안 하면 카탈로그는
  비어있고 기존 가족 가방에도 새 아이템이 들어가지 않는다.

## 헤어/의상 실루엣 커스터마이징 — "목 아래 전신 스프라이트 교체" 방식으로 최종 해결 (이후 세션)

- 위에서 두 번 보류했던 문제("의상 90장이 독립된 인형 구도라 기본 체형에 얹으면 팔다리가
  이중으로 겹침")를 사용자가 다시 요청해서 아키텍처를 바꿔 해결했다. 핵심 아이디어: 의상
  낱장을 기본 체형 "위에" 얹으려 하지 말고, 의상 낱장 자체를 이미 "목 아래 전신(체형+옷)"
  스프라이트로 취급한다 — 기본 체형에서는 목 위(얼굴+헤어)만 고정 레이어로 잘라 쓰고, 목
  아래는 선택된 의상 이미지로 통째로 갈아 끼우는 2레이어 합성. 이러면 팔다리가 겹칠 여지 자체가
  없다(둘 다 팔다리를 그리는 게 아니라 의상 쪽만 그림).
- `scripts/asset-tools/normalize_outfits.py` (신규, 재실행 가능한 파이프라인):
  1. 기본 체형 8종에서 목선을 자동 검출(머리 최대폭 이후 첫 최소폭 지점)해 머리(얼굴+헤어)만
     `public/images/character/base/head/*.png`로 크롭.
  2. 의상 50장(해녀 20 + 해남 20 + 새싹 10)을 alpha bbox 트림 → 가장 큰 connected component만
     남겨 라벨/번호뱃지 잡음 제거 → 목표 높이/폭에 맞춰 스케일 → 420×512 공통 캔버스의 같은
     목선 좌표(`NECK_Y=140`)에 배치. 이 좌표가 모든 의상에서 동일해야 머리 레이어와 이음매가
     항상 맞는다 — 사람이 의상마다 손으로 위치를 맞추는 과정이 없다.
  3. 앞으로 새 의상 PNG를 `public/images/character/{haenyeo,haenam,child}/outfit/`에 추가하고
     스크립트를 재실행하면 자동으로 정규화되고, 아직 `itemAppearance.ts`에서 안 쓰이는 새
     키를 스크립트가 알려준다(어떤 SKU/가격에 연결할지는 기획 판단이라 자동화하지 않음).
- `CharacterAppearance`에 `outfitAssetKey?: string | null` 추가 — 있으면 새 2레이어 합성,
  없으면 기존 색상 틴트 방식으로 폴백(하위 호환). 기존 카탈로그 SKU(해녀 원피스/맨투맨/잠옷,
  해남 항해사 제복/캐주얼, 기관사 작업복/캐주얼, 새싹 멜빵바지/원피스/후드)를 실제 정규화된
  의상 에셋에 매핑했고, 온보딩 캐릭터 생성 화면의 "의상 컬러" 스와치도 색만 바꾸는 게 아니라
  실제 다른 디자인의 옷으로 바뀌도록 연결(`components/onboarding/swatches.ts`).
- **정규화 직후 발견된 두 가지 결함, 확인 후 수정**:
  1. 해남 항해사 기본 제복으로 쓰던 원본(`haenam_deck_outfit_01`)에 애초에 손이 안 그려져
     있었음(다른 19장은 다 손이 있는데 이 한 장만 소매 끝에 끈만 달랑거리고 손 모양이 없음) —
     정규화 버그가 아니라 원본 그림 자체의 결함으로 확인, 손이 있는 다른 디자인
     (`haenam_deck_outfit_04`, 네이비 브이넥+닻 자수)으로 기본값 교체.
  2. 해남 원본이 해녀 원본보다 어깨를 더 넓게 그려서, 같은 방식으로 정규화하면 머리 대비
     몸통이 두꺼워 보임(실측: 어깨폭/머리폭 비율이 해녀는 ~0.89인데 해남은 ~0.94~1.0). 목선
     앵커와 발 기준선(높이 스케일)은 그대로 두고 가로 폭에만 보정 계수를 곱하는
     `WIDTH_CORRECTION_BY_KIND = {"haenam": 0.93}`을 정규화 스크립트에 추가해 해녀와 같은
     비율로 맞췄다. 해녀 쪽 에셋/렌더링은 건드리지 않음.
- 홈 화면(나의 항해 정보), 시작화면, 항해일지, 온보딩 캐릭터 생성 화면(항해사/기관사 둘 다)에서
  실제 스크린샷으로 검증 완료. 수정 전/후 비교 스크린샷을 사용자에게 전달함.

## 알려진 기술 부채 / TODO

- `lib/domain/characterPresets.ts`의 `NPC_APPEARANCE`는 이제 어디서도 안 쓰임(NPC가 실사진으로
  교체됨) — 삭제하지 않고 유지 중 (Stage 2에서 캐릭터 커스터마이즈 미리보기 등에 재사용 가능성).
- 정규화된 의상 50장 중 실제로 아이템 카탈로그 SKU에 연결된 건 haenyeo 4개/haenam_deck 3개/
  haenam_engine 2개/child 3개뿐 — 나머지는 `outfit_full/`에 정규화까지는 되어 있지만
  아직 어떤 SKU에도 안 묶여 있다(`python3 scripts/asset-tools/normalize_outfits.py` 실행 시
  마지막에 미등록 키 목록이 출력됨). 다양성을 늘리려면 이 목록을 보고 새 아이템 카탈로그
  SKU(가격/희귀도 포함)를 추가하면 됨 — 예술 자산은 이미 준비돼 있음.
- **"캐릭터 의상 (1)~(10).png" 새 세트, 시트 1(해녀 원피스 9종)까지 처리 완료**: 이 세트는
  원피스/상의만 그려져 있고(자체 팔다리 없음) 신발이 옷과 분리되어 떠 있는 3x3 그리드라 기존
  파이프라인(목~신발까지 한 장인 "인형" 전제)을 그대로 못 씀 — 대신 옷에 팔다리가 없다는 점을
  역이용해 **기본 체형 원본(팔다리 포함) 위에 옷을 얹는 새 방식**을 만들었다
  (`scripts/asset-tools/normalize_dress_overlays.py`): 3x3 셀별로 connected-component
  클러스터링해 셀 안에서 가장 작은 덩어리를 신발로 분리하고, 옷은 기본 체형 어깨폭(상단 30%
  구간 중 최대폭 — 퍼프소매든 얇은 끈이든 안정적으로 잡음)에 맞춰 스케일, 신발은 기본 체형의
  발 위치에 따로 앵커링해서 완성된 전신 이미지를 만든다. `CharacterAppearance.fullPortraitKey`
  (신규, `outfitAssetKey`보다 우선) + `dressFullSrc()`로 `CharacterSprite`에 연결.
  시트 1(해녀 원피스 9종)로 검증 완료, `haenyeo_outfit_dress` SKU를 이 중 하나
  (`haenyeo_dress_02`)로 교체.
  **남은 작업**: 시트 2~10(81개, 새싹/아기 스타일 위주, 일부는 모자까지 추가로 있어 앵커링
  포인트가 하나 더 필요함)은 아직 미처리 — 스크립트는 시트 경로+kind만 인자로 받으면 되므로
  `python3 scripts/asset-tools/normalize_dress_overlays.py "design-assets/캐릭터 의상 (N).png" <kind>`
  형태로 재사용 가능하나, 모자 앵커링 로직 추가 + kind별 그리드 클러스터링 검증이 필요.
- **캐릭터 렌더링 크기 불일치 버그 발견 및 수정**: `outfitAssetKey`(목 아래 전신 스프라이트)
  렌더링에서 머리 이미지가 목선 위로 올라가는 만큼(해녀 기준 최대 ~84px) 컨테이너 상단을
  벗어나 오버플로되고 있었다 — `overflow:hidden`이 없어서 화면엔 안 잘리고 다 보였지만,
  그만큼 `size` prop이 실제 렌더링 높이(머리~발끝)를 과소평가하게 되어 같은 `size`를 줘도
  `outfitAssetKey` 캐릭터가 `fullPortraitKey`(드레스 오버레이)나 기존 단일 포트레이트
  캐릭터보다 눈에 띄게 커 보였다(`preview-size-check` 임시 라우트로 재현 확인). 8종 체형의
  머리 크기를 다 계산해 필요한 최대 여유(`HEAD_MARGIN_TOP=90`)를 구하고, `size`가 이 여유까지
  포함한 "전체 캔버스" 기준으로 계산되도록 `CharacterSprite`/`characterFullBody.ts`를 고쳐
  세 렌더링 방식(구버전 단일 포트레이트/outfitAssetKey/fullPortraitKey) 모두 같은 `size`에서
  같은 머리~발끝 높이가 나오도록 통일했다. 홈/선실 화면 스크린샷으로 회귀 없음 확인.

## 게임 효과음(SFX)/배경음악(BGM) 시스템 (이후 세션)

- 사용자가 상세 스펙(공용 AudioManager, SFX 16종 키, BGM 6종, 겹쳐 재생 가능, autoplay 제약
  대응, 파일 없어도 안 깨짐, 설정 화면 ON/OFF+볼륨, localStorage 저장)을 줘서 그대로 구현.
  새 의존성(Howler.js 등) 없이 `HTMLAudioElement` 기반으로 구현 — 이 프로젝트가 필요한 건
  "짧은 효과음 겹쳐 재생 pool"과 "루프 배경음악 한 트랙" 정도라 Web Audio API/Howler는
  과함(package.json에 오디오 라이브러리가 아예 없었음, zustand는 있지만 오디오와 무관).
- **구조**: `lib/audio/manifest.ts`(SFX 16개/BGM 6개 키→경로 매핑, 경로를 코드에서 직접 안 쓰고
  이 파일 하나로만 관리) → `lib/audio/audioManager.ts`(싱글턴 `AudioManager` 클래스 —
  `playSfx(key)`/`playBgm(key)`/`stopBgm()`/설정 getter-setter, 절대 throw 안 함) →
  `lib/audio/useAudioSettings.ts`(`useSyncExternalStore`로 설정 화면이 반응형으로 구독) →
  `components/audio/AudioBootstrap.tsx`(루트 레이아웃에 마운트, 첫 사용자 제스처 리스너 등록 +
  자주 쓰는 효과음 프리로드) + `components/audio/BgmController.tsx`(경로별 BGM 자동 전환).
  SFX는 키마다 `HTMLAudioElement` 4개짜리 pool을 round-robin으로 돌려 같은 효과음이 빠르게
  겹쳐도 안 끊기게 했고, 음원 파일이 없으면(`error` 이벤트) 그 키를 `unavailable`로 표시해
  이후 재생 시도를 아예 건너뛴다(네트워크 재시도도 없음, 콘솔에 브라우저 자체 404 로그만
  남고 앱 로직에는 전혀 영향 없음 — Playwright로 `pageerror` 0건 확인).
- **모바일 autoplay 대응**: `pointerdown`/`touchstart`/`keydown` 중 아무거나 첫 제스처가
  오면 이미 만들어둔 오디오 엘리먼트를 무음으로 한 번 재생→정지해서 "이 페이지는 오디오
  허가받음" 상태를 만들어둔다(iOS Safari/Chrome 공통 unlock 트릭). `visibilitychange`로
  탭이 다시 보일 때 BGM이 멈춰 있으면 재생 재시도.
- **설정 화면**: `/settings`(신규, `components/menu/SettingsScreen.tsx`) — 효과음/배경음악
  각각 ON/OFF 토글 + 0~100% 볼륨 슬라이더, `localStorage`(`hgs-audio-settings-v1`)에 저장돼
  새로고침해도 유지(Playwright로 확인: 40%로 바꾸고 새로고침해도 40% 유지). 메뉴 화면에
  링크 추가.
- **이벤트 연결**(서버가 성공을 확정한 시점에만 재생 — 구매 실패/중복 출석 등에는 성공음 안 남,
  자세한 근거는 각 파일의 `if (!res.ok) throw` 다음 줄에 재생 코드 위치):
  - 출항하기 성공(중복 제외) → `attendance` + 180ms 후 `coin` (`VoyageInfoCard.tsx`)
  - 상점 구매/커플링 구매/혼인신고서 구매 성공 → `purchase` (`StoreProductGrid.tsx`,
    `RingBuyButton.tsx`, `MarriageFlow.tsx`)
  - 낚시 판매 → `coin`, 조리 → `food`, 복원 → 희귀도별(`item-get`/`rare-item`/
    `fishing-legendary`) (`LootActions.tsx`, 공용 로직은 `lib/audio/rarity.ts`)
  - 캐릭터 옷/헤어/모자/소품 장착 성공 → `equip` (`CustomizeScreen.tsx`)
  - 가구를 방에 배치 → `furniture-place`, 가방으로 회수 → `furniture-pickup`
    (`CabinEditor.tsx` — 서버 저장은 "저장" 버튼을 눌러야 확정되지만, 배치/회수 자체는
    100% 로컬 상태 조작이라 실패할 수 없어 그 자리에서 바로 재생하는 게 사용자 의도와
    더 맞다고 판단함)
  - 자동조업 시작 → `fishing-start`, 결과 수령 → `fishing-result`(+전설급 있으면
    250ms 후 `fishing-legendary` 추가) (`FishingScreen.tsx`)
  - 선내식당 주문 결과 → `food` (`MessRoomOrder.tsx`)
  - 방명록 등록 → `guestbook` (`GuestbookForm.tsx`)
  - 혼인신고 서명: 양쪽 다 완료 → `marriage`, 한쪽만 완료 → `notification`
    (`MarriageFlow.tsx`)
  - 주요 내비게이션(하단 탭, 홈 메뉴 그리드) → `ui-click`
  - `mission-complete`는 정의는 해뒀지만 미션/듀티 보상 수령 기능 자체가 아직 서버에
    구현 안 돼 있어(코드 조사로 확인, `app/(game)/duties/page.tsx`가 정적 안내만 표시)
    연결할 곳이 없음 — 기능이 생기면 그때 연결.
- **테스트**: `lib/audio/manifest.test.ts`(vitest, 순수 로직 — 매니페스트 키 스펙 일치,
  경로별 BGM 매핑) + Playwright로 설정 화면 토글/볼륨/새로고침 유지, SFX ON/OFF일 때 실제
  네트워크 요청 유무, 음원 파일 전무 상태에서 `pageerror` 0건, 프로덕션 빌드 통과 확인.
- **실제 음원 파일 넣는 곳**: `public/audio/sfx/*.mp3`(16개), `public/audio/bgm/*.mp3`(6개) —
  정확한 파일명/용도는 `public/audio/README.md`에 표로 정리해둠. 파일만 그 경로에 넣으면
  코드 변경 없이 바로 재생된다.
- **사용자가 GitHub 웹 업로드로 넣어준 실제 음원 파일 정리**: SFX 9종은 `public/audio/`
  최상위에 평평하게(일부는 `.wav`) 올라와 있어서 `ffmpeg-static`(임시 devDependency, 코드에는
  안 남김)으로 `.wav`→`.mp3` 변환 후 `public/audio/sfx/{key}.mp3`로 이동, 이미 `.mp3`였던
  2개는 그대로 이동. BGM 6종은 한글/영문 혼용 파일명("갑판_Waiting_for_the_Tide.mp3" 등)이라
  내용으로 추정해 `public/audio/bgm/{key}.mp3`로 매핑 이동(갑판→deck, 낚시터→fishing,
  리리양곱창→liri-gopchang, 본뿌리→bonppuri, 선실→cabin, 홈&메인→home). 대응 키가 없는
  "상점_Life_Between_the_Tides.mp3"는 사용자 확인 결과 아직 화면이 없는 옷가게용으로 보류
  (원래 경로에 그대로 둠, 옷가게 화면을 만들 때 연결 예정).

## 미션 보상 수령 + 우편함(운영자 보상 지급) 기능

- **미션 진행도 자동 집계 + 수령**: 기존에 `mission_catalog`/`mission_progress` 스키마와
  `DAILY_MISSIONS`/`WEEKLY_MISSIONS` 상수는 이미 있었지만 아무 라우트도 진행도를 올리지
  않고 `/duties` 화면도 정적 안내문만 보여주는 상태였음 — 이번에 실제로 연결함.
  - `lib/game/missions.ts`: `incrementMission`(단순 카운터, target 도달 시 completed 고정)
    / `incrementDistinctMission`(distinct-set — `metadata.seen` 배열에 방문 식별자를
    중복 없이 누적, 배열 길이가 progress) / `getMissionSnapshot`(화면 표시+클레임 검증
    공용, `daily_clear`/`weekly_clear`는 저장된 row가 아니라 "그 주기 미션 전부 완료"를
    파생 계산 — 실제 row는 클레임 시점에 처음 생김).
  - **distinct-set 미션(cabin_visit5: 서로 다른 선실 5곳, deck_visit4: 서로 다른 4일 갑판,
    guestbook: 서로 다른 선실 방명록 3회) 처리**: `mission_progress`에 저장된 `metadata`
    컬럼이 없어서(`supabase/migrations/0007_missions_mailbox.sql`로 추가, **미적용** — 아래
    참고) 그 안에 방문 식별자 배열을 담는 방식을 택함. 기존 `space_visits` 테이블을 재사용하는
    방안도 검토했으나 갑판/본뿌리/리리양곱창용 `spaces` row가 앱 코드 어디서도 실제로
    생성/조회되지 않는 걸 확인해서(온보딩 때 `cabin` space만 생성) 이 방식은 포기.
  - **주간 period_key**: `lib/game/kst.ts`에 `kstWeekString`(ISO 8601 "YYYY-Www") 추가.
    기존 `kstDateString`과 같은 이유로 로컬 타임존 getter 대신 UTC 고정 getter만 사용.
  - **방문형 데일리/위클리 미션(visit_bonppuri/visit_liri/visit_deck/cabin_visit5/
    deck_visit4)**: Next.js Link prefetch가 서버 컴포넌트 렌더를 미리 실행할 수 있어서
    페이지 렌더 본문에서 바로 진행도를 올리면 실제 방문 없이도 오탐 증가할 위험이 있음 —
    `components/duties/MissionPing.tsx`(클라이언트, `useEffect` 마운트 시에만 1회
    `POST /api/duties/ping`)로 우회. bonppuri/liri-gopchang/deck/cabin/[householdId]
    페이지에 삽입.
  - 기존 라우트 연동: `/api/attendance/app`(attendance+attendance5, 새 출석일 때만),
    `/api/guestbook`(guestbook, distinct), `/api/fishing/start`(fishing+fishing5).
  - `POST /api/duties/claim`: 개별 미션은 `completed=true AND rewarded=false` 조건부
    UPDATE로 중복 지급 차단, `daily_clear`/`weekly_clear`는 `(user_id, mission_key,
    period_key)` unique PK insert로 같은 효과. 재화 지급은 기존 `apply_wallet_transaction`
    RPC 재사용(`mission_claim:{key}:{userId}:{periodKey}` idempotency key).
  - `/duties` 화면을 정적 카드 나열에서 실제 progress/완료/수령 상태 기반으로 교체,
    수령 버튼(`MissionClaimButton`)이 성공 시 `mission-complete` SFX 재생(이전 세션에
    정의만 해두고 연결 못 했던 키).

- **우편함(운영자 보상 지급) 기능**: `profiles.role`/`is_admin()`은 이미 있었지만 앱 코드
  어디서도 안 쓰이고 있었음 — 이번에 처음으로 admin 기능 화면을 만듦.
  - `mailbox_items` 신규 테이블(household 단위 — wallet/inventory와 동일한 스코프 원칙,
    `supabase/migrations/0007_missions_mailbox.sql`, **미적용**): title/body/cash_reward/
    catalog_item_id/item_quantity/claimed_at/claimed_by/created_by. RLS는 읽기만
    `is_household_member() or is_admin()`, 쓰기는 서비스 롤 전용(기존 wallet_transactions와
    동일 패턴).
  - `lib/game/admin.ts`의 `isAdmin()` 헬퍼로 `POST /api/mailbox/send`(운영자 전용,
    가구/아이템 유효성 검증 후 insert)를 보호. `POST /api/mailbox/claim`은
    `claimed_at IS NULL` 조건부 UPDATE로 중복 수령 차단, 현금은 `apply_wallet_transaction`
    (우편 1건당 idempotency key), 아이템은 `inventory_items`에 insert. 단건(`mailboxItemId`)과
    "모두 받기"(`all:true`, 미수령 전체 순회) 둘 다 지원.
  - `/mailbox`(유저): 전체/읽지않음/보관 탭 + 카드 목록(제목/본문/상대시각/보상 표시) +
    개별 받기·모두 받기. 사용자가 준 디자인 시안(`design-assets/우편함 화면.png`)의
    구성(헤더+탭+카드 리스트+하단 전체 받기)을 앱 기존 UI 언어(Card/색상 토큰)로 재구성—
    시안의 편지 타입별 개별 스티커 아이콘(선물/고래/풍선 등)은 추가 에셋이 없어 생략하고
    공용 우편함 아이콘으로 통일.
  - `/admin/mailbox`(운영자 전용, role 체크 실패 시 안내문만 표시): 닉네임 검색으로 가구
    선택(가구 자체는 표시 이름이 없어서 구성원 닉네임 조합으로 검색/식별) + 제목/본문/현금/
    아이템 입력 폼. 실제 발송 권한 검증은 `/api/mailbox/send`가 서비스 롤로 한 번 더 함
    (화면 gating은 UX용, 보안 경계 아님).
  - 사용자가 준 우편함 아이콘(`design-assets/우편함 아이콘.png`)을 트림+리사이즈해
    `public/images/icons/mailbox.png`로 등록, 기존 `GameIcon` 아이콘셋에 `mailbox` 키 추가
    (메뉴/우편함/관리자 화면에서 재사용).

- **⚠️ DB 마이그레이션 미적용**: `supabase/migrations/0007_missions_mailbox.sql`
  (`mission_progress.metadata` 컬럼 추가 + `mailbox_items` 테이블/RLS)은 이 세션이 실제
  Supabase 프로젝트에 접근할 수 없어서 파일만 작성했고 적용은 안 했습니다. 위 기능들이
  동작하려면 `supabase db push`(또는 Supabase 대시보드 SQL 편집기에서 파일 내용 실행)로
  실제 DB에 반영해주세요.
- **검증**: `tsc --noEmit`/`eslint`/`vitest run`(48개 전부 통과, 신규 `kstWeekString`/
  `relativeTimeKorean` 테스트 포함)/`next build` 전부 통과. 실 DB 세션이 없어 로그인 상태
  전체 플로우는 못 돌렸지만, Playwright로 `/duties`·`/mailbox`·`/admin/mailbox`가
  비로그인 폴백 상태에서 200으로 정상 렌더되고(`trySupabase` 스타일 try/catch 폴백)
  콘솔 에러 없는 것 확인.

## 선실 방꾸미기 시스템 전면 개편

- **문제**: 선실 화면(`CabinRoom.tsx`)과 방꾸미기 편집기(`CabinEditor.tsx`)가 가구 종류와
  무관하게 전부 32px 고정 아이콘 배지로 렌더링하고 있었음 — 실제 가구 이미지(`public/images/items/*.png`,
  ~150종, 원본 비율 그대로인 진짜 가구 일러스트)가 이미 있었는데도 crop된 아이콘처럼 짓눌러
  표시해 "가구가 아니라 아이콘처럼 보인다"는 문제의 실제 원인이었음. 좌표/스케일/회전/반전/
  z-index 저장 구조(`space_items` 테이블, `scale`/`rotation`/`flip_x`/`z_index` 컬럼)와
  드래그(포인터 이벤트)·저장 API·소유권 검증은 이미 잘 구현돼 있어서 스키마 변경 없이
  렌더링/배치 로직만 다시 짜면 되는 문제였음.
- **`lib/domain/cabinPlacement.ts`(신규)**: item_catalog에 새 컬럼을 추가하는 대신, sku 이름
  패턴으로 카테고리(침대/테이블/좌석/수납/러그/조명/벽장식/소품/가전)를 분류해 카테고리별
  기본값(`baseHeightFrac`=방 높이 대비 렌더 높이 비율, `placementType`=floor/wall/rug/free,
  `defaultScale`/`minScale`/`maxScale`)을 적용하고, 규칙만으로 어색한 극소수 아이템만
  `SKU_OVERRIDES`로 예외 처리(100여 종을 하나씩 하드코딩하는 방식 회피). `depthOf(y, zIndex)`로
  바닥 y좌표를 기본 depth로 쓰고 사용자의 앞으로/뒤로 조정을 그 위에 더해서, 화면 위/아래로
  멀리 떨어진 가구는 항상 y가 우선하고 비슷한 위치에서 겹칠 때만 zIndex로 순서가 뒤집히게 함
  (캐릭터도 같은 depth 공식에 편입시켜 "테이블 뒤 캐릭터가 항상 앞으로 튀어나오는" 문제 방지).
- **배치 영역 제약**: 기존 `RoomBackground`의 `ROOM_CLIP` isometric 폴리곤(벽/바닥 영역)을
  새로 만들지 않고 그대로 재사용 — `lib/domain/cabinDecor.ts`에 `ROOM_ZONES`/`WALL_BOUNDS`(폴리곤
  좌표에서 뽑은 바운딩 박스)와 `clampToZone` 헬퍼를 추가해, 편집기에서 드래그할 때
  placementType(floor/wall/rug)에 맞는 영역 밖으로 못 나가게 클램프(완전한 폴리곤 충돌판정
  대신 바운딩 박스 기준 MVP 제약 — 벽 장식이 방 한가운데로, 침대가 벽에 매달리는 일은
  방지되지만 isometric 모서리 근처의 미세한 오차는 있을 수 있음).
- **렌더링 방식**: `furnitureWrapperStyle()`이 `position:absolute` + `height:{baseHeightFrac*scale}%`
  (방 컨테이너가 `aspect-ratio`로 높이가 고정돼 있어 퍼센트 높이가 항상 같은 비율로 반응형
  유지됨) + `translate(-50%,-100%)`(바닥 접점=발밑 기준 앵커, 크기를 키워도 바닥 위치가
  흔들리지 않음)로 스타일을 계산 — JS로 컨테이너 픽셀을 측정할 필요 없이 순수 CSS로
  모바일/태블릿/데스크톱 어디서나 같은 상대 위치·크기가 유지됨. `CabinRoom`(일반 모드)과
  `CabinEditor`(편집 모드)가 이 헬퍼를 공유해서 두 화면의 크기 체감이 일치함.
- **편집 UX**: 선택된 가구에 얇은 outline(굵은 개발툴 바운딩 박스 대신)을 표시하고, 하단에
  `Card` 기반 컨트롤 패널(`sticky bottom-2`)이 뜬다 — 회전/반전/작게/크게/앞으로/뒤로/회수
  7개 버튼을 이모지나 유니코드 기호 대신 새로 그린 얇은 인라인 SVG 라인 아이콘
  (`components/cabin/EditIcons.tsx`)으로 통일. 작게/크게는 `getPlacementDef`의
  minScale/maxScale 범위 안에서만 움직임(가구 종류별로 확대/축소 한계가 다름). 저장 전
  로컬 state만 바꾸다가 "저장"을 눌러야 서버에 반영되는 기존 방식은 유지하되, 마지막
  저장 시점과 현재 state를 비교해 dirty 여부를 추적 → 변경사항이 있을 때만 "취소" 버튼과
  브라우저 이탈 경고(`beforeunload`)가 뜨도록 추가.
- **가방에서 배치**: 새로 꺼낸 가구는 화면 정중앙(0.5, 0.5)이 아니라 그 가구의 placementType
  영역 중심(벽 장식이면 벽 영역 중심, 바닥 가구면 바닥 영역 중심)에 스폰되도록 변경.
- **권한**: 다른 사용자 선실 편집 차단은 이미 `POST /api/cabin/save-layout`이 서버에서
  `space.household_id !== 내 household_id`면 403으로 막고 있던 기존 로직을 그대로 재검증만
  하고 유지(클라이언트 버튼 숨김에만 의존하지 않음, 이번에 변경 없음).
- **기본 선실 초기 배치 버그 수정**: `app/api/onboarding/complete/route.ts`의
  `DEFAULT_FURNITURE_LAYOUT`이 `"furniture_lamp"`라는 **존재하지 않는 sku**를 참조해서
  (`item_catalog`에 없어 `if (!item) continue`로 조용히 스킵) 신규 가입자에게 조명이
  아예 지급도 배치도 안 되고 있었음 — 실제로 존재하는 `"furniture_stand_light"`로 교체.
  나머지 좌표도 `ROOM_CLIP` 바닥/벽 영역 안에 들어오도록 재조정(침대는 왼쪽, 책상+의자는
  오른쪽 세트, 냉장고는 모서리, 러그는 중앙, 현창은 벽 중앙).
- **`cabinData.ts`/`CabinPlacedItem`**: view 모드도 scale/flipX/zIndex를 반영해야 해서
  `space_items` 조회 쿼리에 `scale, flip_x, z_index` 컬럼을 추가하고 타입/매핑을 갱신.
- **테스트**: `lib/domain/cabinPlacement.test.ts`(신규, 15개) — 카테고리 분류, 배치영역
  바운딩 박스, `clampToZone` 경계 고정, `depthOf` 정렬 규칙(y 차이가 크면 zIndex로 못
  뒤집힘/작으면 뒤집힘)을 순수 로직으로 검증.
- **실제 화면 검증**: 임시 `app/(dev)/cabin-editor-preview` 라우트(모의 데이터로
  `CabinEditor` 직접 렌더, 커밋 전 삭제)를 만들어 Playwright로 (A) 일반 모드 — 침대/책상/
  의자/화분/벽 액자가 실제 가구 비율로 자연스럽게 배치된 화면, (B) 편집 모드 — 가구 선택 시
  얇은 outline + 하단 컨트롤 패널(회전/반전/작게/크게/앞으로/뒤로/회수) 노출, (C) 침대를
  마우스로 벽 영역 쪽으로 드래그했을 때 `floor` 바운딩 박스 경계에서 정확히 멈추는 것(clamp
  동작)을 스크린샷+좌표 로그로 확인. `pageerror` 0건. `next build`/`vitest run`(63개, 신규
  15개 포함)/`tsc`/`eslint` 전부 통과.
- **범위상 하지 않은 것(다음 단계 후보)**: 완전한 polygon 충돌판정(현재는 바운딩 박스 MVP),
  가구 카테고리 자동분류 규칙의 100% 정확성(휴리스틱이라 애매한 소수 아이템은
  `SKU_OVERRIDES`로 계속 다듬어야 함), 실제 로그인 세션에서의 인벤토리→배치→저장→새로고침
  풀 사이클 수동 확인(샌드박스에 라이브 Supabase가 없어 스키마/권한 로직만 코드 검증, 실제
  DB 왕복은 사용자가 배포 환경에서 확인 필요).

## 선실 가구 방향/원근 정밀 보정 (후속 개선)

- **실제 원인 조사**: `room-base.png`(1473×909)를 픽셀 단위로 크롭해서 직접 확인한 결과,
  두 가지를 발견함 — (1) 오른쪽 벽에 이미 문(x≈0.78~0.90)과 그 자체 현창이 그려져 있고,
  왼쪽 벽에는 이미 커튼+현창이 그려져 있는데, 기본 배치의 책상(x=0.78)이 정확히 문 위치와
  겹쳐서 문을 가리고 있었음 — 좌표를 몇 px 옮기는 문제가 아니라 배경 그림의 실제 요소를
  전혀 고려하지 않고 좌표를 잡았던 게 근본 원인. (2) 기존 배치 좌표 중 일부(예: 냉장고/조명)가
  `ROOM_ZONES.floor`의 사각형 바운딩 박스 안에는 있었지만, 바닥이 실제로는 육각형(뒤로 갈수록
  좁아지는 다이아몬드) 모양이라 그 바운딩 박스보다 좁은 실제 폴리곤 밖에 있어서 벽 쪽에 붕
  뜬 것처럼 보일 수 있었음.
- **`lib/domain/cabinDecor.ts`에 `isInsideFloor(x,y)`(ray-casting 점-in-폴리곤 판정) +
  `DOOR_X_RANGE` 추가** — 바운딩 박스가 아니라 실제 바닥 육각형과 문 위치를 기준으로 기본
  배치 좌표를 검증. 침대(x=0.22,y=0.65)/책상(0.68,0.58)/의자(0.68,0.72)/냉장고(0.56,0.5)/
  스탠드조명(0.16,0.7)/러그(0.46,0.86) 전부 `isInsideFloor`로 실제 폴리곤 안에 있는지,
  책상·의자·냉장고는 `DOOR_X_RANGE` 밖에 있는지 vitest로 회귀 고정
  (`cabinPlacement.test.ts`, 12개 추가) — `app/api/onboarding/complete/route.ts`의
  `DEFAULT_FURNITURE_LAYOUT`과 `lib/game/cabinData.ts`의 `DEMO` 양쪽 다 이 좌표로 수정.
- **`PlacementDef`에 `drawnFacing`/`mirrorSafe` 추가**: 기존 가구 에셋은 전부 단일 각도로
  그려진 그림이라(방향별 스프라이트 없음) "전환 가능한 방향"을 만들 수는 없었음 —
  **CSS `rotate()`로 다른 방향인 척 만드는 것은 원근/광원이 깨져서 하지 않았고**, 대신
  `drawnFacing`(그 에셋이 원래 그려진 단일 시점을 기록하는 정보성 값)과 `mirrorSafe`(좌우
  반전만으로 자연스러운 카테고리인지 — 테이블/의자/러그/조명/벽장식/소품은 true, 침대/
  수납장/가전처럼 손잡이·헤드보드 등 비대칭 디테일이 있을 가능성이 높은 카테고리는 기본
  false)를 추가해서 최소한 "반전해도 되는 것과 안 되는 것"은 구분되게 했다.
  `CabinEditor`의 반전 버튼이 `mirrorSafe=false`인 선택 아이템에서는 비활성화된다.
- **⚠️ 하지 않은 것(정직하게 기록)**: 침대/책상 등이 "실제로 왼쪽 벽을 바라보는 각도"와
  "오른쪽 벽을 바라보는 각도"의 별도 그림으로 전환되는 것(요청서의 `wallLeft`/`wallRight`
  방향별 스프라이트)은 **새 그림 자산이 없어서 구현하지 않았다** — 기존 카탈로그 100여 종은
  각 아이템당 그림이 한 장씩만 있고, 이번 작업 범위(새 에셋 제작 없이 기존 코드/데이터 구조만
  개선)에서는 만들 수 없는 부분이다. 대신 그 한 장의 그림이 자연스럽게 읽히는 위치(침대는
  왼쪽 벽 쪽, 책상+의자는 문을 가리지 않는 오른쪽 벽 쪽, 액자는 두 벽이 만나는 중앙)를
  골라 배치하는 방식으로 현실적으로 개선했다. 방향별 스프라이트가 실제로 필요하면
  `PlacementDef.drawnFacing`을 기준으로 어떤 아이템에 어떤 각도 그림이 더 필요한지 이미
  분류돼 있어 나중에 자산이 추가되면 바로 연결할 수 있는 구조로 남겨둠.
- **검증**: `/cabin` 스크린샷으로 문이 더 이상 책상에 가려지지 않는 것 확인(수정 전/후 비교).
  `tsc`/`eslint`/`vitest run`(75개, 신규 12개 포함)/`next build` 전부 통과.

## 선실 가구 배치 metadata 재구조화 + keep-out zone (2차 후속 개선)

방향별 새 스프라이트 없이는 "모든 가구를 모든 방향에 자유배치"할 수 없다는 걸 인정하고,
대신 지금 가진 단일 각도 에셋 기준으로 배치 제약을 명시적인 데이터 구조로 정리하는 방향으로
범위를 좁혔다(사용자 요청). `CSS rotate(90deg)`로 방향을 억지로 바꾸는 코드는 여전히 어디에도
없다.

- **`PlacementDef` 필드 확장**(`lib/domain/cabinPlacement.ts`): `furnitureKind`(분류 라벨),
  `preferredZone`/`allowedZones`(지금은 항상 배열 1개짜리지만, 방향별 에셋이 생기면 여러
  zone을 지원하도록 배열로 열어둠), `defaultFacing`/`supportedFacings`(에셋이 실제로 그려진
  단일 시점 — 전환 가능한 방향이 아니라 "이 그림은 이 각도로 그려졌다"는 기록),
  `groundAnchorX`/`groundAnchorY`(현재는 항상 0.5/1=바닥 중앙 접점이지만, 여백이 있는
  에셋이 추가되면 아이템별로 조정 가능하도록 파라미터화), `mirrorSafe`(기존).

- **가구 분류표**(furnitureKind별):

  | furnitureKind | 분류 | placementType | mirrorSafe | 예시 sku |
  |---|---|---|---|---|
  | bed | zone-fixed, future-directional-needed | floor | ❌ | `furniture_bed`, `interior_bunk_bed`, `interior_baby_crib` |
  | storage | zone-fixed, future-directional-needed | floor | ❌ | `interior_wardrobe`, `interior_bookshelf`, `interior_display_cabinet` |
  | appliance | zone-fixed, future-directional-needed | floor | ❌ | `furniture_fridge`, `interior_record_player` |
  | table | mirror-safe | floor | ✅ | `furniture_desk`, `interior_round_dining_table` |
  | seat | mirror-safe | floor | ✅ | `furniture_chair`, `interior_rattan_chair` |
  | lamp | mirror-safe | floor | ✅ | `furniture_stand_light`, `interior_floor_lamp` |
  | smallDeco | mirror-safe | floor | ✅ | `interior_whale_plush`, `interior_hanging_planter` |
  | rug | mirror-safe | rug(바닥 하위) | ✅ | `furniture_rug`, `interior_oval_rug` |
  | wallDeco | **wall-only**, mirror-safe | wall | ✅ | `interior_lighthouse_frame`, `furniture_porthole` |

  "future-directional-needed"(bed/storage/appliance)는 방향별 스프라이트가 생기면 가장 덕을
  볼 후보 — 지금은 `mirrorSafe: false`라 편집기에서 반전 버튼이 비활성화된다(손잡이/헤드보드
  등 좌우 비대칭 디테일이 있을 가능성이 높아서, 확인 안 된 상태에서 반전을 허용하지 않음).

- **예시**(`getPlacementDef("furniture_bed")`가 돌려주는 값):
  ```ts
  {
    furnitureKind: "bed", placementType: "floor", preferredZone: "floor", allowedZones: ["floor"],
    baseHeightFrac: 0.34, defaultScale: 1, minScale: 0.8, maxScale: 1.3,
    defaultFacing: "front-left", supportedFacings: ["front-left"],
    mirrorSafe: false, groundAnchorX: 0.5, groundAnchorY: 1,
  }
  ```

- **편집기 keep-out zone**(`lib/domain/cabinDecor.ts`의 `DOOR_CLEARANCE`/`CHARACTER_SPAWN_ZONE`/
  `isInKeepOutZone`): 기본 배치 좌표를 고를 때뿐 아니라 **자유배치 드래그 중에도** 문 앞
  구간과 캐릭터가 서는 중앙 자리로는 바닥 가구를 끌어다 놓을 수 없게 했다 — 그 구간에 포인터가
  들어가면 좌표 갱신을 건너뛰고 직전 유효 위치를 유지(경계 밖으로 다시 나가면 다시 따라옴).
  Playwright로 책상을 문 앞 쪽으로, 러그를 캐릭터 자리로 드래그해봐도 실제로 그 구간엔
  들어가지 않는 것 확인.

- **검증**: `cabinPlacement.test.ts`에 20개 추가(총 83개) — `furnitureKind`/`allowedZones`/
  `supportedFacings`/`groundAnchor` 기본값, `isInKeepOutZone` 두 구간 판정. `tsc`/`eslint`/
  `vitest run`/`next build` 전부 통과. `pageerror` 0건.

- **⚠️ 여전히 하지 않은 것**: 진짜 방향 전환(왼쪽 벽용/오른쪽 벽용 별도 그림)은 이번에도
  구현하지 않음 — 새 에셋이 없으면 원천적으로 불가능하고, 이 점은 사용자도 이번 요청에서
  인정하고 범위를 좁혀줬다. `supportedFacings` 배열 구조는 이미 만들어뒀으니, 나중에 방향별
  그림이 추가되면 해당 아이템만 `SKU_OVERRIDES`에 `supportedFacings: ["front-left", "front-right"]`
  식으로 추가하고 렌더링 쪽에서 `item.facing`(신규 필드, 아직 없음)에 따라 어떤 그림을 쓸지
  고르는 분기만 추가하면 확장된다.

## 옷가게 모자/소품 시각적 착용 — 보류

사용자에게 확인한 결과, 항해모/안전모/스패너 그림 파일이 프로젝트에 없고(디자인 시안 폴더
전수 확인 — 의상 시트들도 전부 목 아래만 그려져 있어 모자/소품 단독 이미지가 한 장도 없음)
나중에 제공하기로 함. 그림 파일이 오면 `CustomizeScreen`/옷가게가 이미 쓰는
`character_equipment`/`appearance_json.hat`·`accessory` 데이터는 그대로 있으니, 헤드
앵커 좌표만 8종 체형별로 잡아서 `characterFullBody.ts`에 레이어를 추가하면 연결 가능하다.

## 가구상점

- 사용자가 준 디자인 시안(가구상점 UI)을 기준으로 신규 구현. **기존 구매 시스템을 그대로
  재사용** — 새 구매 API를 만들지 않고 이미 있던 `POST /api/store/purchase`(storeSlug +
  catalogItemId, 서버가 store_products/item_catalog 조회 → 잔액 검증 →
  `apply_wallet_transaction` → inventory_items insert)를 그대로 호출한다
  (`FurnitureStoreScreen.tsx`에서 `storeSlug: "furniture"`로 호출).
- **판매 상품**: `supabase/migrations/0008_furniture_store.sql`(**미적용**, `supabase db push`
  필요)로 `stores`에 `slug='furniture'` row를 추가하고, 이미 카탈로그에 있던 interior_pack
  소품(온보딩 때 무료 지급되는 것과 별개) 24종에 실제 판매가(`buy_price`)를 부여해
  `store_products`로 연결했다. 새 아이템/새 아트를 만들지 않고 기존 카탈로그·에셋만 재사용.
  중복 구매 허용(가구는 여러 개 살 수 있음, `inventory_items.quantity` 그대로 사용).
- **카테고리 탭**: 상품을 화면에 하드코딩하지 않고, 이전 방꾸미기 개편에서 만든
  `lib/domain/cabinPlacement.ts`의 sku 기반 카테고리 분류를 그대로 재사용해
  `lib/domain/furnitureStoreCategories.ts`에서 상점 탭(전체/침대/책상/의자/수납/장식/벽·바닥)으로
  매핑만 했다 — 같은 아이템이 선실 배치에서와 상점에서 항상 같은 카테고리로 취급됨.
- **미리보기(`previewFurniture`)**: 상품 카드를 눌러도 DB나 실제 선실 배치는 전혀 바뀌지
  않는 순수 client state(`FurnitureStoreScreen`의 `previewId`)로 관리. "미리보기" 버튼을
  눌러야 쇼룸에 크게 표시되도록 디자인 시안 그대로 구현(상품 선택=카드 선택,
  미리보기=쇼룸 표시를 분리). 쇼룸 크기 계산도 방꾸미기와 동일한
  `getPlacementDef(sku).baseHeightFrac`을 재사용해서, 상점에서 봤을 때도 침대/책상/화분의
  상대적 크기 차이가 실제 선실에 배치했을 때와 일치한다.
- **오늘의 추천**: 복잡한 추천 백엔드 없이 날짜 문자열(`YYYY-MM-DD`)의 문자코드 합을 상품
  개수로 나눈 나머지로 결정적 선택 — 같은 날엔 항상 같은 상품이 추천되고 서버 상태가 필요
  없다.
- **컴포넌트**: `FurnitureStoreScreen`(오케스트레이터) / `FurnitureStorePreview`(쇼룸+좌우
  화살표로 필터링된 목록 순환) / `FurnitureRecommendationCard` / `FurnitureStoreTabs` /
  `FurnitureProductCard`(NEW 배지 스카이블루, 선택 시 파란 테두리+체크) /
  `FurnitureStoreDetail`(하단 상세: 이름/설명/보유량/가격/미리보기·구매 버튼) — 디자인 이미지를
  배경으로 깔지 않고 전부 실제 DOM 컴포넌트로 구현.
- **진입점**: `/stores/furniture` 신규 라우트. 가방(`/inventory`) 헤더와 방꾸미기
  편집기(`/cabin/edit`, "가방에서 배치하기" 섹션)에 링크 추가 — 상점=구매, 선실=배치 역할을
  분리한 요청대로 가구상점에는 배치 편집 기능을 넣지 않았다.
- **구매 실패/중복 방지**: 클라이언트가 가격을 보내지 않고(서버가 catalog에서 직접 조회),
  잔액 부족 시 버튼 자체가 "잔액부족"으로 비활성화되고 서버도 `insufficient_funds`로 거절한다.
  구매 중엔 버튼이 `disabled`+"구매 중..."으로 바뀌어 더블클릭으로 중복 결제되지 않는다
  (기존 `/api/store/purchase`가 이미 이 로직을 갖고 있어 그대로 재사용).
- **검증**: 실 DB가 없어 임시 `app/(dev)/furniture-store-preview`(목데이터, 커밋 전 삭제)로
  Playwright 스크린샷 확인 — 전체 그리드, 카테고리 필터, 상품 선택(파란 테두리+체크),
  미리보기 쇼룸 반영까지 정상 동작 확인, `pageerror` 0건. `tsc`/`eslint`/`vitest run`(63개)/
  `next build` 전부 통과.

## 옷가게 (피팅룸)

- 사용자가 준 디자인 시안 기준 신규 구현. 핵심은 "상품을 누르면 구매 전에도 실제 캐릭터에게
  즉시 입혀본다" — 별도 캐릭터 렌더러를 새로 만들지 않고 기존 `CharacterSprite`를 그대로
  재사용했다(`components/store/ClothingFittingRoom.tsx`). `CharacterSprite`는 이전 세션에
  이미 `HEAD_MARGIN_TOP` 보정으로 "size = 머리~발끝 실제 높이"가 outfitAssetKey/
  fullPortraitKey/구버전 렌더링 방식 모두에서 동일하게 나오도록 고쳐져 있어서, size를
  고정해두는 것만으로 옷을 계속 갈아입어도 캐릭터 키/발 위치가 흔들리지 않는다(별도 CSS
  보정 없이 해녀/해남(항해사)/해남(기관사)/새싹 4종 × 옷 4~5벌씩 클릭해서 확인, 회귀 없음).
- **previewAppearance / equippedAppearance 분리**: 상품 클릭 → 기존
  `lib/domain/itemAppearance.ts`의 `ITEM_APPEARANCE_PATCH[sku]`를 클라이언트에서 그대로
  재사용해 `previewAppearance` state에만 병합(서버 호출 0회, DB 미변경). "착용하기"를 눌러야
  기존 `POST /api/character/equip`(character_managers 권한 검증 + slot upsert +
  appearance_json 병합, 이미 있던 라우트 그대로 재사용)을 호출해 실제로 저장한다. 구매는
  기존 `POST /api/store/purchase`를 그대로 재사용(storeSlug: "clothing"). 상점을 나가면
  저장 안 한 preview는 그냥 로컬 state라 자동 폐기됨(DB에 안 남음).
- **previewId 관리(Effect 없이)**: React 공식 "adjusting state when a prop changes" 패턴으로
  렌더 중에 이전 `data`와 비교해서 products/balance만 항상 동기화하고, **캐릭터를 바꿨을
  때만** preview를 리셋한다 — 구매 성공 후 호출하는 `router.refresh()`가 미리보기 중이던
  미구매 옷을 원래 착용 상태로 되돌리는 버그를 방지(리뷰 중 `react-hooks/set-state-in-effect`
  린트 규칙에 걸려서 useEffect 대신 이 패턴으로 다시 작성함).
- **캐릭터 호환성**: 새 metadata 컬럼을 추가하지 않고 기존 sku 네이밍 규칙
  (`haenyeo_*`/`haenam_deck_*`/`haenam_engine_*`/`child_*`, 이미 `item_catalog.subcategory`와
  온보딩 스타터 지급 로직이 쓰던 값과 동일)을 그대로 호환 키로 사용
  (`lib/domain/clothingStoreCategories.ts`의 `compatKeyFor`). 캐릭터를 바꾸면 그 캐릭터의
  호환 키에 맞는 상품만 다시 필터링된다.
- **캐릭터 전환**: `/stores/clothing?characterId=...` 쿼리 파라미터로 서버 컴포넌트가 다시
  데이터를 읽어오게 했다(디자인의 좌우 화살표를 캐릭터 전환에 사용). 다른 사용자가 관리하지
  않는 캐릭터의 appearance는 애초에 `character_managers` 기반으로 목록에 안 뜨고,
  저장 라우트(`/api/character/equip`)도 서버에서 다시 한번 권한을 검증한다(기존 로직 그대로).
- **탭 매핑**: 디자인의 7개 탭(전체/상의/하의/원피스/모자/신발/악세사리)을 그대로 유지하되,
  현재 카탈로그가 지원 안 하는 하의/신발은 가짜 데이터를 채우지 않고 항상 빈 상태로 둔다.
  원피스는 `outfit` 카테고리 중 sku에 "dress"가 들어간 것만 분리해서(진짜 데이터 기반, 하드코딩
  아님) 상의와 구분했다.
- **⚠️ 알아낸 기존 시스템의 한계(정직하게 기록)**: 옷가게 작업 중 확인한 것 — `hat`/
  `accessory` appearance 필드는 `CharacterSprite`의 **구버전 SVG 벡터 렌더링 경로에서만**
  실제로 그려지고(`Hat`/`Accessory` 컴포넌트), 지금 게임이 실제로 쓰는 일러스트 합성 렌더링
  경로(`kind` prop을 넘겨서 쓰는 outfitAssetKey/fullPortraitKey 방식, 이 프로젝트의 모든
  실제 캐릭터가 이 경로를 씀)에는 모자/소품을 합성하는 이미지 레이어가 아예 없다 —
  `CustomizeScreen`에서도 이미 같은 제약이 있던 기존 문제이고 옷가게가 새로 만든 버그는
  아니다. 그래서 옷가게에서 모자(항해모/안전모)·소품(스패너)을 구매/착용하는 기능 자체는
  정상 동작하고(appearance_json에 정확히 저장됨, `character_equipment`에도 정확히 반영됨)
  가격도 매겨져 있지만, 캐릭터 위에 시각적으로는 아직 안 보인다. "별도 캐릭터 렌더러를 새로
  만들지 말라"는 지시를 지키기 위해 이번 작업에서는 이 렌더링 갭을 직접 고치지 않았다 —
  고치려면 8종 체형별 모자/소품 이미지 앵커링을 `characterFullBody.ts`에 새로 추가하는
  별도 작업이 필요해서, 다음 단계 후보로 남겨둔다.
- **컴포넌트**: `ClothingStoreScreen`(오케스트레이터) / `ClothingFittingRoom`(캐릭터 미리보기 +
  좌우 캐릭터 전환) / `ClothingTabs` / `ClothingProductCard`(NEW·보유중·착용됨 표시) /
  `ClothingStoreDetail`(보유/미보유에 따라 착용하기·구매하기 버튼 상태 분기) — 전부 실제 DOM
  컴포넌트, 디자인 이미지를 배경으로 안 씀. `BackButton`은 가구상점과 공유.
- **마이그레이션(0009_clothing_store.sql, 미적용)**: `stores`에 `slug='clothing'` row 추가 +
  기존 hair를 제외한 outfit/hat/accessory 카탈로그 20종을 `store_products`로 연결 — 이
  아이템들은 이미 실제 가격이 매겨져 있어서(`buy_price`) 별도 가격 조정 없이 그대로 연결만
  했다. 헤어 5종은 참고 디자인에 대응 탭이 없어서 이번 옷가게 판매 목록에는 넣지 않음
  (기존 `CustomizeScreen`에서 계속 착용 가능).
- **진입점**: `/stores/clothing` 신규 라우트. `/character/[id]/customize`(내가 관리하는
  캐릭터일 때만)와 `/inventory` 헤더에 링크 추가.
- **검증**: 임시 `app/(dev)/clothing-store-preview`(해녀/해남 항해사/해남 기관사/새싹 4종
  목데이터, 커밋 전 삭제)로 Playwright 확인 — 4종 캐릭터 각각 옷 4~5벌 연속 클릭해도 머리
  크기/목 연결/발 위치/캐릭터 전체 높이 불변, 미보유 아이템 클릭 시 DB 변경 없이 즉시
  미리보기, 보유+착용 아이템은 "착용중" 비활성 버튼, 하의/신발 탭은 정직한 빈 상태 문구
  확인. `/cabin`·`/home` 등 기존 CharacterSprite 사용 화면도 스크린샷으로 회귀 없음 확인.
  `pageerror` 0건. `tsc`/`eslint`/`vitest run`(63개)/`next build` 전부 통과.

## 캐릭터 의상 시트 3/5/8 정규화 (새싹·남아 유아 체형, 백로그 작업)

기존 세션에서 처리했던 "캐릭터 의상 (1).png"(해녀 원피스류)에 이어, 남은 시트 중
`normalize_dress_overlays.py` 파이프라인이 그대로 통하는(칸당 옷+신발만 있고 모자가 없는)
시트 3장을 마저 처리했다.

- **처리한 시트**: "캐릭터 의상 (3)/(5)/(8).png" — 셋 다 남아 유아(child_toddler_male) 체형
  스타일이라 동일 `kind`로 처리. 시트당 9벌씩 총 27장을 `public/images/character/dress_full/`에
  생성(`child_toddler_male_dress_s3_01~09`, `_s5_01~09`, `_s8_01~09`).
- **⚠️ 작업 중 발견한 스크립트 버그(수정함)**: `extract_grid`/`compose_all`은 출력 파일명을
  항상 `<kind>_dress_01~09`로 고정해서 쓴다 — 같은 `kind`로 두 번째 시트를 돌리면 첫 번째
  시트의 결과물을 그대로 덮어쓴다. 시트 5를 시트 3 다음에 그대로 돌렸다가 실제로 시트 3
  결과물이 덮어써진 것을 확인(git에 커밋 전이라 히스토리에 없었음) — 시트 3을 다시 돌리고,
  이후로는 시트마다 결과물을 `_s3_`/`_s5_`/`_s8_` 접미사로 즉시 리네임해서 충돌을 피했다.
  중간 크롭 산출물(`public/images/character/<kind>/dress/`, `dress_shoes/`)은 앱 코드
  어디서도 참조하지 않는 스크립트 내부 작업 파일이라(`fullPortraitKey`로 참조되는 건
  `dress_full/*.png`뿐 — grep으로 확인) 덮어써져도 실제 데이터 손실은 없다.
- **시각 검증**: 시트별 9벌을 가로로 이어붙인 contact sheet 이미지를 생성해서 확인 —
  세일러룩/멜빵바지/가디건/곰돌이 후드/니트조끼/하와이안셔츠/파자마/사파리자켓 등 27벌
  전부 어깨/발 위치 앵커링 정상, 체형 비율 왜곡 없음.
- **⚠️ 카탈로그에 연결하지 않음(의도적, 이유 기록)**: 시트 1(해녀)과 달리 이번엔 새 SKU를
  `item_catalog`에 연결하지 않았다. 이유: `item_catalog.kind`는 `'child'` 하나로 새싹
  4단계(유아/유치원/초등 등) × 2성별을 전부 묶어서 관리하는데(마이그레이션 확인:
  `check (kind in ('haenyeo','haenam','child'))`), `fullPortraitKey`로 참조하는
  `dress_full/*.png`는 특정 체형(base 이미지) 위에 이미 합성이 끝난 "완성 그림"이라 체형별로
  따로 만들어야 한다(해녀/해남은 체형이 각 1종이라 이 문제가 없었음). 지금 만든 27장은 전부
  `child_toddler_male` 체형 전용이라, 만약 이걸 그대로 `child_outfit_*` 같은 범용 새싹 SKU에
  연결하면 다른 새싹(여아, 유치원생, 초등학생 등)이 착용했을 때 실제 캐릭터 체형과 다른
  유아 남아 그림이 뜨는 눈에 보이는 버그가 생긴다. 이 불일치를 감수하고 억지로 연결하는 대신
  자산만 만들어두고 연결은 보류했다 — 진짜 해결하려면 (a) 새싹 8체형(유아/유치원/초등 ×
  남/여) 전부에 대해 같은 시트를 반복 처리하거나 (b) `item_catalog`에 체형별 SKU 분기를
  새로 추가하는 설계 변경이 필요한데, 둘 다 이번 백로그 처리 범위를 넘어서 다음 단계로 남긴다.
## 캐릭터 의상 시트 2/4/6/9 추가 처리 + 파이프라인 버그 4종 수정 (같은 백로그, 후속 작업)

"이거 전부 하는데 효율적인 방법으로 해봐"(사용자 요청)에 따라 시트 4/9를 다시 살펴보니 —
이전에 "모자/소품만 있고 몸통 없음"으로 잘못 분류했던 것과 달리 실제로는 시트 3/5/8과 같은
"머리~발끝 없는 옷만 그려진 3x3 그리드"였다(직접 열어서 확인 후 재분류). 시트 2/6(여아 스타일,
모자+옷+가방+신발)까지 포함해 총 4개 시트를 더 처리했고, 그 과정에서 스크립트의 신발/모자
분류 로직에 실제로 존재하던 버그 4개를 발견해 전부 고쳤다. **이미 커밋했던 시트 3/5/8 결과물도
전부 이 버그들의 영향을 받고 있어서 같이 재생성했다** — 아래 순서대로 하나씩 실제 합성 결과를
전체 해상도로 열어보며 찾아낸 것들이다(썸네일 contact sheet만으로는 안 보였다):

1. **`_largest_component_only`를 신발 크롭에도 적용하던 버그**: 왼쪽/오른쪽 신발이 서로 안
   붙어있어 연결요소가 2개인 크롭이 대부분인데(신발 쌍의 대부분이 이런 케이스였음), "가장 큰
   덩어리만 남기기"를 적용하면 한쪽 신발이 통째로 사라진다 — 실제로 캐릭터 한쪽 발이 맨발로
   렌더되는 걸 발견(`child_toddler_male_dress_s3_01` 원본을 열어보고 확인). 신발 크롭은
   `extract_grid`가 이미 셀 단위로 정확히 잘라둔 것이라 별도 정리 없이 그대로 쓰도록 수정.
2. **같은 `kind`로 여러 시트를 연달아 처리하면 중간 산출물이 안 지워지는 버그**: 이번 시트에서
   신발이 옷단에 이미 붙어있어(그래서 별도 신발 크롭을 안 만드는) 셀이, 직전에 같은 kind로
   처리했던 *다른 시트*의 그 인덱스 신발 파일을 조용히 재사용해버렸다 — 신발 대신 가방 그림이
   발에 합성되는 버그로 실제 발견(시트 6 idx07). `extract_grid` 시작 시 `dress`/`dress_shoes`
   디렉터리를 비우고 시작하도록 수정.
3. **신발 스케일을 고정 목표 너비(TARGET_SHOE_W=130px)로 맞추던 버그**: 신발 크롭에 두 짝이
   다 든 것도, 한쪽만 든 것도 있는데(반대쪽은 옷단에 이미 붙어있어서), 고정 너비를 쓰면
   한 짝짜리 크롭이 두 짝 크기로 부풀려져 항아리처럼 보였다(시트2 idx07에서 실제 발견). 옷과
   같은 배율(`scale`, 어깨폭 기준)을 신발에도 그대로 써서 원본 시트 안에서의 상대 크기를
   유지하도록 수정.
4. **"덩어리 2개면 작은 쪽 = 신발" 레거시 분기, "모자/장갑처럼 셀 하단 60% 부근에 있는
   소품"을 신발로 오분류하는 문제**: 모자만 있고(신발은 옷단에 이미 붙어) 덩어리가 정확히
   2개인 셀에서 모자가 옷보다 작으면 "작은 쪽 = 신발" 규칙이 모자를 신발로 오분류해 발밑에
   모자가 렌더됐다(시트4 idx01 캡틴모자). 또 안전조끼+장갑처럼 손 높이가 셀의 60%보다 아래에
   있는 정장류 시트에서는 장갑이 y-위치 기준을 우연히 통과해 신발로 오분류됐다(시트9 idx02).
   덩어리 개수와 무관하게 "가장 큰 덩어리 = 옷, 나머지 중 셀 하단부 + 옷 가로범위 안 +
   최소 크기(3500px) 이상"만 신발로 묶는 단일 규칙으로 통일해 둘 다 해결.

처리 결과:
- **시트 4**(선장복/우비/가디건+가방/니트+목도리/한복/강아지 잠옷/파자마/하와이안셔츠 등,
  toddler_male 스타일) → `child_toddler_male_dress_s4_01~09`.
- **시트 6**(여아 토들러 원피스류, 모자·머리핀 있음) → `child_toddler_female_dress_s6_01~09`.
- **시트 2**(공주풍 원피스+가방, 여아 토들러) → `child_toddler_female_dress_s2_01~09`.
- **시트 9**(정장/유니폼류, 더 성숙한 비율) → 처음엔 `child_kindergarten_male`로 합성했더니
  옷단과 실제 발 사이에 맨다리가 크게 남는 비율 불일치가 나서(반팔/반바지 정장류가 그 체형
  다리 길이와 안 맞음), `child_elementary_male`로 바꿔서 재처리 — 잘 맞음.
  `child_elementary_male_dress_s9_01~09`.
- 기존 시트 3/5/8(`child_toddler_male`)도 버그 수정된 스크립트로 전부 재생성.
- **총 63장**(7개 시트 × 9벌)을 시트별 contact sheet + 의심스러운 칸은 개별 전체 해상도로
  다시 열어서 확인 — 신발 양쪽 다 있음/모자·가방·인형 등 소품이 옷에 안 섞여있음/비율 왜곡
  없음을 전부 확인.
- **카탈로그 연결은 이번에도 보류**(이유는 시트 3/5/8과 동일 — `item_catalog.kind='child'`가
  8체형을 하나로 묶어 관리해서, 특정 체형 전용으로 합성된 `dress_full` 자산을 범용 SKU에
  그대로 연결하면 다른 체형 새싹이 착용했을 때 그림이 안 맞는 버그가 생긴다).
- **남은 백로그**: 시트 7/10은 이번에도 처리하지 않았다 — 직접 열어보니 칸마다 우산/인형
  장난감/선글라스/가방 같은 이 게임에 대응 슬롯이 아예 없는 소품이 다수 섞여 있고, 무엇보다
  **한 시트 안에서도 칸마다 의도된 성별이 다르다**(교복풍 남아 아이템과 원피스 여아 아이템이
  같은 시트에 공존) — 이건 크기/위치 휴리스틱으로 풀 수 있는 문제가 아니라 칸 단위로 수동
  검수하며 body kind를 골라야 해서, 이번 자동 처리 범위 밖으로 남겨둔다. 선박 일러스트 7종도
  여전히 사용자 작화 대기.
- 코드 변경: `scripts/asset-tools/normalize_dress_overlays.py`만 수정(신발/모자 분류 로직).
  앱 런타임 코드 변경 없음 — `tsc`/`vitest run`(83개) 통과 확인.
