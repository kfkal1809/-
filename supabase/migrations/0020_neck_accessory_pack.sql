-- 목 소품 3종(반다나 2색 + 보타이) + 우산/인형/선글라스 — "손소품 렌더 슬롯 신설" 때부터
-- "옷 변형 후속"까지 슬롯이 없다는 이유로 미뤄뒀던 마지막 소품들.
-- 목 소품은 새 neckAssetKey 슬롯(characterFullBody.ts의 NECK_SIZE/NECK_PLACEMENT/
-- NECK_ACCESSORY_ANCHOR, CharacterSprite.tsx에 렌더 레이어 추가)으로 연결했고, 우산/인형은
-- 기존 handAssetKey 슬롯을, 선글라스는 기존 hatAssetKey 슬롯(고글류와 같은 방식, 눈높이로
-- bottomFrac만 다르게)을 그대로 재사용했다 — 새 슬롯은 목 소품에만 실제로 필요했다.
-- 0016/0018과 같은 패턴: item_catalog에 논리적 상품만 추가, 실제 렌더링은
-- lib/domain/itemAppearance.ts로 연결.
insert into public.item_catalog (sku, name, description, category, subcategory, rarity, buy_price, sell_price, placeable, source_label, active) values
  ('haenam_deck_acc_bandana_blue', '블루 스트라이프 반다나', '닻 배지가 달린 블루 스트라이프 반다나', 'accessory', 'haenam_deck', 'common', 5, 1, false, '옷가게', true),
  ('haenyeo_acc_bandana_red', '레드 스트라이프 반다나', '닻 배지가 달린 레드 스트라이프 반다나', 'accessory', 'haenyeo', 'common', 5, 1, false, '옷가게', true),
  ('haenam_engine_acc_bow_tie', '네이비 보타이', '닻 배지가 달린 네이비 보타이', 'accessory', 'haenam_engine', 'common', 5, 1, false, '옷가게', true),
  ('child_acc_umbrella', '옐로우 데이지 우산', '데이지 장식이 달린 옐로우 우산', 'accessory', 'child', 'common', 7, 2, false, '옷가게', true),
  ('child_acc_doll', '토끼 인형', '리본을 맨 하얀 토끼 인형', 'accessory', 'child', 'rare', 9, 3, false, '옷가게', true),
  ('child_acc_sunglasses', '브라운 선글라스', '동그란 브라운 선글라스', 'accessory', 'child', 'common', 6, 1, false, '옷가게', true)
on conflict (sku) do nothing;

insert into public.store_products (store_id, catalog_item_id, sort_order, active)
select
  (select id from public.stores where slug = 'clothing'),
  ic.id,
  2200 + row_number() over (order by ic.sku),
  true
from public.item_catalog ic
where ic.sku in ('haenam_deck_acc_bandana_blue', 'haenyeo_acc_bandana_red', 'haenam_engine_acc_bow_tie', 'child_acc_umbrella', 'child_acc_doll', 'child_acc_sunglasses')
  and exists (select 1 from public.stores where slug = 'clothing')
  and not exists (
    select 1 from public.store_products sp
    where sp.store_id = (select id from public.stores where slug = 'clothing')
      and sp.catalog_item_id = ic.id
  );
