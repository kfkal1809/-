-- 빈티지 가구 시리즈(22종, design-assets/빈티지 가구 시리즈.png에서 크롭) — 가구상점에 추가.
-- 기존 interior_pack(0006)/furniture_store(0008)와 같은 패턴: item_catalog에 category='furniture',
-- subcategory='shop'으로 추가하면 store_products insert 쿼리가 그대로 furniture 상점에 연결한다.
-- furnitureKind는 lib/domain/cabinPlacement.ts classify()가 sku 이름 패턴으로 자동 분류한다
-- (bed/seat/table/storage/wallDeco/appliance/rug/smallDeco — 새 규칙 추가 없이 전부 올바르게 분류됨,
-- 확인: npx tsx로 getPlacementDef() 22개 전부 출력해서 검산).
insert into public.item_catalog (sku, name, description, category, subcategory, rarity, buy_price, sell_price, placeable, source_label, active) values
  ('vintage_shell_bed', '조개 침대', '조개껍질 헤드보드가 달린 빈티지 침대', 'furniture', 'shop', 'rare', 30, 7, true, '빈티지 가구 컬렉션', true),
  ('vintage_shell_deco', '조개 장식', '조개 모양 장식 소품', 'furniture', 'shop', 'common', 6, 1, true, '빈티지 가구 컬렉션', true),
  ('vintage_stripe_loveseat', '스트라이프 러브시트', '핑크 스트라이프 2인 러브시트', 'furniture', 'shop', 'common', 20, 5, true, '빈티지 가구 컬렉션', true),
  ('vintage_stripe_armchair', '스트라이프 안락의자', '핑크 스트라이프 1인 안락의자', 'furniture', 'shop', 'common', 16, 4, true, '빈티지 가구 컬렉션', true),
  ('vintage_wood_chair', '우드 체어', '하늘색 방석이 놓인 원목 의자', 'furniture', 'shop', 'common', 10, 2, true, '빈티지 가구 컬렉션', true),
  ('vintage_plant_side_table', '화분 사이드테이블', '화분이 놓인 원목 사이드테이블', 'furniture', 'shop', 'common', 10, 2, true, '빈티지 가구 컬렉션', true),
  ('vintage_shell_floor_lamp', '조개 플로어램프', '조개 갓이 달린 골드 플로어램프', 'furniture', 'shop', 'common', 9, 2, true, '빈티지 가구 컬렉션', true),
  ('vintage_anchor_desk', '앵커 책상', '닻 장식과 서랍이 달린 블루 책상', 'furniture', 'shop', 'common', 18, 4, true, '빈티지 가구 컬렉션', true),
  ('vintage_nightstand_plain', '심플 협탁', '블루&아이보리 투톤 협탁', 'furniture', 'shop', 'common', 8, 2, true, '빈티지 가구 컬렉션', true),
  ('vintage_nightstand_drawer', '서랍 협탁', '서랍 4개짜리 블루&아이보리 협탁', 'furniture', 'shop', 'common', 10, 2, true, '빈티지 가구 컬렉션', true),
  ('vintage_book_boat_shelf', '범선 선반', '책과 범선 모형을 올린 원목 선반', 'furniture', 'shop', 'common', 16, 4, true, '빈티지 가구 컬렉션', true),
  ('vintage_potted_plant', '화분', '싱그러운 초록 화분', 'furniture', 'shop', 'common', 5, 1, true, '빈티지 가구 컬렉션', true),
  ('vintage_oval_mirror', '오벌 로프 거울', '로프 프레임 타원 거울', 'furniture', 'shop', 'common', 8, 2, true, '빈티지 가구 컬렉션', true),
  ('vintage_round_mirror', '라운드 로프 거울', '로프 프레임 원형 거울', 'furniture', 'shop', 'common', 7, 1, true, '빈티지 가구 컬렉션', true),
  ('vintage_curtains_blue', '블루 커튼', '블루 톤 리본 커튼', 'furniture', 'shop', 'common', 9, 2, true, '빈티지 가구 컬렉션', true),
  ('vintage_lighthouse_frame', '등대 액자', '등대 그림이 담긴 원목 액자', 'furniture', 'shop', 'common', 7, 1, true, '빈티지 가구 컬렉션', true),
  ('vintage_wood_door', '원목 도어', '빈티지 원목 도어 장식', 'furniture', 'shop', 'common', 6, 1, true, '빈티지 가구 컬렉션', true),
  ('vintage_treasure_chest', '트레저 체스트', '블루&골드 트레저 체스트', 'furniture', 'shop', 'common', 12, 3, true, '빈티지 가구 컬렉션', true),
  ('vintage_anchor_fridge', '앵커 냉장고', '앵커 자석이 붙은 미니 냉장고', 'furniture', 'shop', 'common', 14, 3, true, '빈티지 가구 컬렉션', true),
  ('vintage_travel_luggage', '화분 캐리어', '화분을 올린 빈티지 캐리어', 'furniture', 'shop', 'common', 8, 2, true, '빈티지 가구 컬렉션', true),
  ('vintage_wheel_rug', '조타륜 러그', '조타륜 무늬 원형 러그', 'furniture', 'shop', 'common', 10, 2, true, '빈티지 가구 컬렉션', true),
  ('vintage_office_chair', '빈티지 오피스 체어', '쿠션이 놓인 원목 오피스 체어', 'furniture', 'shop', 'common', 14, 3, true, '빈티지 가구 컬렉션', true)
on conflict (sku) do nothing;

insert into public.store_products (store_id, catalog_item_id, sort_order, active)
select
  (select id from public.stores where slug = 'furniture'),
  ic.id,
  1000 + row_number() over (order by ic.sku),
  true
from public.item_catalog ic
where ic.sku in ('vintage_shell_bed', 'vintage_shell_deco', 'vintage_stripe_loveseat', 'vintage_stripe_armchair', 'vintage_wood_chair', 'vintage_plant_side_table', 'vintage_shell_floor_lamp', 'vintage_anchor_desk', 'vintage_nightstand_plain', 'vintage_nightstand_drawer', 'vintage_book_boat_shelf', 'vintage_potted_plant', 'vintage_oval_mirror', 'vintage_round_mirror', 'vintage_curtains_blue', 'vintage_lighthouse_frame', 'vintage_wood_door', 'vintage_treasure_chest', 'vintage_anchor_fridge', 'vintage_travel_luggage', 'vintage_wheel_rug', 'vintage_office_chair')
  and exists (select 1 from public.stores where slug = 'furniture')
  and not exists (
    select 1 from public.store_products sp
    where sp.store_id = (select id from public.stores where slug = 'furniture')
      and sp.catalog_item_id = ic.id
  );

