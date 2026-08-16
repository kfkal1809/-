# 새 꾸미기 아이템(의상/악세서리/인테리어 소품) 적용 파이프라인

사용자가 옷/악세서리/인테리어 소품 등을 그려서 조금씩 보내줄 예정이라, 매번 여기서부터
설계를 다시 하지 않도록 절차를 정리해둔다. 다음 세션의 나(Claude)도 이 문서만 보고 바로
착수할 수 있어야 한다.

## 0. 사용자가 보내는 방법

- `design-assets/` 폴더에 원본 시트를 올려주면 된다 (지금까지처럼 GitHub 웹 업로드 or
  대화 중 파일 첨부 모두 가능). 시트 1장에 여러 아이템이 격자로 배치되어 있어도 되고,
  낱장이어도 된다. 배경/캔버스 크기를 맞춰서 그릴 필요 없음 — 비율/정렬은 이쪽에서 처리한다.

## 1. 크롭

- `scripts/asset-tools/crop_sheet.py`의 `crop_grid()`를 사용한다 (이 세션에서 반복
  사용하던 파이프라인을 정리해 커밋해둔 것 — 매번 스크래치패드에 새로 만들지 말 것).
- 절차: 시트를 큰 이미지로 열어 50px 격자선을 오버레이한 스크린샷을 만들어(Read 툴로
  확인) 각 아이템의 정확한 픽셀 박스를 잡는다 → `crop_grid(src, out_dir, cells, names)`
  호출 → 결과 PNG들을 몽타주로 이어붙여 한 번에 확인한다.
- 배경이 단색이면 `remove_bg_and_trim`으로 완전 투명화된다. 배경이 하늘/바다 그라데이션처럼
  단색이 아니면(이번 홈 화면 등대/배 소품이 그 경우) `feather_edges`로 가장자리만 부드럽게
  페이드시켜 앱 배경 위에 자연스럽게 얹는다 — 완벽한 알파 분리보다 실용적인 타협.
- 라벨 텍스트(아이템 이름 등)는 크롭 박스 자체에서 제외한다. 자동 감지는 신뢰도가 낮아서
  포기하고 격자선 눈금으로 좌표를 직접 잡는 방식이 결과적으로 더 빠르고 정확했다.

## 2. 저장 위치 — 두 갈래

**(A) 기존 item_catalog 아이템의 아이콘** (인벤토리/낚시/가게 등에 이미 존재하는 sku):

1. `public/images/items/<sku>.png` 로 저장
2. `lib/domain/itemIcons.ts`의 `ITEM_ICON_SKUS` Set에 sku 문자열 추가
3. 끝 — 화면 쪽 코드는 이미 `itemIconSrc(sku)`로 있으면 이미지, 없으면 기존 희귀도 뱃지로
   자동 대체되도록 짜여 있어서 별도 수정 불필요 (inventoryData/cabinData/storeData/
   fishing 결과 등 전부 이 헬퍼 하나만 거친다).

**(B) 완전히 새로운 아이템** (아직 item_catalog에 없는 새 옷/가구/소품):

1. 위와 동일하게 크롭 후 `public/images/items/<sku>.png` 저장 (sku는 새로 짓는다 —
   기존 네이밍 패턴 참고: `fish_`, `furniture_`, `bonppuri_`, `restore_`, `legend_`,
   `child_outfit_` 등 카테고리 접두어 + 짧은 영문 설명)
2. `supabase/seed.sql`에 `item_catalog` INSERT 행 추가 (subcategory, 가격, 획득 경로
   등은 같은 카테고리의 기존 행을 그대로 본떠서 채움 — 예: 새 가구면 기존
   `furniture_*` 행 옆에, 새 본뿌리 소품이면 `bonppuri_*` 행 옆에)
3. `ITEM_ICON_SKUS`에 추가
4. 실제 Supabase가 연결된 배포 환경에서는 `supabase db execute -f supabase/seed.sql`
   재실행 필요(이 저장소 자체 dev 환경은 데모 데이터로 렌더링되므로 이 리포에서는
   즉시 확인 가능)

**(C) 캐릭터 헤어/의상** (해녀/해남/새싹 몸에 입히는 레이어):

- `public/images/character/{haenyeo,haenam,child}/{hair,outfit}/*.png`에 같은 명명
  규칙으로 추가 (`haenyeo_hair_21.png`처럼 다음 번호로).
- 합성 방식은 `docs/PROGRESS.md`의 "캐릭터 레이어 아트" 절 참고: 얼굴은 헤어 그림에
  이미 포함되어 있어서 별도 얼굴 합성 없이 의상 위에 헤어를 약 16% 겹쳐 올리면 된다.
- 단, 아직 실제 게임 화면(`CharacterSprite.tsx`)에는 연결되어 있지 않다 (다음 세션
  작업 예정, `docs/PROGRESS.md` 참고). 지금 새 헤어/의상을 보내줘도 에셋으로 저장은
  되지만 커스터마이즈 화면에 바로 선택지로 뜨지는 않는다 — 그 연결 작업이 끝난 뒤부터
  자동으로 반영됨.

## 3. 확인

- Playwright로 해당 화면 스크린샷 찍어서 실제로 잘 보이는지 확인 (배경 제거 잔여물,
  라벨 잔여물, 잘못된 크롭 등은 즉시 눈에 띔).
- 확인 후 `docs/PROGRESS.md`에 한 줄 기록, 커밋+푸시.

## 요약

이미 대부분의 "적용" 작업은 **파일 하나 놓고 whitelist에 sku 한 줄 추가**로 끝나도록
짜여 있다 (구조 A). 새 아이템 자체를 새로 만드는 경우만 seed.sql 행 추가가 필요하다
(구조 B). 즉, 이 문서 이후로는 사용자가 사진을 보내면 "크롭 → 저장 → (필요시 seed 행) →
whitelist" 네 단계만 반복하면 된다.
