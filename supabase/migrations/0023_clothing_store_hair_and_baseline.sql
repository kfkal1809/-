-- 옷가게 "헤어" 탭 신설 + 상의/원피스/모자/악세사리 탭의 기본 상품 누락 보강.
--
-- 원인: 0009_clothing_store.sql의 최초 store_products 등록은 supabase/seed.sql에 있는
-- item_catalog 기본 행(해녀 옷 4종, 해남 항해사 옷 3종, 해남 기관사 옷 2종, 새싹 옷 3종,
-- 해녀 헤어 5종, 기본 모자 2종, 기본 소품 1종)이 이미 DB에 있다는 걸 전제로 한다. 그런데
-- seed.sql은 "supabase db reset"(로컬 개발용) 때만 실행되고 운영 DB에는 자동 적용되지 않는
-- 파일이라, 그 기본 행 자체가 운영 DB에 없을 수 있다 — 이후 마이그레이션(0010/0016/0018/
-- 0019/0020)은 전부 자기 완결적(item_catalog insert + store_products insert를 같은
-- 마이그레이션 안에서 함께 처리)이라 문제없이 반영됐겠지만, 그 마이그레이션들은 전부 새싹
-- 옷/해남 부가 소품/모자류만 다뤘고 "기본 지급" 계열 상의·원피스·헤어는 건드리지 않았다.
-- 그 결과 해녀/해남으로 옷가게에 들어가면 상의·원피스 탭이 비어 보일 수 있었다.
--
-- 헤어는 애초에 옷가게 카테고리 필터(category in ('outfit','hat','accessory'))에서 아예
-- 빠져 있었다(0009 주석에 "이번 옷가게 판매 목록에는 포함하지 않는다"고 명시) — 이번에
-- 프론트엔드(clothingStoreCategories.ts/clothingStoreData.ts)에 헤어 탭을 추가했으므로
-- 여기서 실제 상품도 등록한다. 해남 헤어(부서 무관 4종)와 새싹 헤어(3종)는 지금까지 옷가게에
-- 등록된 적이 자체가 없었다.
--
-- 전부 on conflict (sku) do nothing / not exists 체크로 멱등 — 이미 seed.sql이나 이전
-- 마이그레이션으로 들어간 행이 있어도 중복 생성되지 않는다.

