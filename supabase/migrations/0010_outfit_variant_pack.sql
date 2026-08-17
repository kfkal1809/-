-- 캐릭터 의상 시트 2/3/4/5/6/8/9(63벌, dress_full 체형별 합성 이미지) 카탈로그 등록.
-- lib/domain/itemAppearanceVariants.ts의 ITEM_APPEARANCE_VARIANTS가 sku -> 체형별 실제 렌더링
-- 자산을 따로 관리하므로, 여기서는 item_catalog에 '논리적 상품'만 추가한다(가격/이름/카테고리).
-- subcategory는 기존 규칙대로 'child'(온보딩 스타터 지급 로직과 동일 compatKeyFor 값) — 실제로
-- 어떤 체형이 착용 가능한지는 옷가게 목록 단계에서 isCompatibleWithBody()가 추가로 걸러낸다.
insert into public.item_catalog (sku, name, description, category, subcategory, rarity, buy_price, sell_price, placeable, source_label, active) values
  ('child_dress_s3_01', '세일러 반팔 세트', '닻 자수가 들어간 세일러 카라 상의와 반바지', 'outfit', 'child', 'common', 8, 2, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s3_02', '스트라이프 멜빵바지', '하늘색 스트라이프 멜빵 반바지 세트', 'outfit', 'child', 'common', 8, 2, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s3_03', '아이보리 하트 가디건', '하트 단추 가디건과 반바지 세트', 'outfit', 'child', 'common', 8, 2, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s3_04', '곰돌이 후드 우주복', '곰돌이 모자가 달린 전신 우주복', 'outfit', 'child', 'common', 9, 2, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s3_05', '그린 애플 티셔츠', '사과 자수 티셔츠와 반바지', 'outfit', 'child', 'common', 7, 1, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s3_06', '카키 멜빵바지', '카키색 멜빵 반바지 세트', 'outfit', 'child', 'common', 8, 2, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s3_07', '그린 니트 조끼', '니트 조끼와 반바지 세트', 'outfit', 'child', 'common', 8, 2, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s3_08', '야자수 하와이안 셔츠', '야자수 무늬 하와이안 셔츠', 'outfit', 'child', 'common', 8, 2, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s3_09', '블루 깅엄 셋업', '토끼 자수가 있는 블루 깅엄 상하의', 'outfit', 'child', 'common', 8, 2, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s5_01', '베이지 블레이저 세트', '베이지 블레이저 재킷과 반바지', 'outfit', 'child', 'rare', 14, 3, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s5_02', '브라운 에이프런 오버롤', '멜빵 에이프런 스타일 반바지 세트', 'outfit', 'child', 'common', 8, 2, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s5_03', '네이비 트랙 재킷', '네이비 스트라이프 트랙 재킷 세트', 'outfit', 'child', 'common', 9, 2, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s5_04', '블루 곰돌이 파자마', '곰돌이 슬리퍼가 딸린 블루 파자마', 'outfit', 'child', 'common', 8, 2, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s5_05', '데님 스트라이프 멜빵바지', '스트라이프 티셔츠 위 데님 멜빵바지', 'outfit', 'child', 'common', 8, 2, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s5_06', '크림 니트 조끼', '크림색 니트 조끼 세트', 'outfit', 'child', 'common', 8, 2, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s5_07', '네이비 스트라이프 폴로', '닻 자수 스트라이프 폴로와 반바지', 'outfit', 'child', 'common', 7, 1, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s5_08', '야자수 하와이안 셔츠(크림)', '크림톤 야자수 하와이안 셔츠', 'outfit', 'child', 'common', 8, 2, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s5_09', '브라운 베어 후드 우주복', '곰돌이 귀 모자 우주복', 'outfit', 'child', 'common', 9, 2, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s8_01', '스트라이프 반팔 세트', '블루 스트라이프 반팔과 베이지 반바지', 'outfit', 'child', 'common', 7, 1, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s8_02', '네이비 세일러 세트', '네이비 톤 세일러 상의와 반바지', 'outfit', 'child', 'common', 8, 2, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s8_03', '아이보리 가디건 반바지', '아이보리 가디건과 베이지 반바지', 'outfit', 'child', 'common', 8, 2, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s8_04', '블루 후드 세트', '블루 후드 상의와 그레이 팬츠', 'outfit', 'child', 'common', 8, 2, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s8_05', '네이비 니트 조끼', '네이비 니트 조끼와 반바지', 'outfit', 'child', 'common', 8, 2, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s8_06', '데님 멜빵바지(블루)', '블루 데님 멜빵 반바지 세트', 'outfit', 'child', 'common', 8, 2, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s8_07', '체크 셔츠 세트', '그린 체크 셔츠와 반바지', 'outfit', 'child', 'common', 8, 2, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s8_08', '스타 하와이안 셔츠', '별 무늬 하와이안 셔츠', 'outfit', 'child', 'common', 8, 2, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s8_09', '깅엄 체크 셋업', '블루 깅엄 체크 상하의', 'outfit', 'child', 'common', 8, 2, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s4_01', '캡틴 유니폼', '닻 자수 캡틴 모자와 항해 제복 세트', 'outfit', 'child', 'rare', 14, 3, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s4_02', '오렌지 작업복 세트', '공구 파우치가 달린 오렌지 작업복', 'outfit', 'child', 'common', 9, 2, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s4_03', '옐로우 레인코트', '노란 레인부츠가 딸린 레인코트', 'outfit', 'child', 'common', 9, 2, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s4_04', '그린 가디건 크로스백', '크로스백을 멘 그린 가디건 세트', 'outfit', 'child', 'common', 8, 2, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s4_05', '아이보리 니트 목도리 세트', '목도리를 두른 니트와 반바지', 'outfit', 'child', 'common', 9, 2, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s4_06', '그린 두루마기 한복', '초록 저고리 두루마기 한복', 'outfit', 'child', 'rare', 14, 3, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s4_07', '강아지 후드 우주복', '강아지 얼굴 모자 우주복', 'outfit', 'child', 'common', 9, 2, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s4_08', '클로버 파자마', '클로버 자수 파자마 세트', 'outfit', 'child', 'common', 8, 2, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s4_09', '하와이안 밀짚모자 세트', '밀짚모자와 하와이안 셔츠 반바지', 'outfit', 'child', 'common', 8, 2, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s6_01', '세일러 원피스', '닻 리본이 달린 세일러 원피스', 'outfit', 'child', 'common', 10, 2, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s6_02', '데님 멜빵 원피스', '체크 블라우스 위 데님 멜빵 원피스', 'outfit', 'child', 'common', 10, 2, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s6_03', '핑크 가디건 원피스', '체리 자수 가디건 원피스', 'outfit', 'child', 'common', 10, 2, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s6_04', '토끼 후드 우주복', '토끼 귀 후드가 달린 우주복', 'outfit', 'child', 'common', 9, 2, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s6_05', '옐로우 깅엄 원피스', '노란 깅엄 체크 원피스', 'outfit', 'child', 'common', 10, 2, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s6_06', '플로럴 블라우스 세트', '꽃무늬 블라우스와 스커트', 'outfit', 'child', 'common', 10, 2, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s6_07', '핑크 리본 블루머 세트', '리본 블라우스와 블루머 반바지', 'outfit', 'child', 'common', 10, 2, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s6_08', '체크 파자마(핑크)', '체크 파자마와 곰돌이 머리띠', 'outfit', 'child', 'common', 8, 2, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s6_09', '블루 멜빵 원피스', '꽃 자수 블루 멜빵 원피스', 'outfit', 'child', 'common', 10, 2, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s2_01', '프린세스 하트 원피스', '하트 백을 든 핑크 프린세스 원피스', 'outfit', 'child', 'rare', 14, 3, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s2_02', '스트로베리 원피스', '딸기 자수 원피스와 딸기 가방', 'outfit', 'child', 'common', 10, 2, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s2_03', '세일러 멜빵 세트', '닻 자수 세일러 멜빵 반바지', 'outfit', 'child', 'common', 10, 2, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s2_04', '옐로우 덕 레인코트', '오리 가방을 멘 노란 레인코트', 'outfit', 'child', 'common', 9, 2, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s2_05', '하트 니트 세트', '하트 무늬 니트 케이프와 원피스', 'outfit', 'child', 'common', 10, 2, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s2_06', '핑크 한복', '벚꽃 자수 핑크 한복', 'outfit', 'child', 'rare', 14, 3, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s2_07', '리본 프릴 원피스', '리본 장식 프릴 원피스', 'outfit', 'child', 'common', 10, 2, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s2_08', '토끼 우주복', '토끼 인형이 달린 우주복', 'outfit', 'child', 'common', 9, 2, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s2_09', '하와이안 스트로베리 세트', '밀짚모자와 딸기 바구니 원피스', 'outfit', 'child', 'common', 10, 2, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s9_01', '캡틴 유니폼(초등)', '닻 자수 캡틴 모자와 항해 제복', 'outfit', 'child', 'rare', 16, 4, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s9_02', '세이프티 유니폼', '무전기를 찬 오렌지 세이프티 유니폼', 'outfit', 'child', 'common', 10, 2, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s9_03', '옐로우 레인코트(초등)', '노란 레인부츠가 딸린 레인코트', 'outfit', 'child', 'common', 10, 2, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s9_04', '보타이 베스트 세트', '보타이와 서스펜더 베스트 세트', 'outfit', 'child', 'common', 10, 2, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s9_05', '체크 파자마(초등)', '토끼 슬리퍼가 딸린 체크 파자마', 'outfit', 'child', 'common', 9, 2, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s9_06', '니트 목도리 세트(초등)', '목도리를 두른 니트와 팬츠', 'outfit', 'child', 'common', 10, 2, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s9_07', '네이비 블레이저', '체크 팬츠 위 네이비 교복 블레이저', 'outfit', 'child', 'rare', 16, 4, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s9_08', '하와이안 밀짚모자 세트(초등)', '밀짚모자와 하와이안 셔츠 반바지', 'outfit', 'child', 'common', 9, 2, false, '캐릭터 의상 컬렉션', true),
  ('child_dress_s9_09', '순록 니트 세트', '순록 무늬 니트와 팬츠', 'outfit', 'child', 'common', 10, 2, false, '캐릭터 의상 컬렉션', true)
on conflict (sku) do nothing;

insert into public.store_products (store_id, catalog_item_id, sort_order, active)
select
  (select id from public.stores where slug = 'clothing'),
  ic.id,
  1000 + row_number() over (order by ic.sku),
  true
from public.item_catalog ic
where ic.sku in ('child_dress_s3_01', 'child_dress_s3_02', 'child_dress_s3_03', 'child_dress_s3_04', 'child_dress_s3_05', 'child_dress_s3_06', 'child_dress_s3_07', 'child_dress_s3_08', 'child_dress_s3_09', 'child_dress_s5_01', 'child_dress_s5_02', 'child_dress_s5_03', 'child_dress_s5_04', 'child_dress_s5_05', 'child_dress_s5_06', 'child_dress_s5_07', 'child_dress_s5_08', 'child_dress_s5_09', 'child_dress_s8_01', 'child_dress_s8_02', 'child_dress_s8_03', 'child_dress_s8_04', 'child_dress_s8_05', 'child_dress_s8_06', 'child_dress_s8_07', 'child_dress_s8_08', 'child_dress_s8_09', 'child_dress_s4_01', 'child_dress_s4_02', 'child_dress_s4_03', 'child_dress_s4_04', 'child_dress_s4_05', 'child_dress_s4_06', 'child_dress_s4_07', 'child_dress_s4_08', 'child_dress_s4_09', 'child_dress_s6_01', 'child_dress_s6_02', 'child_dress_s6_03', 'child_dress_s6_04', 'child_dress_s6_05', 'child_dress_s6_06', 'child_dress_s6_07', 'child_dress_s6_08', 'child_dress_s6_09', 'child_dress_s2_01', 'child_dress_s2_02', 'child_dress_s2_03', 'child_dress_s2_04', 'child_dress_s2_05', 'child_dress_s2_06', 'child_dress_s2_07', 'child_dress_s2_08', 'child_dress_s2_09', 'child_dress_s9_01', 'child_dress_s9_02', 'child_dress_s9_03', 'child_dress_s9_04', 'child_dress_s9_05', 'child_dress_s9_06', 'child_dress_s9_07', 'child_dress_s9_08', 'child_dress_s9_09')
  and exists (select 1 from public.stores where slug = 'clothing')
  and not exists (
    select 1 from public.store_products sp
    where sp.store_id = (select id from public.stores where slug = 'clothing')
      and sp.catalog_item_id = ic.id
  );

