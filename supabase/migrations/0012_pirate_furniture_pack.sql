-- 캐리비안의 해적 시리즈(16종, design-assets/캐리비안의 해적 시리즈.png에서 크롭) — 가구상점에 추가.
-- 0011_vintage_furniture_pack과 같은 패턴: item_catalog에 category='furniture', subcategory='shop'으로
-- 추가하면 store_products insert 쿼리가 그대로 furniture 상점에 연결한다.
-- furnitureKind는 lib/domain/cabinPlacement.ts classify()가 sku 이름 패턴으로 자동 분류하고,
-- pirate_wall_lantern만 SKU_OVERRIDES로 벽 배치를 강제한다(cabinPlacement.test.ts 회귀 테스트로 고정).
insert into public.item_catalog (sku, name, description, category, subcategory, rarity, buy_price, sell_price, placeable, source_label, active) values
  ('pirate_bed', '해적 침대', '해골 문양 헤드보드가 달린 해적 침대', 'furniture', 'shop', 'rare', 32, 8, true, '캐리비안의 해적 컬렉션', true),
  ('pirate_desk', '해적 선장 책상', '지도와 서류가 놓인 골동 책상', 'furniture', 'shop', 'common', 20, 4, true, '캐리비안의 해적 컬렉션', true),
  ('pirate_office_chair', '해적 오피스 체어', '앵커 문양이 새겨진 가죽 체어', 'furniture', 'shop', 'common', 16, 3, true, '캐리비안의 해적 컬렉션', true),
  ('pirate_treasure_chest', '해적 보물 상자', '자물쇠가 달린 빈티지 트렁크', 'furniture', 'shop', 'common', 14, 3, true, '캐리비안의 해적 컬렉션', true),
  ('pirate_loveseat', '해적 가죽 러브시트', '골드 장식이 달린 가죽 러브시트', 'furniture', 'shop', 'common', 20, 4, true, '캐리비안의 해적 컬렉션', true),
  ('pirate_compass_rug', '나침반 러그', '나침반 무늬가 그려진 러그', 'furniture', 'shop', 'common', 10, 2, true, '캐리비안의 해적 컬렉션', true),
  ('pirate_book_lantern_shelf', '해적 책 랜턴 선반', '책과 랜턴을 올린 원목 선반', 'furniture', 'shop', 'common', 14, 3, true, '캐리비안의 해적 컬렉션', true),
  ('pirate_map_frame', '보물지도 액자', '낡은 보물지도가 담긴 액자', 'furniture', 'shop', 'common', 8, 2, true, '캐리비안의 해적 컬렉션', true),
  ('pirate_wall_lantern', '해적 벽걸이 랜턴', '브래킷에 매달린 골동 랜턴', 'furniture', 'shop', 'common', 8, 2, true, '캐리비안의 해적 컬렉션', true),
  ('pirate_floor_lamp', '해적 플로어램프', '타륜 문양 갓이 달린 플로어램프', 'furniture', 'shop', 'common', 9, 2, true, '캐리비안의 해적 컬렉션', true),
  ('pirate_potted_plant', '해적선 화분', '조타륜 화분에 심긴 식물', 'furniture', 'shop', 'common', 5, 1, true, '캐리비안의 해적 컬렉션', true),
  ('pirate_trunk_table', '트렁크 테이블', '테이블로 쓰는 낮은 트렁크', 'furniture', 'shop', 'common', 16, 3, true, '캐리비안의 해적 컬렉션', true),
  ('pirate_gold_hoard_deco', '황금 보물 더미', '금화와 보석이 가득한 열린 보물상자', 'furniture', 'shop', 'rare', 18, 4, true, '캐리비안의 해적 컬렉션', true),
  ('pirate_money_stack_deco', '금화 더미', '금화와 지폐 뭉치', 'furniture', 'shop', 'common', 10, 2, true, '캐리비안의 해적 컬렉션', true),
  ('pirate_compass_deco', '나침반 장식', '골동 나침반 장식품', 'furniture', 'shop', 'common', 6, 1, true, '캐리비안의 해적 컬렉션', true),
  ('pirate_ship_bottle_deco', '병 속의 범선', '유리병 안에 담긴 범선 모형', 'furniture', 'shop', 'common', 9, 2, true, '캐리비안의 해적 컬렉션', true)
on conflict (sku) do nothing;

insert into public.store_products (store_id, catalog_item_id, sort_order, active)
select
  (select id from public.stores where slug = 'furniture'),
  ic.id,
  1100 + row_number() over (order by ic.sku),
  true
from public.item_catalog ic
where ic.sku in ('pirate_bed', 'pirate_desk', 'pirate_office_chair', 'pirate_treasure_chest', 'pirate_loveseat', 'pirate_compass_rug', 'pirate_book_lantern_shelf', 'pirate_map_frame', 'pirate_wall_lantern', 'pirate_floor_lamp', 'pirate_potted_plant', 'pirate_trunk_table', 'pirate_gold_hoard_deco', 'pirate_money_stack_deco', 'pirate_compass_deco', 'pirate_ship_bottle_deco')
  and exists (select 1 from public.stores where slug = 'furniture')
  and not exists (
    select 1 from public.store_products sp
    where sp.store_id = (select id from public.stores where slug = 'furniture')
      and sp.catalog_item_id = ic.id
  );
