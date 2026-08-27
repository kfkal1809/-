-- 방선에서 생긴일(코티지) 시리즈(23종, design-assets/방선에서 생긴일 시리즈 (1~3).png에서 크롭)
-- — 가구상점에 추가. 0011_vintage_furniture_pack과 같은 패턴. cottage_wall_sconce/cottage_mailbox는
-- SKU_OVERRIDES로 배치를 보정한다(cabinPlacement.test.ts 회귀 테스트로 고정).
insert into public.item_catalog (sku, name, description, category, subcategory, rarity, buy_price, sell_price, placeable, source_label, active) values
  ('cottage_bed', '코티지 침대', '스트라이프 침구가 놓인 원목 침대', 'furniture', 'shop', 'rare', 30, 7, true, '코티지 컬렉션', true),
  ('cottage_desk', '코티지 책상', '독서등이 놓인 원목 책상', 'furniture', 'shop', 'common', 18, 4, true, '코티지 컬렉션', true),
  ('cottage_chair', '코티지 체어', '타륜 쿠션이 놓인 원목 체어', 'furniture', 'shop', 'common', 12, 2, true, '코티지 컬렉션', true),
  ('cottage_sideboard', '코티지 사이드보드', '셔터 도어가 달린 사이드보드', 'furniture', 'shop', 'common', 14, 3, true, '코티지 컬렉션', true),
  ('cottage_loveseat', '코티지 러브시트', '구명튜브 쿠션이 놓인 러브시트', 'furniture', 'shop', 'common', 18, 4, true, '코티지 컬렉션', true),
  ('cottage_coffee_table', '코티지 커피테이블', '꽃병이 놓인 스트라이프 커피테이블', 'furniture', 'shop', 'common', 12, 2, true, '코티지 컬렉션', true),
  ('cottage_nightstand', '코티지 협탁', '랜턴과 액자가 놓인 협탁', 'furniture', 'shop', 'common', 10, 2, true, '코티지 컬렉션', true),
  ('cottage_side_table', '코티지 사이드테이블', '스트라이프 상판 사이드테이블', 'furniture', 'shop', 'common', 10, 2, true, '코티지 컬렉션', true),
  ('cottage_book_boat_shelf', '범선 책 선반', '범선 모형과 책을 올린 선반', 'furniture', 'shop', 'common', 13, 3, true, '코티지 컬렉션', true),
  ('cottage_wall_sconce', '코티지 벽등', '골드 브래킷 벽걸이 조명', 'furniture', 'shop', 'common', 7, 2, true, '코티지 컬렉션', true),
  ('cottage_floor_lamp', '코티지 플로어램프', '스트라이프 갓이 달린 플로어램프', 'furniture', 'shop', 'common', 9, 2, true, '코티지 컬렉션', true),
  ('cottage_round_rug', '타륜 러그', '타륜 무늬가 그려진 러그', 'furniture', 'shop', 'common', 9, 2, true, '코티지 컬렉션', true),
  ('cottage_porthole_window', '선실 창', '바다 풍경이 담긴 둥근 창', 'furniture', 'shop', 'common', 8, 2, true, '코티지 컬렉션', true),
  ('cottage_lighthouse_frame', '등대 액자', '등대 그림이 담긴 액자', 'furniture', 'shop', 'common', 7, 2, true, '코티지 컬렉션', true),
  ('cottage_shell_frame_deco', '조개 액자', '조개와 불가사리가 담긴 액자', 'furniture', 'shop', 'common', 6, 1, true, '코티지 컬렉션', true),
  ('cottage_lemon_frame_deco', '레몬 액자', '레몬 그림이 담긴 액자', 'furniture', 'shop', 'common', 6, 1, true, '코티지 컬렉션', true),
  ('cottage_potted_plant', '앵커 화분', '앵커 무늬 화분에 심긴 식물', 'furniture', 'shop', 'common', 5, 1, true, '코티지 컬렉션', true),
  ('cottage_mailbox', '코티지 우편함', '타륜 문양 우편함', 'furniture', 'shop', 'common', 8, 2, true, '코티지 컬렉션', true),
  ('cottage_mug_deco', '타륜 머그컵', '타륜 무늬 머그컵', 'furniture', 'shop', 'common', 4, 1, true, '코티지 컬렉션', true),
  ('cottage_pillow_deco', '타륜 쿠션', '타륜 무늬 스트라이프 쿠션', 'furniture', 'shop', 'common', 5, 1, true, '코티지 컬렉션', true),
  ('cottage_folded_blanket_deco', '개어놓은 담요', '스트라이프 담요 더미', 'furniture', 'shop', 'common', 5, 1, true, '코티지 컬렉션', true),
  ('cottage_basket_deco', '피크닉 바구니', '소품이 담긴 라탄 바구니', 'furniture', 'shop', 'common', 6, 1, true, '코티지 컬렉션', true),
  ('cottage_sailboat_deco', '범선 모형', '스트라이프 돛이 달린 범선 모형', 'furniture', 'shop', 'common', 7, 2, true, '코티지 컬렉션', true)
on conflict (sku) do nothing;

insert into public.store_products (store_id, catalog_item_id, sort_order, active)
select
  (select id from public.stores where slug = 'furniture'),
  ic.id,
  1400 + row_number() over (order by ic.sku),
  true
from public.item_catalog ic
where ic.sku in ('cottage_bed', 'cottage_desk', 'cottage_chair', 'cottage_sideboard', 'cottage_loveseat', 'cottage_coffee_table', 'cottage_nightstand', 'cottage_side_table', 'cottage_book_boat_shelf', 'cottage_wall_sconce', 'cottage_floor_lamp', 'cottage_round_rug', 'cottage_porthole_window', 'cottage_lighthouse_frame', 'cottage_shell_frame_deco', 'cottage_lemon_frame_deco', 'cottage_potted_plant', 'cottage_mailbox', 'cottage_mug_deco', 'cottage_pillow_deco', 'cottage_folded_blanket_deco', 'cottage_basket_deco', 'cottage_sailboat_deco')
  and exists (select 1 from public.stores where slug = 'furniture')
  and not exists (
    select 1 from public.store_products sp
    where sp.store_id = (select id from public.stores where slug = 'furniture')
      and sp.catalog_item_id = ic.id
  );
