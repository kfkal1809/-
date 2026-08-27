-- 모자 소품(design-assets/모자 소품.png)에서 크롭한 헤드기어 21종 — 옷가게에 추가.
-- 0009_clothing_store와 같은 패턴: item_catalog에 category='hat', subcategory를
-- haenyeo/haenam_deck/haenam_engine 중 하나로 넣으면 store_products insert 쿼리가 그대로
-- 옷가게에 연결한다. 실사 렌더링은 lib/domain/itemAppearance.ts의 hatAssetKey로 연결되고,
-- HAT_SIZE/HAT_PLACEMENT(lib/domain/characterFullBody.ts)에 배치값이 이미 등록돼 있다.
insert into public.item_catalog (sku, name, description, category, subcategory, rarity, buy_price, sell_price, placeable, source_label, active) values
  ('haenam_deck_hat_sailor_cap', '세일러 모자', '심플한 세일러 모자', 'hat', 'haenam_deck', 'common', 8, 2, false, '옷가게', true),
  ('haenam_deck_hat_bucket', '앵커 버킷햇', '앵커 자수가 들어간 버킷햇', 'hat', 'haenam_deck', 'common', 7, 2, false, '옷가게', true),
  ('haenam_engine_hat_aviator_white', '화이트 항공 헬멧', '고글이 달린 화이트 항공 헬멧', 'hat', 'haenam_engine', 'common', 9, 2, false, '옷가게', true),
  ('haenam_engine_hat_aviator_blue', '블루 항공 헬멧', '고글이 달린 블루 항공 헬멧', 'hat', 'haenam_engine', 'common', 9, 2, false, '옷가게', true),
  ('haenam_engine_hat_goggles_brown', '브라운 고글', '가죽끈 브라운 고글', 'hat', 'haenam_engine', 'common', 6, 1, false, '옷가게', true),
  ('haenam_engine_hat_goggles_red', '레드 고글', '조개 참이 달린 레드 고글', 'hat', 'haenam_engine', 'common', 6, 1, false, '옷가게', true),
  ('haenam_engine_hat_wrench_gray', '그레이 스패너 머리띠', '스패너 두 개가 교차한 머리띠', 'hat', 'haenam_engine', 'common', 6, 1, false, '옷가게', true),
  ('haenam_engine_hat_wrench_red', '레드 스패너 머리띠', '앵커 배지가 달린 스패너 머리띠', 'hat', 'haenam_engine', 'common', 6, 1, false, '옷가게', true),
  ('haenam_engine_hat_wrench_star', '스타 스패너 머리띠', '별 배지가 달린 스패너 머리띠', 'hat', 'haenam_engine', 'common', 6, 1, false, '옷가게', true),
  ('haenyeo_hat_sailor_bow', '리본 세일러 모자', '리본이 달린 세일러 모자', 'hat', 'haenyeo', 'common', 8, 2, false, '옷가게', true),
  ('haenyeo_hat_straw', '리본 밀짚모자', '스트라이프 리본 밀짚모자', 'hat', 'haenyeo', 'rare', 10, 3, false, '옷가게', true),
  ('haenyeo_hat_bow_headband_navy', '네이비 리본 머리띠', '앵커 배지가 달린 리본 머리띠', 'hat', 'haenyeo', 'common', 6, 1, false, '옷가게', true),
  ('haenyeo_hat_bow_headband_small', '화이트 리본 머리띠', '자잘한 무늬의 리본 머리띠', 'hat', 'haenyeo', 'common', 6, 1, false, '옷가게', true),
  ('haenyeo_hat_bow_headband_floral', '플로럴 리본 머리띠', '조개·불가사리 패턴 리본 머리띠', 'hat', 'haenyeo', 'common', 6, 1, false, '옷가게', true),
  ('haenyeo_hat_anchor_clip_1', '앵커 헤어핀', '화이트 앵커 헤어핀', 'hat', 'haenyeo', 'common', 4, 1, false, '옷가게', true),
  ('haenyeo_hat_anchor_clip_2', '골드 앵커 헤어핀', '골드 앵커 헤어핀', 'hat', 'haenyeo', 'common', 4, 1, false, '옷가게', true),
  ('haenyeo_hat_shell_clip', '조개 헤어핀', '진주조개 헤어핀', 'hat', 'haenyeo', 'common', 4, 1, false, '옷가게', true),
  ('haenyeo_hat_starfish_clip', '불가사리 헤어핀', '불가사리 헤어핀', 'hat', 'haenyeo', 'common', 4, 1, false, '옷가게', true),
  ('haenyeo_hat_daisy_clip', '데이지 헤어핀', '데이지꽃 헤어핀', 'hat', 'haenyeo', 'common', 4, 1, false, '옷가게', true),
  ('haenyeo_hat_shell_cluster_clip', '조개 모음 헤어핀', '조개·산딸기 모음 헤어핀', 'hat', 'haenyeo', 'common', 4, 1, false, '옷가게', true),
  ('haenyeo_hat_bow_clip_navy', '네이비 리본 핀', '앵커 배지가 달린 리본 핀', 'hat', 'haenyeo', 'common', 4, 1, false, '옷가게', true)
on conflict (sku) do nothing;

insert into public.store_products (store_id, catalog_item_id, sort_order, active)
select
  (select id from public.stores where slug = 'clothing'),
  ic.id,
  2000 + row_number() over (order by ic.sku),
  true
from public.item_catalog ic
where ic.sku in ('haenam_deck_hat_sailor_cap', 'haenam_deck_hat_bucket', 'haenam_engine_hat_aviator_white', 'haenam_engine_hat_aviator_blue', 'haenam_engine_hat_goggles_brown', 'haenam_engine_hat_goggles_red', 'haenam_engine_hat_wrench_gray', 'haenam_engine_hat_wrench_red', 'haenam_engine_hat_wrench_star', 'haenyeo_hat_sailor_bow', 'haenyeo_hat_straw', 'haenyeo_hat_bow_headband_navy', 'haenyeo_hat_bow_headband_small', 'haenyeo_hat_bow_headband_floral', 'haenyeo_hat_anchor_clip_1', 'haenyeo_hat_anchor_clip_2', 'haenyeo_hat_shell_clip', 'haenyeo_hat_starfish_clip', 'haenyeo_hat_daisy_clip', 'haenyeo_hat_shell_cluster_clip', 'haenyeo_hat_bow_clip_navy')
  and exists (select 1 from public.stores where slug = 'clothing')
  and not exists (
    select 1 from public.store_products sp
    where sp.store_id = (select id from public.stores where slug = 'clothing')
      and sp.catalog_item_id = ic.id
  );
