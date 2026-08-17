-- 숲의 요정 시리즈(18종, design-assets/숲의 요정 시리즈.png에서 크롭) — 가구상점에 추가.
-- 0011_vintage_furniture_pack과 같은 패턴. fairy_wall_lantern만 SKU_OVERRIDES로 벽 배치를 강제하고,
-- fairy_mushroom_stand_light는 sku 이름에 stand_light를 포함시켜 별도 override 없이 lamp로 분류된다
-- (lib/domain/cabinPlacement.ts classify(), cabinPlacement.test.ts 회귀 테스트로 고정).
insert into public.item_catalog (sku, name, description, category, subcategory, rarity, buy_price, sell_price, placeable, source_label, active) values
  ('fairy_bed', '숲의 요정 침대', '나뭇잎과 꽃으로 장식된 침대', 'furniture', 'shop', 'rare', 30, 7, true, '숲의 요정 컬렉션', true),
  ('fairy_desk', '요정 나뭇잎 책상', '커다란 잎사귀로 장식된 책상', 'furniture', 'shop', 'common', 18, 4, true, '숲의 요정 컬렉션', true),
  ('fairy_stool_chair', '나뭇잎 스툴', '잎사귀 등받이가 달린 스툴', 'furniture', 'shop', 'common', 12, 2, true, '숲의 요정 컬렉션', true),
  ('fairy_drawer_cabinet', '요정 서랍장', '꽃과 잎으로 장식된 서랍장', 'furniture', 'shop', 'common', 12, 2, true, '숲의 요정 컬렉션', true),
  ('fairy_loveseat', '이끼 러브시트', '초록빛 이끼색 러브시트', 'furniture', 'shop', 'common', 18, 4, true, '숲의 요정 컬렉션', true),
  ('fairy_round_rug', '꽃무늬 러그', '하얀 꽃이 그려진 원형 러그', 'furniture', 'shop', 'common', 9, 2, true, '숲의 요정 컬렉션', true),
  ('fairy_book_lantern_shelf', '요정 책 랜턴 선반', '책과 랜턴을 올린 넝쿨 선반', 'furniture', 'shop', 'common', 13, 3, true, '숲의 요정 컬렉션', true),
  ('fairy_frame_flower', '꽃 액자', '꽃 그림이 담긴 나무 액자', 'furniture', 'shop', 'common', 6, 1, true, '숲의 요정 컬렉션', true),
  ('fairy_frame_leaf', '나뭇잎 액자', '나뭇잎 그림이 담긴 나무 액자', 'furniture', 'shop', 'common', 6, 1, true, '숲의 요정 컬렉션', true),
  ('fairy_frame_mushroom', '버섯 액자', '버섯 그림이 담긴 나무 액자', 'furniture', 'shop', 'common', 6, 1, true, '숲의 요정 컬렉션', true),
  ('fairy_wall_lantern', '요정 벽걸이 랜턴', '꽃봉오리 모양 벽등', 'furniture', 'shop', 'common', 7, 2, true, '숲의 요정 컬렉션', true),
  ('fairy_floor_lamp', '꽃봉오리 플로어램프', '고개 숙인 꽃봉오리 모양 램프', 'furniture', 'shop', 'common', 8, 2, true, '숲의 요정 컬렉션', true),
  ('fairy_potted_flower', '화분', '하얀 꽃이 핀 화분', 'furniture', 'shop', 'common', 5, 1, true, '숲의 요정 컬렉션', true),
  ('fairy_round_table', '나무 그루터기 테이블', '꽃무늬 상판이 있는 그루터기 테이블', 'furniture', 'shop', 'common', 12, 2, true, '숲의 요정 컬렉션', true),
  ('fairy_mushroom_stand_light', '버섯 스탠드 조명', '은은하게 빛나는 버섯 모양 조명', 'furniture', 'shop', 'common', 8, 2, true, '숲의 요정 컬렉션', true),
  ('fairy_acorn_box_deco', '도토리 상자', '도토리 모양 수납 상자', 'furniture', 'shop', 'common', 6, 1, true, '숲의 요정 컬렉션', true),
  ('fairy_leaf_deco', '나뭇잎 쿠션', '커다란 나뭇잎 모양 쿠션', 'furniture', 'shop', 'common', 4, 1, true, '숲의 요정 컬렉션', true),
  ('fairy_teacup_deco', '꽃무늬 찻잔', '꽃무늬가 그려진 찻잔 세트', 'furniture', 'shop', 'common', 5, 1, true, '숲의 요정 컬렉션', true)
on conflict (sku) do nothing;

insert into public.store_products (store_id, catalog_item_id, sort_order, active)
select
  (select id from public.stores where slug = 'furniture'),
  ic.id,
  1200 + row_number() over (order by ic.sku),
  true
from public.item_catalog ic
where ic.sku in ('fairy_bed', 'fairy_desk', 'fairy_stool_chair', 'fairy_drawer_cabinet', 'fairy_loveseat', 'fairy_round_rug', 'fairy_book_lantern_shelf', 'fairy_frame_flower', 'fairy_frame_leaf', 'fairy_frame_mushroom', 'fairy_wall_lantern', 'fairy_floor_lamp', 'fairy_potted_flower', 'fairy_round_table', 'fairy_mushroom_stand_light', 'fairy_acorn_box_deco', 'fairy_leaf_deco', 'fairy_teacup_deco')
  and exists (select 1 from public.stores where slug = 'furniture')
  and not exists (
    select 1 from public.store_products sp
    where sp.store_id = (select id from public.stores where slug = 'furniture')
      and sp.catalog_item_id = ic.id
  );
