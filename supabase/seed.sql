-- 해기사와 연인들의 항해일지 — 초기 Seed 데이터 (기획서 9장)
-- `supabase db reset` 시 자동 실행된다.

-- =========================================================
-- 공용 공간 (household_id 없음)
-- =========================================================
insert into public.spaces (id, type, slug, name, background_asset, promo_text) values
  (gen_random_uuid(), 'deck', 'deck', '갑판 광장', 'deck_main', null),
  (gen_random_uuid(), 'mess', 'mess-room', '선내식당', 'mess_room', '오늘도 기깔나게 해드릴게요.'),
  (gen_random_uuid(), 'shipping', 'shipping', '(주)해녀해운', 'shipping_office', '의견을 남겨주세요. 최고의 서비스로 모시겠습니다.'),
  (gen_random_uuid(), 'hall', 'hall-of-fame', '명예의 전당', 'hall_of_fame', null),
  (gen_random_uuid(), 'jewelry', 'jewelry', '귀금속점', 'jewelry_shop', null);

-- =========================================================
-- 가게: 본뿌리 / 리리양곱창
-- =========================================================
insert into public.spaces (id, type, slug, name, background_asset, promo_text)
values (gen_random_uuid(), 'store', 'bonppuri-space', '본뿌리', 'bonppuri_interior', '미니멀하고 감성적인 플라워 스튜디오');

insert into public.stores (id, slug, name, space_id, promo_text, status)
select gen_random_uuid(), 'bonppuri', '본뿌리', id, '미니멀하고 감성적인 플라워 스튜디오', 'active'
from public.spaces where slug = 'bonppuri-space';

update public.spaces set store_id = (select id from public.stores where slug = 'bonppuri')
where slug = 'bonppuri-space';

insert into public.spaces (id, type, slug, name, background_asset, promo_text)
values (gen_random_uuid(), 'store', 'liri-gopchang-space', '리리양곱창', 'liri_gopchang_interior', '배고프면 언제든 들려요!');

insert into public.stores (id, slug, name, space_id, promo_text, status)
select gen_random_uuid(), 'liri-gopchang', '리리양곱창', id, '배고프면 언제든 들려요!', 'active'
from public.spaces where slug = 'liri-gopchang-space';

update public.spaces set store_id = (select id from public.stores where slug = 'liri-gopchang')
where slug = 'liri-gopchang-space';

