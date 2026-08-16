-- 옷가게(ClothingStore) — 기존 item_catalog(hair/outfit/hat/accessory, 이미 가격이 매겨져
-- 있음)/inventory_items/character_equipment/wallet/apply_wallet_transaction/store_products
-- 구조를 그대로 재사용한다. 새 구매 시스템이나 새 옷 에셋을 만들지 않는다.
-- 헤어는 참고 디자인의 카테고리 탭(상의/하의/원피스/모자/신발/악세사리)에 대응하는 게 없어서
-- 이번 옷가게 판매 목록에는 포함하지 않는다(기존 CustomizeScreen에서 착용은 계속 가능).

insert into public.stores (id, slug, name, promo_text, status)
select gen_random_uuid(), 'clothing', '옷가게', '바다 내음 가득한 옷과 소품을 만나보세요', 'active'
where not exists (select 1 from public.stores where slug = 'clothing');

-- 신상 배지 — 매대 큐레이션 표시(2종만, 조작 데이터 아님).
update public.item_catalog set metadata_json = coalesce(metadata_json, '{}'::jsonb) || '{"new": true}'::jsonb
  where sku in ('haenam_deck_outfit_casual', 'haenam_engine_hat_helmet');

insert into public.store_products (store_id, catalog_item_id, sort_order, active)
select
  (select id from public.stores where slug = 'clothing'),
  ic.id,
  row_number() over (order by ic.subcategory, ic.category, ic.buy_price desc),
  true
from public.item_catalog ic
where ic.category in ('outfit', 'hat', 'accessory')
  and ic.subcategory in ('haenyeo', 'haenam_deck', 'haenam_engine', 'child')
  and not exists (
    select 1 from public.store_products sp
    where sp.store_id = (select id from public.stores where slug = 'clothing')
      and sp.catalog_item_id = ic.id
  );
