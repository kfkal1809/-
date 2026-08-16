-- 가구상점(FurnitureStore) — 기존 item_catalog/inventory_items/wallet/apply_wallet_transaction/
-- store_products 구조를 그대로 재사용하고, 새 구매 시스템은 만들지 않는다.
-- interior_pack(0006) 소품은 온보딩 때 무료 지급되는 것과 별개로, 그중 다양한 카테고리를
-- 대표하는 일부에 실제 판매가를 부여해 "더 사서 여러 개 배치"할 수 있게 한다
-- (furniture_stand_light처럼 이미 subcategory='shop'으로 판매되던 것과 같은 패턴).

-- =========================================================
-- 1. stores row
-- =========================================================
insert into public.stores (id, slug, name, promo_text, status)
select gen_random_uuid(), 'furniture', '가구상점', '선실을 꾸며줄 다양한 가구를 만나보세요', 'active'
where not exists (select 1 from public.stores where slug = 'furniture');

-- =========================================================
-- 2. 판매가 부여 (카테고리별로 고르게 — 침대/테이블/의자/수납/러그/조명/벽장식/소품)
-- =========================================================
update public.item_catalog set buy_price = 32, subcategory = 'shop' where sku = 'interior_bunk_bed';
update public.item_catalog set buy_price = 26, subcategory = 'shop' where sku = 'interior_baby_crib';
update public.item_catalog set buy_price = 24, subcategory = 'shop' where sku = 'interior_kids_bed';

update public.item_catalog set buy_price = 18, subcategory = 'shop' where sku = 'interior_study_desk';
update public.item_catalog set buy_price = 18, subcategory = 'shop' where sku = 'interior_writing_desk';
update public.item_catalog set buy_price = 16, subcategory = 'shop' where sku = 'interior_round_dining_table';
update public.item_catalog set buy_price = 12, subcategory = 'shop' where sku = 'interior_round_tea_table';
update public.item_catalog set buy_price = 14, subcategory = 'shop' where sku = 'interior_vanity_table';

update public.item_catalog set buy_price = 16, subcategory = 'shop' where sku = 'interior_rattan_chair';
update public.item_catalog set buy_price = 18, subcategory = 'shop' where sku = 'interior_striped_armchair';
update public.item_catalog set buy_price = 22, subcategory = 'shop' where sku = 'interior_loveseat_sofa';
update public.item_catalog set buy_price = 20, subcategory = 'shop' where sku = 'interior_rocking_chair_wheel';

update public.item_catalog set buy_price = 28, subcategory = 'shop' where sku = 'interior_bookshelf';
update public.item_catalog set buy_price = 34, subcategory = 'shop' where sku = 'interior_wardrobe';
update public.item_catalog set buy_price = 30, subcategory = 'shop' where sku = 'interior_display_cabinet';

update public.item_catalog set buy_price = 10, subcategory = 'shop' where sku = 'interior_oval_rug';

update public.item_catalog set buy_price = 9, subcategory = 'shop' where sku = 'interior_floor_lamp';
update public.item_catalog set buy_price = 8, subcategory = 'shop' where sku = 'interior_nightstand_lamp2';

update public.item_catalog set buy_price = 8, subcategory = 'shop' where sku = 'interior_flower_mirror';
update public.item_catalog set buy_price = 7, subcategory = 'shop' where sku = 'interior_wheel_clock';
update public.item_catalog set buy_price = 6, subcategory = 'shop' where sku = 'interior_wall_shelf_bell';

update public.item_catalog set buy_price = 5, subcategory = 'shop' where sku = 'interior_whale_plush';
update public.item_catalog set buy_price = 4, subcategory = 'shop' where sku = 'interior_hanging_planter';
update public.item_catalog set buy_price = 5, subcategory = 'shop' where sku = 'interior_seagull_mobile';

-- 신상 배지 — "최근 생성된 row" 같은 타임스탬프 추정 대신, 이번에 새로 판매를 시작하는
-- 4종을 metadata_json.new=true로 명시적으로 표시한다(매대 큐레이션 개념, 조작 데이터 아님).
update public.item_catalog set metadata_json = coalesce(metadata_json, '{}'::jsonb) || '{"new": true}'::jsonb
  where sku in ('interior_baby_crib', 'interior_vanity_table', 'interior_flower_mirror', 'interior_nightstand_lamp2');

-- =========================================================
-- 3. store_products 연결 (위에서 subcategory='shop'으로 바꾼 것 + 기존 furniture_stand_light)
-- =========================================================
insert into public.store_products (store_id, catalog_item_id, sort_order, active)
select
  (select id from public.stores where slug = 'furniture'),
  ic.id,
  row_number() over (order by ic.buy_price desc),
  true
from public.item_catalog ic
where ic.category = 'furniture'
  and ic.subcategory = 'shop'
  and not exists (
    select 1 from public.store_products sp
    where sp.store_id = (select id from public.stores where slug = 'furniture')
      and sp.catalog_item_id = ic.id
  );
