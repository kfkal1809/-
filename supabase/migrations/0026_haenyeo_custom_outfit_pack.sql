-- 2026-09-07 사용자가 GitHub에 새로 업로드한 haenyeo_outfit_06/08~20.png(MASTER 캔버스에
-- 이미 스킨 분리까지 끝난 원본) 중, 눈 가림/좌표 결함 검수를 통과한 11종을 새 상품으로
-- 등록한다. 기존 haenyeo_outfit_* SKU(0009/0010/0019/0023/0024)는 전혀 건드리지 않는다 —
-- 같은 파일 번호(haenyeo_outfit_06 등)를 기존 SKU가 이미 outfitAssetKey로 물고 있지만,
-- 실제 디자인을 비교해보니 기존 상품명/디자인과 신규 원화가 서로 다른 별개의 옷이라
-- (예: 기존 "오트밀 맨투맨"은 줄무늬 상의+청바지인데 신규 06번은 민트 니트+반바지) 기존
-- 상품 그림을 덮어씌우지 않고 완전히 새로운 SKU(haenyeo_custom_outfit_NN, 기존 번호형
-- asset key와 충돌하지 않도록 custom 네임스페이스 사용)로 분리했다.
--
-- 08,14,17(불완전/좌표 결함)과 01~05,07(미업로드)은 이 마이그레이션에 포함하지 않는다 —
-- 재업로드 후 별도 마이그레이션에서 추가한다.

insert into public.item_catalog
  (sku, name, description, category, subcategory, rarity, buy_price, sell_price, placeable, source_label, active)
values
  ('haenyeo_custom_outfit_06', '민트 베어 데일리룩', '민트 베어 데일리룩', 'outfit', 'haenyeo', 'common', 11, 2, false, '커스텀 의상 팩', true),
  ('haenyeo_custom_outfit_09', '핑크 버니 파자마', '핑크 버니 파자마', 'outfit', 'haenyeo', 'common', 10, 2, false, '커스텀 의상 팩', true),
  ('haenyeo_custom_outfit_10', '브라운 베어 체크 파자마', '브라운 베어 체크 파자마', 'outfit', 'haenyeo', 'common', 11, 2, false, '커스텀 의상 팩', true),
  ('haenyeo_custom_outfit_11', '크림 더플코트룩', '크림 더플코트룩', 'outfit', 'haenyeo', 'rare', 15, 3, false, '커스텀 의상 팩', true),
  ('haenyeo_custom_outfit_12', '데이지 가드닝룩', '데이지 가드닝룩', 'outfit', 'haenyeo', 'common', 12, 3, false, '커스텀 의상 팩', true),
  ('haenyeo_custom_outfit_13', '블랙 피기 오버롤', '블랙 피기 오버롤', 'outfit', 'haenyeo', 'common', 11, 2, false, '커스텀 의상 팩', true),
  ('haenyeo_custom_outfit_15', '블루 플라워 데일리룩', '블루 플라워 데일리룩', 'outfit', 'haenyeo', 'common', 10, 2, false, '커스텀 의상 팩', true),
  ('haenyeo_custom_outfit_16', '크림 베어 후드룩', '크림 베어 후드룩', 'outfit', 'haenyeo', 'common', 11, 2, false, '커스텀 의상 팩', true),
  ('haenyeo_custom_outfit_18', '마린 세일러 원피스', '마린 세일러 원피스', 'outfit', 'haenyeo', 'rare', 14, 3, false, '커스텀 의상 팩', true),
  ('haenyeo_custom_outfit_19', '핑크 플라워 가디건룩', '핑크 플라워 가디건룩', 'outfit', 'haenyeo', 'rare', 13, 3, false, '커스텀 의상 팩', true),
  ('haenyeo_custom_outfit_20', '크림 베어 홈웨어', '크림 베어 홈웨어', 'outfit', 'haenyeo', 'common', 11, 2, false, '커스텀 의상 팩', true)
on conflict (sku) do nothing;

insert into public.store_products (store_id, catalog_item_id, sort_order, active)
select
  (select id from public.stores where slug = 'clothing'),
  ic.id,
  1200 + row_number() over (order by ic.sku),
  true
from public.item_catalog ic
where ic.sku in (
  'haenyeo_custom_outfit_06',
  'haenyeo_custom_outfit_09',
  'haenyeo_custom_outfit_10',
  'haenyeo_custom_outfit_11',
  'haenyeo_custom_outfit_12',
  'haenyeo_custom_outfit_13',
  'haenyeo_custom_outfit_15',
  'haenyeo_custom_outfit_16',
  'haenyeo_custom_outfit_18',
  'haenyeo_custom_outfit_19',
  'haenyeo_custom_outfit_20'
)
and not exists (
  select 1 from public.store_products sp
  where sp.store_id = (select id from public.stores where slug = 'clothing')
    and sp.catalog_item_id = ic.id
);
