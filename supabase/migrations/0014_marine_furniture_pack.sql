-- 마린시리즈(30종, design-assets/마린시리즈 (1~3).png에서 크롭) — 가구상점에 추가.
-- 0011_vintage_furniture_pack과 같은 패턴. marine_anchor_clock_deco/marine_ship_wheel_deco/
-- marine_wall_lamp/marine_mailbox는 SKU_OVERRIDES로 배치를 보정한다(cabinPlacement.test.ts 회귀 테스트로 고정).
insert into public.item_catalog (sku, name, description, category, subcategory, rarity, buy_price, sell_price, placeable, source_label, active) values
  ('marine_bed', '고래꼬리 침대', '고래꼬리 헤드보드가 달린 침대', 'furniture', 'shop', 'rare', 30, 7, true, '마린 컬렉션', true),
  ('marine_desk', '고래 책상', '고래 스탠드가 놓인 책상', 'furniture', 'shop', 'common', 18, 4, true, '마린 컬렉션', true),
  ('marine_chair', '고래꼬리 의자', '고래꼬리 등받이 의자', 'furniture', 'shop', 'common', 12, 2, true, '마린 컬렉션', true),
  ('marine_loveseat', '조개 러브시트', '조개 등받이 러브시트', 'furniture', 'shop', 'common', 18, 4, true, '마린 컬렉션', true),
  ('marine_sideboard', '고래 사이드보드', '포트홀 손잡이가 달린 사이드보드', 'furniture', 'shop', 'common', 14, 3, true, '마린 컬렉션', true),
  ('marine_coffee_table', '고래꼬리 커피테이블', '책이 놓인 원형 커피테이블', 'furniture', 'shop', 'common', 12, 2, true, '마린 컬렉션', true),
  ('marine_shelf', '고래꼬리 선반', '화분과 조개를 올린 선반', 'furniture', 'shop', 'common', 12, 2, true, '마린 컬렉션', true),
  ('marine_porthole_mirror', '선실 창 거울', '포트홀 모양 거울', 'furniture', 'shop', 'common', 8, 2, true, '마린 컬렉션', true),
  ('marine_wall_lamp', '고래 벽등', '고래꼬리 장식 벽걸이 조명', 'furniture', 'shop', 'common', 7, 2, true, '마린 컬렉션', true),
  ('marine_floor_lamp', '고래꼬리 플로어램프', '별 장식이 달린 플로어램프', 'furniture', 'shop', 'common', 9, 2, true, '마린 컬렉션', true),
  ('marine_fridge', '고래 냉장고', '파도 무늬 미니 냉장고', 'furniture', 'shop', 'common', 14, 3, true, '마린 컬렉션', true),
  ('marine_mailbox', '고래 우편함', '고래꼬리가 달린 우편함', 'furniture', 'shop', 'common', 8, 2, true, '마린 컬렉션', true),
  ('marine_round_rug', '파도 러그', '파도 그러데이션 원형 러그', 'furniture', 'shop', 'common', 9, 2, true, '마린 컬렉션', true),
  ('marine_shell_pillow_deco', '조개 쿠션', '조개 모양 쿠션', 'furniture', 'shop', 'common', 5, 1, true, '마린 컬렉션', true),
  ('marine_wave_pillow_deco', '파도 쿠션', '파도 무늬 쿠션', 'furniture', 'shop', 'common', 5, 1, true, '마린 컬렉션', true),
  ('marine_whale_pillow_deco', '고래 쿠션', '고래 프린트 쿠션', 'furniture', 'shop', 'common', 5, 1, true, '마린 컬렉션', true),
  ('marine_ship_wheel_deco', '선박 타륜 장식', '벽에 거는 타륜 장식', 'furniture', 'shop', 'common', 7, 2, true, '마린 컬렉션', true),
  ('marine_potted_plant', '고래 화분', '고래 모양 화분에 심긴 식물', 'furniture', 'shop', 'common', 5, 1, true, '마린 컬렉션', true),
  ('marine_mug_deco', '고래 머그컵', '고래 모양 손잡이 머그컵', 'furniture', 'shop', 'common', 4, 1, true, '마린 컬렉션', true),
  ('marine_life_ring_deco', '구명튜브 장식', '고래꼬리가 달린 구명튜브', 'furniture', 'shop', 'common', 6, 1, true, '마린 컬렉션', true),
  ('marine_ship_bottle_deco', '병 속의 범선', '유리병 안에 담긴 범선 모형', 'furniture', 'shop', 'common', 9, 2, true, '마린 컬렉션', true),
  ('marine_anchor_clock_deco', '닻 모양 탁상시계', '닻 모양 프레임의 탁상시계', 'furniture', 'shop', 'common', 8, 2, true, '마린 컬렉션', true),
  ('marine_compass_deco', '나침반 장식', '골드 나침반 장식품', 'furniture', 'shop', 'common', 6, 1, true, '마린 컬렉션', true),
  ('marine_lantern_deco', '선박 랜턴', '들고 다니는 선박용 랜턴', 'furniture', 'shop', 'common', 7, 2, true, '마린 컬렉션', true),
  ('marine_whale_books_deco', '고래와 책 더미', '책 더미 위에 앉은 아기 고래', 'furniture', 'shop', 'common', 6, 1, true, '마린 컬렉션', true),
  ('marine_starfish_deco', '불가사리 장식', '주황빛 불가사리 장식품', 'furniture', 'shop', 'common', 3, 1, true, '마린 컬렉션', true),
  ('marine_shell_spiral_deco', '소라 장식', '나선형 소라 껍데기 장식', 'furniture', 'shop', 'common', 3, 1, true, '마린 컬렉션', true),
  ('marine_shell_teal_deco', '가리비 장식', '민트빛 가리비 껍데기 장식', 'furniture', 'shop', 'common', 3, 1, true, '마린 컬렉션', true),
  ('marine_coral_deco', '산호 장식', '주황빛 산호 장식품', 'furniture', 'shop', 'common', 4, 1, true, '마린 컬렉션', true),
  ('marine_jar_shell_deco', '조개 유리병 장식', '조개와 불가사리가 담긴 유리병', 'furniture', 'shop', 'common', 5, 1, true, '마린 컬렉션', true)
on conflict (sku) do nothing;

insert into public.store_products (store_id, catalog_item_id, sort_order, active)
select
  (select id from public.stores where slug = 'furniture'),
  ic.id,
  1300 + row_number() over (order by ic.sku),
  true
from public.item_catalog ic
where ic.sku in ('marine_bed', 'marine_desk', 'marine_chair', 'marine_loveseat', 'marine_sideboard', 'marine_coffee_table', 'marine_shelf', 'marine_porthole_mirror', 'marine_wall_lamp', 'marine_floor_lamp', 'marine_fridge', 'marine_mailbox', 'marine_round_rug', 'marine_shell_pillow_deco', 'marine_wave_pillow_deco', 'marine_whale_pillow_deco', 'marine_ship_wheel_deco', 'marine_potted_plant', 'marine_mug_deco', 'marine_life_ring_deco', 'marine_ship_bottle_deco', 'marine_anchor_clock_deco', 'marine_compass_deco', 'marine_lantern_deco', 'marine_whale_books_deco', 'marine_starfish_deco', 'marine_shell_spiral_deco', 'marine_shell_teal_deco', 'marine_coral_deco', 'marine_jar_shell_deco')
  and exists (select 1 from public.stores where slug = 'furniture')
  and not exists (
    select 1 from public.store_products sp
    where sp.store_id = (select id from public.stores where slug = 'furniture')
      and sp.catalog_item_id = ic.id
  );