insert into public.item_catalog (sku, name, description, category, subcategory, rarity, buy_price, sell_price, placeable, source_label, active) values
  -- 해녀 기본 지급 옷 (seed.sql과 동일 — 운영 DB에 없을 경우를 대비해 여기서도 보강)
  ('haenyeo_outfit_overalls', '흰 티 + 청멜빵', '해녀 기본 일상복', 'outfit', 'haenyeo', 'common', 0, 1, false, '기본 지급', true),
  ('haenyeo_outfit_dress', '데일리 원피스', '해녀 원피스', 'outfit', 'haenyeo', 'common', 10, 2, false, '기본 지급', true),
  ('haenyeo_outfit_sweatshirt', '오트밀 맨투맨', '해녀 맨투맨', 'outfit', 'haenyeo', 'common', 9, 2, false, '기본 지급', true),
  ('haenyeo_outfit_pajama', '별무늬 잠옷', '해녀 잠옷', 'outfit', 'haenyeo', 'common', 8, 1, false, '기본 지급', true),
  -- 해녀 기본 지급 헤어
  ('haenyeo_hair_wave', '웨이브 단발', '해녀 헤어', 'hair', 'haenyeo', 'common', 6, 1, false, '기본 지급', true),
  ('haenyeo_hair_pony', '높은 포니테일', '해녀 헤어', 'hair', 'haenyeo', 'common', 7, 1, false, '기본 지급', true),
  ('haenyeo_hair_bob', '단정 단발', '해녀 헤어', 'hair', 'haenyeo', 'common', 6, 1, false, '기본 지급', true),
  ('haenyeo_hair_twin', '트윈테일', '해녀 헤어', 'hair', 'haenyeo', 'rare', 9, 2, false, '기본 지급', true),
  ('haenyeo_hair_bun', '올림머리', '해녀 헤어', 'hair', 'haenyeo', 'common', 6, 1, false, '기본 지급', true),
  -- 해남 항해사 기본 지급
  ('haenam_deck_outfit_uniform', '항해사 제복', '항해사 기본 제복', 'outfit', 'haenam_deck', 'common', 0, 1, false, '기본 지급', true),
  ('haenam_deck_hat_cap', '항해모', '항해사 모자', 'hat', 'haenam_deck', 'common', 0, 1, false, '기본 지급', true),
  ('haenam_deck_outfit_casual', '오프 캐주얼', '항해사 일상복', 'outfit', 'haenam_deck', 'common', 9, 2, false, '기본 지급', true),
  ('haenam_deck_outfit_shirt', '흰 셔츠', '항해사 근무복', 'outfit', 'haenam_deck', 'common', 8, 1, false, '기본 지급', true),
  -- 해남 기관사 기본 지급
  ('haenam_engine_outfit_overalls', '주황 작업복', '기관사 기본 작업복', 'outfit', 'haenam_engine', 'common', 0, 1, false, '기본 지급', true),
  ('haenam_engine_acc_wrench', '스패너', '기관사 소품', 'accessory', 'haenam_engine', 'common', 0, 1, false, '기본 지급', true),
  ('haenam_engine_hat_helmet', '안전모', '기관사 안전모', 'hat', 'haenam_engine', 'common', 5, 1, false, '기본 지급', true),
  ('haenam_engine_outfit_casual', '기관사 캐주얼', '기관사 일상복', 'outfit', 'haenam_engine', 'common', 9, 2, false, '기본 지급', true),
  -- 새싹 기본
  ('child_outfit_overalls', '아기 멜빵바지', '새싹 기본옷', 'outfit', 'child', 'common', 0, 1, false, '기본 지급', true),
  ('child_outfit_dress', '새싹 원피스', '새싹 기본옷', 'outfit', 'child', 'common', 6, 1, false, '기본 지급', true),
  ('child_outfit_hoodie', '새싹 후드', '새싹 기본옷', 'outfit', 'child', 'common', 6, 1, false, '기본 지급', true),
  -- 해남 헤어(부서 무관 4스타일 x 2부서 등록 — 위 주석 참고)
  ('haenam_deck_hair_short_neat', '단정 스타일', '해남 헤어', 'hair', 'haenam_deck', 'common', 6, 1, false, '옷가게', true),
  ('haenam_deck_hair_buzz', '짧은머리', '해남 헤어', 'hair', 'haenam_deck', 'common', 6, 1, false, '옷가게', true),
  ('haenam_deck_hair_sideswept', '사이드 스타일', '해남 헤어', 'hair', 'haenam_deck', 'common', 7, 1, false, '옷가게', true),
  ('haenam_deck_hair_bob', '단발', '해남 헤어', 'hair', 'haenam_deck', 'rare', 8, 2, false, '옷가게', true),
  ('haenam_engine_hair_short_neat', '단정 스타일', '해남 헤어', 'hair', 'haenam_engine', 'common', 6, 1, false, '옷가게', true),
  ('haenam_engine_hair_buzz', '짧은머리', '해남 헤어', 'hair', 'haenam_engine', 'common', 6, 1, false, '옷가게', true),
  ('haenam_engine_hair_sideswept', '사이드 스타일', '해남 헤어', 'hair', 'haenam_engine', 'common', 7, 1, false, '옷가게', true),
  ('haenam_engine_hair_bob', '단발', '해남 헤어', 'hair', 'haenam_engine', 'rare', 8, 2, false, '옷가게', true),
  -- 새싹 헤어 3종
  ('child_hair_bob', '단발', '새싹 헤어', 'hair', 'child', 'common', 5, 1, false, '옷가게', true),
  ('child_hair_twin', '트윈테일', '새싹 헤어', 'hair', 'child', 'rare', 7, 2, false, '옷가게', true),
  ('child_hair_pony', '포니테일', '새싹 헤어', 'hair', 'child', 'common', 5, 1, false, '옷가게', true)
on conflict (sku) do nothing;

insert into public.store_products (store_id, catalog_item_id, sort_order, active)
select
  (select id from public.stores where slug = 'clothing'),
  ic.id,
  3000 + row_number() over (order by ic.category, ic.subcategory, ic.sku),
  true
from public.item_catalog ic
where ic.sku in (
  'haenyeo_outfit_overalls', 'haenyeo_outfit_dress', 'haenyeo_outfit_sweatshirt', 'haenyeo_outfit_pajama',
  'haenyeo_hair_wave', 'haenyeo_hair_pony', 'haenyeo_hair_bob', 'haenyeo_hair_twin', 'haenyeo_hair_bun',
  'haenam_deck_outfit_uniform', 'haenam_deck_hat_cap', 'haenam_deck_outfit_casual', 'haenam_deck_outfit_shirt',
  'haenam_engine_outfit_overalls', 'haenam_engine_acc_wrench', 'haenam_engine_hat_helmet', 'haenam_engine_outfit_casual',
  'child_outfit_overalls', 'child_outfit_dress', 'child_outfit_hoodie',
  'haenam_deck_hair_short_neat', 'haenam_deck_hair_buzz', 'haenam_deck_hair_sideswept', 'haenam_deck_hair_bob',
  'haenam_engine_hair_short_neat', 'haenam_engine_hair_buzz', 'haenam_engine_hair_sideswept', 'haenam_engine_hair_bob',
  'child_hair_bob', 'child_hair_twin', 'child_hair_pony'
)
  and exists (select 1 from public.stores where slug = 'clothing')
  and not exists (
    select 1 from public.store_products sp
    where sp.store_id = (select id from public.stores where slug = 'clothing')
      and sp.catalog_item_id = ic.id
  );
