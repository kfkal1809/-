-- 손소품(design-assets/모자 소품.png, "손소품 렌더 슬롯 신설" 때 hand_tool_pouch 1종만
-- 크롭했던 시트)에서 나머지 손에 드는 손소품 10종을 마저 크롭해 옷가게에 추가.
-- 0016_hat_accessory_pack과 같은 패턴: item_catalog에 category='accessory', subcategory를
-- haenyeo/haenam_deck/haenam_engine 중 하나로 넣으면 store_products insert 쿼리가 그대로
-- 옷가게에 연결한다. 실사 렌더링은 lib/domain/itemAppearance.ts의 handAssetKey로 연결되고,
-- HAND_SIZE/HAND_PLACEMENT(lib/domain/characterFullBody.ts)에 배치값이 이미 등록돼 있다.
-- 목에 거는 반다나/보타이 3종은 별도 anchor가 필요해 이번 범위에 넣지 않았다.
insert into public.item_catalog (sku, name, description, category, subcategory, rarity, buy_price, sell_price, placeable, source_label, active) values
  ('haenam_deck_acc_binoculars', '쌍안경', '먼바다를 살피는 쌍안경', 'accessory', 'haenam_deck', 'common', 8, 2, false, '옷가게', true),
  ('haenam_deck_acc_life_ring', '구명튜브 가방', '구명튜브 모양 크로스백', 'accessory', 'haenam_deck', 'common', 7, 2, false, '옷가게', true),
  ('haenam_deck_acc_canteen', '항해용 수통', '로프 손잡이가 달린 수통', 'accessory', 'haenam_deck', 'common', 6, 1, false, '옷가게', true),
  ('haenam_deck_acc_scroll', '항해 지도', '가죽끈으로 묶은 항해 지도', 'accessory', 'haenam_deck', 'rare', 9, 3, false, '옷가게', true),
  ('haenam_deck_acc_compass', '골드 나침반', '조개·불가사리 참이 달린 나침반', 'accessory', 'haenam_deck', 'rare', 10, 3, false, '옷가게', true),
  ('haenam_engine_acc_walkie', '무전기', '선내 연락용 무전기', 'accessory', 'haenam_engine', 'common', 7, 2, false, '옷가게', true),
  ('haenam_engine_acc_lantern', '선원 랜턴', '야간 점검용 랜턴', 'accessory', 'haenam_engine', 'common', 6, 1, false, '옷가게', true),
  ('haenyeo_acc_shell_purse', '진주조개 파우치', '진주로 장식한 조개 모양 파우치', 'accessory', 'haenyeo', 'rare', 9, 3, false, '옷가게', true),
  ('haenyeo_acc_rope_bracelet', '로프 참 팔찌', '조개·불가사리 참이 달린 팔찌', 'accessory', 'haenyeo', 'common', 5, 1, false, '옷가게', true),
  ('haenyeo_acc_satchel', '앵커 새첼백', '앵커 자수가 들어간 새첼백', 'accessory', 'haenyeo', 'common', 8, 2, false, '옷가게', true)
on conflict (sku) do nothing;

insert into public.store_products (store_id, catalog_item_id, sort_order, active)
select
  (select id from public.stores where slug = 'clothing'),
  ic.id,
  2100 + row_number() over (order by ic.sku),
  true
from public.item_catalog ic
where ic.sku in ('haenam_deck_acc_binoculars', 'haenam_deck_acc_life_ring', 'haenam_deck_acc_canteen', 'haenam_deck_acc_scroll', 'haenam_deck_acc_compass', 'haenam_engine_acc_walkie', 'haenam_engine_acc_lantern', 'haenyeo_acc_shell_purse', 'haenyeo_acc_rope_bracelet', 'haenyeo_acc_satchel')
  and exists (select 1 from public.stores where slug = 'clothing')
  and not exists (
    select 1 from public.store_products sp
    where sp.store_id = (select id from public.stores where slug = 'clothing')
      and sp.catalog_item_id = ic.id
  );
