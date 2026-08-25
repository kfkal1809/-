-- 캐릭터 의상 시트 7/10(18벌, dress_full 체형별 합성 이미지) 카탈로그 등록 — 0010과 같은
-- 패턴으로, 여기서는 item_catalog에 '논리적 상품'만 추가한다(가격/이름/카테고리). subcategory는
-- 기존 규칙대로 'child'이고, 실제로 어떤 체형이 착용 가능한지는 lib/domain/itemAppearanceVariants.ts의
-- isCompatibleWithBody()가 옷가게 목록 단계에서 추가로 걸러낸다.
--
-- 시트 7/10은 시트 2~9와 달리 한 시트 안에서도 칸마다 의도된 성별이 달라(교복풍 남아 아이템과
-- 원피스 여아 아이템이 공존) 자동 파이프라인을 시트 전체에 한 번만 돌릴 수 없었다 — 셀마다
-- 남아/여아 체형 양쪽으로 합성해보고 실제 결과를 보고 골랐다(자세한 내용은 docs/PROGRESS.md 참고).
insert into public.item_catalog (sku, name, description, category, subcategory, rarity, buy_price, sell_price, placeable, source_label, active) values
  ('child_dress_s7_01', '옐로우 곰돌이 레인코트', '곰돌이 후드가 달린 옐로우 레인코트', 'outfit', 'child', 'common', 9, 2, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s7_02', '스트로베리 파자마', '딸기 무늬 파자마와 토끼 슬리퍼', 'outfit', 'child', 'common', 8, 2, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s7_03', '크림 니트 원피스', '벨트가 달린 크림색 케이블 니트 원피스', 'outfit', 'child', 'common', 10, 2, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s7_04', '로즈핑크 한복', '벚꽃 자수 로즈핑크 한복', 'outfit', 'child', 'rare', 14, 3, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s7_05', '그린 깅엄 레이스 세트', '깅엄 체크 리본과 레이스 케이프 세트', 'outfit', 'child', 'common', 10, 2, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s7_06', '옐로우 리본 멜빵바지', '노란 리본 머리띠와 데님 멜빵바지', 'outfit', 'child', 'common', 8, 2, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s7_07', '네이비 세일러 가디건', '스트라이프 셔츠 위 화이트 가디건과 와이드 팬츠', 'outfit', 'child', 'common', 9, 2, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s7_08', '스트로베리 스웨트 세트', '딸기 무늬 스웨트셔츠와 반바지', 'outfit', 'child', 'common', 8, 2, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s7_09', '레드 퍼트림 원피스', '체크 리본과 퍼 트림이 달린 레드 원피스', 'outfit', 'child', 'rare', 14, 3, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s10_01', '네이비 세일러 원피스', '리본이 달린 네이비 세일러 원피스', 'outfit', 'child', 'common', 10, 2, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s10_02', '핑크 깅엄 가디건 원피스', '크림 가디건과 핑크 깅엄 원피스 세트', 'outfit', 'child', 'common', 10, 2, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s10_03', '블루 스트라이프 캐주얼 세트', '스트라이프 티셔츠와 데님 반바지', 'outfit', 'child', 'common', 8, 2, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s10_04', '아이보리 니트 조거 세트', '니트 상의와 핑크 조거 팬츠, 토끼 슬리퍼', 'outfit', 'child', 'common', 8, 2, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s10_05', '데님 오버롤 원피스', '토끼 가방을 멘 데님 멜빵 원피스', 'outfit', 'child', 'common', 10, 2, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s10_06', '블랙 보타이 세트', '보타이가 달린 화이트 셔츠와 블랙 반바지', 'outfit', 'child', 'rare', 14, 3, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s10_07', '핑크 버니백 후드티', '토끼 가방을 멘 핑크 후드티', 'outfit', 'child', 'common', 9, 2, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s10_08', '플로럴 선드레스', '꽃무늬 스트랩 원피스와 밀짚모자', 'outfit', 'child', 'common', 10, 2, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s10_09', '베이지 멜빵 원피스', '리본 머리띠와 베이지 멜빵 원피스', 'outfit', 'child', 'common', 10, 2, false, '캐릭터 의상 컬렉션', true)
on conflict (sku) do nothing;

insert into public.store_products (store_id, catalog_item_id, sort_order, active)
select
  (select id from public.stores where slug = 'clothing'),
  ic.id,
  1100 + row_number() over (order by ic.sku),
  true
from public.item_catalog ic
where ic.sku in ('child_dress_s7_01', 'child_dress_s7_02', 'child_dress_s7_03', 'child_dress_s7_04', 'child_dress_s7_05', 'child_dress_s7_06', 'child_dress_s7_07', 'child_dress_s7_08', 'child_dress_s7_09', 'child_dress_s10_01', 'child_dress_s10_02', 'child_dress_s10_03', 'child_dress_s10_04', 'child_dress_s10_05', 'child_dress_s10_06', 'child_dress_s10_07', 'child_dress_s10_08', 'child_dress_s10_09')
  and exists (select 1 from public.stores where slug = 'clothing')
  and not exists (
    select 1 from public.store_products sp
    where sp.store_id = (select id from public.stores where slug = 'clothing')
      and sp.catalog_item_id = ic.id
  );