-- =========================================================
-- 아이템 카탈로그 — 기본 지급/구매 가능 아이템
-- =========================================================
insert into public.item_catalog (sku, name, description, category, subcategory, rarity, buy_price, sell_price, placeable, source_label, active) values
  -- 해녀 기본 지급
  ('haenyeo_outfit_overalls', '흰 티 + 청멜빵', '해녀 기본 일상복', 'outfit', 'haenyeo', 'common', 0, 1, false, '기본 지급', true),
  ('haenyeo_outfit_dress', '데일리 원피스', '해녀 원피스', 'outfit', 'haenyeo', 'common', 10, 2, false, '기본 지급', true),
  ('haenyeo_outfit_sweatshirt', '오트밀 맨투맨', '해녀 맨투맨', 'outfit', 'haenyeo', 'common', 9, 2, false, '기본 지급', true),
  ('haenyeo_outfit_pajama', '별무늬 잠옷', '해녀 잠옷', 'outfit', 'haenyeo', 'common', 8, 1, false, '기본 지급', true),
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
  -- 기본 가구
  ('furniture_bed', '침대', '선실 기본 가구', 'furniture', 'basic', 'common', 0, 2, true, '기본 지급', true),
  ('furniture_desk', '책상', '선실 기본 가구', 'furniture', 'basic', 'common', 0, 2, true, '기본 지급', true),
  ('furniture_chair', '의자', '선실 기본 가구', 'furniture', 'basic', 'common', 0, 1, true, '기본 지급', true),
  ('furniture_fridge', '작은 냉장고', '선실 기본 가구', 'furniture', 'basic', 'common', 0, 2, true, '기본 지급', true),
  ('furniture_porthole', '현창', '선실 기본 가구', 'furniture', 'basic', 'common', 0, 1, true, '기본 지급', true),
  ('furniture_lamp', '벽등', '선실 기본 가구', 'furniture', 'basic', 'common', 0, 1, true, '기본 지급', true),
  ('furniture_rug', '러그', '선실 기본 가구', 'furniture', 'basic', 'common', 0, 1, true, '기본 지급', true),
  ('furniture_shelf', '블랙 선반', '작은 가구', 'furniture', 'shop', 'common', 6, 2, true, '상점', true),
  ('furniture_stand_light', '따뜻한 스탠드조명', '대형 가구', 'furniture', 'shop', 'rare', 14, 4, true, '상점', true),
  -- 본뿌리 상품 (선실 영구 배치, 고가 사치품)
  ('bonppuri_season_bouquet', '계절 꽃다발', '시들지 않는 계절 꽃다발', 'furniture', 'bonppuri', 'rare', 18, 6, true, '본뿌리', true),
  ('bonppuri_peony_bouquet', '작약 꽃다발', '작약으로 만든 꽃다발', 'furniture', 'bonppuri', 'rare', 24, 8, true, '본뿌리', true),
  ('bonppuri_mini_vase', '미니 화병', '아기자기한 미니 화병', 'furniture', 'bonppuri', 'rare', 22, 7, true, '본뿌리', true),
  ('bonppuri_peony_vase', '작약 화병', '작약을 꽂은 화병', 'furniture', 'bonppuri', 'epic', 30, 10, true, '본뿌리', true),
  ('bonppuri_wedding_bouquet', '웨딩 부케', '순백의 웨딩 부케', 'furniture', 'bonppuri', 'epic', 32, 11, true, '본뿌리', true),
  ('bonppuri_premium_bouquet', '프리미엄 부케', '화려한 프리미엄 부케', 'furniture', 'bonppuri', 'epic', 40, 14, true, '본뿌리', true),
  ('bonppuri_season_deco', '시즌 한정 꽃장식', '시즌 한정 꽃 장식', 'furniture', 'bonppuri', 'legendary', 52, 18, true, '본뿌리', true),
  -- 낚시 획득물: 물고기
  ('fish_mackerel', '고등어', '흔한 어종', 'keepsake', 'fish', 'common', 0, 2, false, '낚시터', true),
  ('fish_squid', '오징어', '흔한 어종', 'keepsake', 'fish', 'common', 0, 2, false, '낚시터', true),
  ('fish_tuna', '참치', '중간급 어종', 'keepsake', 'fish', 'rare', 0, 4, false, '낚시터', true),
  ('fish_octopus', '문어', '중간급 어종', 'keepsake', 'fish', 'rare', 0, 4, false, '낚시터', true),
  ('fish_pufferfish', '복어', '중간급 어종', 'keepsake', 'fish', 'rare', 0, 5, false, '낚시터', true),
  ('fish_crab', '대게', '희귀 어종', 'keepsake', 'fish', 'epic', 0, 7, false, '낚시터', true),
  ('fish_rare_species', '희귀어종', '아주 희귀한 어종', 'keepsake', 'fish', 'epic', 0, 9, false, '낚시터', true),
  ('fish_anchovy_school', '멸치떼', '무리지어 잡히는 흔한 어종', 'keepsake', 'fish', 'common', 0, 2, false, '낚시터', true),
  ('fish_mackerel_school', '고등어떼', '무리지어 잡히는 흔한 어종', 'keepsake', 'fish', 'common', 0, 2, false, '낚시터', true),
  -- 낚시 획득물: 물고기(희귀 변종)
  ('fish_glitter_scad', '반짝 전갱이', '반짝이는 비늘의 희귀 어종', 'keepsake', 'fish', 'epic', 0, 8, false, '낚시터', true),
  ('fish_starry_pufferfish', '별무늬 복어', '별무늬가 있는 희귀 복어', 'keepsake', 'fish', 'epic', 0, 8, false, '낚시터', true),
  ('fish_moonlight_squid', '달빛 오징어', '달빛 아래에서만 잡히는 오징어', 'keepsake', 'fish', 'epic', 0, 8, false, '낚시터', true),
  ('fish_pink_octopus', '분홍 문어', '분홍빛이 도는 희귀 문어', 'keepsake', 'fish', 'epic', 0, 8, false, '낚시터', true),
  ('fish_wave_tuna', '파도참치', '파도를 닮은 무늬의 희귀 참치', 'keepsake', 'fish', 'epic', 0, 9, false, '낚시터', true),
  ('fish_golden_anchovy', '황금 멸치', '금빛으로 반짝이는 희귀 멸치떼', 'keepsake', 'fish', 'epic', 0, 9, false, '낚시터', true),
  -- 낚시 획득물: 해남이 분실물
  ('lost_old_phone', '해남이가 떨어뜨린 낡은 휴대폰', '복원하면 무슨 일이 벌어질까?', 'keepsake', 'lost', 'epic', 0, 3, false, '낚시터', true),
  ('lost_glove', '작업장갑 한 짝', '분실물', 'keepsake', 'lost', 'common', 0, 1, false, '낚시터', true),
  ('lost_notebook', '젖은 수첩', '분실물', 'keepsake', 'lost', 'common', 0, 1, false, '낚시터', true),
  ('lost_earphone', '바닷물 먹은 이어폰', '분실물', 'keepsake', 'lost', 'rare', 0, 2, false, '낚시터', true),
  ('lost_mug', '머그컵', '분실물', 'keepsake', 'lost', 'common', 0, 1, false, '낚시터', true),
  ('lost_leave_form', '구겨진 휴가신청서', '분실물', 'keepsake', 'lost', 'rare', 0, 2, false, '낚시터', true),
  ('lost_boarding_pass', '반쯤 젖은 탑승권', '분실물', 'keepsake', 'lost', 'rare', 0, 2, false, '낚시터', true),
  ('lost_photo', '낡은 사진', '분실물', 'keepsake', 'lost', 'epic', 0, 3, false, '낚시터', true),
  -- 낚시 획득물: 쓰레기
  ('trash_boots', '장화', '쓰레기', 'keepsake', 'trash', 'common', 0, 1, false, '낚시터', true),
  ('trash_tire', '폐타이어', '쓰레기', 'keepsake', 'trash', 'common', 0, 1, false, '낚시터', true),
  ('trash_can', '찌그러진 캔', '쓰레기', 'keepsake', 'trash', 'common', 0, 1, false, '낚시터', true),
  ('trash_slipper', '슬리퍼', '쓰레기', 'keepsake', 'trash', 'common', 0, 1, false, '낚시터', true),
  ('trash_sock', '누군가 잃어버린 양말', '쓰레기', 'keepsake', 'trash', 'common', 0, 1, false, '낚시터', true),
  -- 낚시 획득물: 전설템
  ('legend_flight_ticket', '귀국 비행기표', '전설 등급 수집품', 'keepsake', 'legend', 'legendary', 0, 20, false, '낚시터', true),
  ('legend_signoff_doc', '하선확정문서', '전설 등급 수집품', 'keepsake', 'legend', 'legendary', 0, 20, false, '낚시터', true),
  ('legend_soon_note', '전설의 곧 입항해 메모', '전설 등급 수집품', 'keepsake', 'legend', 'legendary', 0, 20, false, '낚시터', true),
  ('legend_ship_souvenir', '희귀 선박 기념품', '전설 등급 수집품', 'keepsake', 'legend', 'legendary', 0, 20, false, '낚시터', true),
  -- 조리 결과물 (선내식당 조리하기 보상)
  ('dish_sashimi', '회용 생선', '신선하게 손질한 회', 'keepsake', 'dish', 'rare', 0, 3, false, '선내식당', true),
  ('dish_grilled', '구이용 생선', '노릇하게 구운 생선', 'keepsake', 'dish', 'common', 0, 2, false, '선내식당', true),
  ('dish_stew', '탕용 생선', '얼큰하게 끓인 생선탕', 'keepsake', 'dish', 'common', 0, 2, false, '선내식당', true),
  ('dish_seafood_platter', '해물모둠', '푸짐한 해물모둠', 'keepsake', 'dish', 'epic', 0, 5, false, '선내식당', true),
  ('dish_shrimp', '새우', '통통하게 익힌 새우', 'keepsake', 'dish', 'rare', 0, 3, false, '선내식당', true),
  ('dish_clam', '조개', '술찜한 조개', 'keepsake', 'dish', 'common', 0, 2, false, '선내식당', true),
  -- 분실물 복원 결과물
  ('restore_photo_fragment', '사진 조각', '복원하다 찾은 사진 조각', 'keepsake', 'restored', 'rare', 0, 2, false, '분실물 복원', true),
  ('restore_old_phone_fixed', '복원한 휴대폰', '해남이가 떨어뜨렸던 휴대폰을 고쳤다. 선실 책상에 놓을 수 있다', 'furniture', 'restored', 'epic', 0, 8, true, '분실물 복원', true),
  -- 커플링
  ('ring_wave', '파도 커플링', '커플링 세트', 'accessory', 'ring', 'rare', 25, 8, false, '귀금속점', true),
  ('ring_shell', '진주조개 커플링', '커플링 세트', 'accessory', 'ring', 'epic', 40, 14, false, '귀금속점', true),
  ('ring_lighthouse', '등대불빛 커플링', '커플링 세트', 'accessory', 'ring', 'legendary', 60, 20, false, '귀금속점', true),
  ('special_marriage_document', '해연결호 혼인신고서', '혼인신고 특별 아이템', 'special', 'marriage', 'legendary', 30, 0, false, '귀금속점', true)
on conflict (sku) do nothing;

-- =========================================================
-- 본뿌리 상품 진열
-- =========================================================
insert into public.store_products (store_id, catalog_item_id, sort_order)
select s.id, i.id, row_number() over (order by i.buy_price)
from public.stores s
join public.item_catalog i on i.subcategory = 'bonppuri'
where s.slug = 'bonppuri'
on conflict do nothing;

-- =========================================================
-- 미션 카탈로그 (1.19 / 1.20)
-- =========================================================
insert into public.mission_catalog (key, cadence, title, description, target, reward, sort_order) values
  ('attendance', 'daily', '출석', '앱 출항 1회', 1, 1, 1),
  ('visit_bonppuri', 'daily', '본뿌리 방문', '해당일 본뿌리 진입', 1, 1, 2),
  ('visit_liri', 'daily', '리리양곱창 방문', '해당일 리리양곱창 진입', 1, 1, 3),
  ('visit_deck', 'daily', '갑판 방문', '해당일 갑판 진입', 1, 1, 4),
  ('guestbook', 'daily', '방명록 작성', '서로 다른 선실 방명록 3회', 3, 2, 5),
  ('fishing', 'daily', '낚시', '4h/8h 자동낚시 1회 시작', 1, 1, 6),
  ('daily_clear', 'daily', '데일리 올클리어', '위 모든 미션 완료', 1, 2, 99),
  ('attendance5', 'weekly', '성실 승선', '앱 출석 5일', 5, 5, 1),
  ('fishing5', 'weekly', '꾸준한 조업', '낚시 5회', 5, 5, 2),
  ('cabin_visit5', 'weekly', '선실 순방', '서로 다른 선실 5곳 방문', 5, 4, 3),
  ('deck_visit4', 'weekly', '갑판 단골', '서로 다른 4일 갑판 방문', 4, 4, 4),
  ('weekly_clear', 'weekly', '주간 올클리어', '모든 주간미션 완료', 1, 7, 99)
on conflict (key) do nothing;
