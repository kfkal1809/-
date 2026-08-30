import type { CharacterAppearance } from "@/lib/domain/characterPresets";

export type EquipSlot = "hair" | "outfit" | "hat" | "accessory";

// 카탈로그 SKU → 실제 렌더링에 적용할 외형 패치. 착용 시 이 패치를 characters.appearance_json에 병합한다.
// outfitAssetKey: public/images/character/outfit_full/<key>.png — 목 아래 전신 실루엣을 통째로
// 교체하는 실사 일러스트 키(scripts/normalize_outfits.py로 50장을 공통 캔버스에 정규화한 것 중
// 하나를 항목별로 골라 연결). outfit/outfitColor는 여전히 구버전 SVG 폴백용으로 유지.
export const ITEM_APPEARANCE_PATCH: Record<string, Partial<CharacterAppearance>> = {
  // 해녀 옷
  // outfitAssetKey/fullPortraitKey는 서로 배타적인 렌더링 경로라(CharacterSprite가
  // fullPortraitKey를 우선 검사) 착용 시 병합({...prev, ...patch})만으로는 이전에 입고 있던
  // 반대쪽 경로의 값이 안 지워진다 — 예를 들어 원피스(fullPortraitKey) 착용 후 오버롤
  // (outfitAssetKey만 있는 옛 패치)로 갈아입어도 patch에 fullPortraitKey 키 자체가 없으면
  // 이전 값이 그대로 남아 원피스가 계속 렌더링되는 실제 버그가 있었다. 그래서 두 필드를 항상
  // 세트로(쓰는 쪽은 실제 키, 안 쓰는 쪽은 null) 명시한다.
  haenyeo_outfit_overalls: { outfit: "haenyeo_overalls", outfitAssetKey: "haenyeo_outfit_02", fullPortraitKey: null },
  haenyeo_outfit_dress: { outfit: "dress", outfitColor: "#f2b8c6", outfitAssetKey: "haenyeo_outfit_17", fullPortraitKey: "haenyeo_dress_02" },
  haenyeo_outfit_sweatshirt: { outfit: "sweatshirt", outfitColor: "#e9d9c3", outfitAssetKey: "haenyeo_outfit_06", fullPortraitKey: null },
  haenyeo_outfit_pajama: { outfit: "pajama", outfitColor: "#cfe0ff", outfitAssetKey: "haenyeo_outfit_19", fullPortraitKey: null },
  // 해녀 헤어
  haenyeo_hair_wave: { hairStyle: "wave" },
  haenyeo_hair_pony: { hairStyle: "pony" },
  haenyeo_hair_bob: { hairStyle: "bob" },
  haenyeo_hair_twin: { hairStyle: "twin" },
  haenyeo_hair_bun: { hairStyle: "bun" },
  // 해남 항해사
  haenam_deck_outfit_uniform: { outfit: "haenam_deck_uniform", outfitColor: "#2c3f66", outfitAssetKey: "haenam_deck_outfit_04", fullPortraitKey: null },
  haenam_deck_hat_cap: { hat: "captain", hatAssetKey: "hat_captain" },
  haenam_deck_outfit_casual: { outfit: "sweatshirt", outfitColor: "#7fa8dd", outfitAssetKey: "haenam_deck_outfit_02", fullPortraitKey: null },
  haenam_deck_outfit_shirt: { outfit: "haenam_deck_uniform", outfitColor: "#3a5a8c", outfitAssetKey: "haenam_deck_outfit_08", fullPortraitKey: null },
  // 해남 기관사
  haenam_engine_outfit_overalls: { outfit: "haenam_engine_overalls", outfitAssetKey: "haenam_engine_outfit_01", fullPortraitKey: null },
  haenam_engine_acc_wrench: { accessory: "wrench", handAssetKey: "hand_tool_pouch" },
  haenam_engine_hat_helmet: { hat: "hardhat", hatAssetKey: "hat_hardhat" },
  haenam_engine_outfit_casual: { outfit: "sweatshirt", outfitColor: "#ff9a4d", outfitAssetKey: "haenam_engine_outfit_03", fullPortraitKey: null },
  // 새싹
  child_outfit_overalls: { outfit: "child_overalls", outfitAssetKey: "child_outfit_02", fullPortraitKey: null },
  child_outfit_dress: { outfit: "dress", outfitColor: "#f2b8c6", outfitAssetKey: "child_outfit_04", fullPortraitKey: null },
  child_outfit_hoodie: { outfit: "hoodie", outfitColor: "#a7d8c9", outfitAssetKey: "child_outfit_05", fullPortraitKey: null },
  // 모자 소품 21종 (0016_hat_accessory_pack) — HatStyle 벡터 폴백 대응이 없어 hatAssetKey만 연결.
  haenam_deck_hat_sailor_cap: { hatAssetKey: "hat_sailor_cap" },
  haenam_deck_hat_bucket: { hatAssetKey: "hat_bucket" },
  haenam_engine_hat_aviator_white: { hatAssetKey: "hat_aviator_white" },
  haenam_engine_hat_aviator_blue: { hatAssetKey: "hat_aviator_blue" },
  haenam_engine_hat_goggles_brown: { hatAssetKey: "hat_goggles_brown" },
  haenam_engine_hat_goggles_red: { hatAssetKey: "hat_goggles_red" },
  haenam_engine_hat_wrench_gray: { hatAssetKey: "hat_wrench_headband_gray" },
  haenam_engine_hat_wrench_red: { hatAssetKey: "hat_wrench_headband_red" },
  haenam_engine_hat_wrench_star: { hatAssetKey: "hat_wrench_headband_star" },
  haenyeo_hat_sailor_bow: { hatAssetKey: "hat_sailor_bow" },
  haenyeo_hat_straw: { hatAssetKey: "hat_straw" },
  haenyeo_hat_bow_headband_navy: { hatAssetKey: "hat_bow_headband_navy" },
  haenyeo_hat_bow_headband_small: { hatAssetKey: "hat_bow_headband_small" },
  haenyeo_hat_bow_headband_floral: { hatAssetKey: "hat_bow_headband_floral" },
  haenyeo_hat_anchor_clip_1: { hatAssetKey: "hat_anchor_clip_1" },
  haenyeo_hat_anchor_clip_2: { hatAssetKey: "hat_anchor_clip_2" },
  haenyeo_hat_shell_clip: { hatAssetKey: "hat_shell_clip" },
  haenyeo_hat_starfish_clip: { hatAssetKey: "hat_starfish_clip" },
  haenyeo_hat_daisy_clip: { hatAssetKey: "hat_daisy_clip" },
  haenyeo_hat_shell_cluster_clip: { hatAssetKey: "hat_shell_cluster_clip" },
  haenyeo_hat_bow_clip_navy: { hatAssetKey: "hat_bow_clip_navy" },
  // 손소품 10종 (0018_hand_accessory_pack) — "손소품 렌더 슬롯 신설" 때 인프라만 만들고
  // 미뤄뒀던 나머지 13종 중, 손에 드는 10종만 이번에 연결(목에 거는 반다나/보타이 3종은
  // 별도 anchor가 필요해 제외). AccessoryStyle("wrench"|"tablet"|"none")은 구버전 벡터
  // 폴백 전용 고정 유니온이라 이 10종은 대응하는 벡터 그림이 없음 — 모자 21종 때와 같은
  // 이유로 accessory 필드는 건드리지 않고 handAssetKey만 연결한다.
  haenam_deck_acc_binoculars: { handAssetKey: "hand_binoculars" },
  haenam_deck_acc_life_ring: { handAssetKey: "hand_life_ring_bag" },
  haenyeo_acc_shell_purse: { handAssetKey: "hand_shell_purse" },
  haenam_engine_acc_walkie: { handAssetKey: "hand_walkie_talkie" },
  haenam_engine_acc_lantern: { handAssetKey: "hand_lantern" },
  haenam_deck_acc_canteen: { handAssetKey: "hand_canteen" },
  haenyeo_acc_rope_bracelet: { handAssetKey: "hand_rope_bracelet" },
  haenyeo_acc_satchel: { handAssetKey: "hand_satchel_bag" },
  haenam_deck_acc_scroll: { handAssetKey: "hand_scroll" },
  haenam_deck_acc_compass: { handAssetKey: "hand_compass" },
  // 목 소품 3종(0020_neck_accessory_pack) — 손소품과 별개인 neckAssetKey 슬롯(목선 anchor)에
  // 연결. 우산/인형은 슬롯이 없는 소품이지만 손에 드는 물건이라 기존 handAssetKey 슬롯을
  // 그대로 재사용, 선글라스는 고글류와 같은 hatAssetKey 슬롯을 재사용(새 슬롯 발명 안 함).
  // 우산/인형/선글라스는 design-assets/캐릭터 의상 (7).png(새싹 옷 시트)에서 나온 소품이라
  // subcategory를 'child'로 뒀다.
  haenam_deck_acc_bandana_blue: { neckAssetKey: "neck_bandana_blue" },
  haenyeo_acc_bandana_red: { neckAssetKey: "neck_bandana_red" },
  haenam_engine_acc_bow_tie: { neckAssetKey: "neck_bow_tie_navy" },
  child_acc_umbrella: { handAssetKey: "hand_umbrella" },
  child_acc_doll: { handAssetKey: "hand_doll" },
  child_acc_sunglasses: { hatAssetKey: "hat_sunglasses" },
  // 해남 헤어 4종 — 해녀 헤어(haenyeo_hair_*)는 이미 있었는데 해남 쪽은 옷가게에 등록된 적이
  // 없었다(옷가게 헤어 탭 자체가 없었음). 부서(항해사/기관사)에 따라 옷은 다르지만 헤어스타일
  // 자체는 부서와 무관(HAIR_STYLE_INDEX.haenam 기준)하므로, 두 부서 캐릭터 모두 살 수 있게
  // subcategory만 다른 동일 스타일을 haenam_deck/haenam_engine 두 벌로 등록한다.
  haenam_deck_hair_short_neat: { hairStyle: "short_neat" },
  haenam_deck_hair_buzz: { hairStyle: "buzz" },
  haenam_deck_hair_sideswept: { hairStyle: "sideswept" },
  haenam_deck_hair_bob: { hairStyle: "bob" },
  haenam_engine_hair_short_neat: { hairStyle: "short_neat" },
  haenam_engine_hair_buzz: { hairStyle: "buzz" },
  haenam_engine_hair_sideswept: { hairStyle: "sideswept" },
  haenam_engine_hair_bob: { hairStyle: "bob" },
  // 새싹 헤어 3종 — CHILD_HAIR_STYLES(단발/트윈테일/포니테일)와 동일(올림머리는 실제 그림
  // 자산이 없어 애초에 선택지에서 빠져 있음, docs/PROGRESS.md 참고).
  child_hair_bob: { hairStyle: "bob" },
  child_hair_twin: { hairStyle: "twin" },
  child_hair_pony: { hairStyle: "pony" },
  // "한 벌 의상" 옷장 확장(0024 마이그레이션) — 이미 정규화돼 있었지만 상품으로 등록된
  // 적 없던 outfit_full/dress_full 46개 + 새로 크롭·정규화한 24개(design-assets/
  // "기관사 항해사 해남이 의상 (2).png", 기존 20종과 다른 신규 세트). 상의/하의/신발이
  // 이미 하나로 합쳐진 전신 스프라이트라 outfitAssetKey 하나만 연결하면 끝난다. 반대쪽
  // 경로(fullPortraitKey)는 항상 null로 같이 명시해 원피스→오버롤처럼 렌더링 경로가
  // 바뀌는 착용 전환에서 이전 값이 안 지워지고 남는 버그를 막는다(위 haenyeo_outfit_overalls
  // 주석 참고).
  haenyeo_outfit_sailor: { outfitAssetKey: "haenyeo_outfit_01", fullPortraitKey: null },
  haenyeo_outfit_floral: { outfitAssetKey: "haenyeo_outfit_03", fullPortraitKey: null },
  haenyeo_outfit_mint_cardigan: { outfitAssetKey: "haenyeo_outfit_04", fullPortraitKey: null },
  haenyeo_outfit_navy_skirt: { outfitAssetKey: "haenyeo_outfit_05", fullPortraitKey: null },
  haenyeo_outfit_flower_skirt: { outfitAssetKey: "haenyeo_outfit_07", fullPortraitKey: null },
  haenyeo_outfit_duck_raincoat: { outfitAssetKey: "haenyeo_outfit_08", fullPortraitKey: null },
  haenyeo_outfit_pink_bear: { outfitAssetKey: "haenyeo_outfit_09", fullPortraitKey: null },
  haenyeo_outfit_autumn_coat: { outfitAssetKey: "haenyeo_outfit_10", fullPortraitKey: null },
  haenyeo_outfit_navy_crossbag: { outfitAssetKey: "haenyeo_outfit_11", fullPortraitKey: null },
  haenyeo_outfit_scuba: { outfitAssetKey: "haenyeo_outfit_12", fullPortraitKey: null },
  haenyeo_outfit_bear_check: { outfitAssetKey: "haenyeo_outfit_13", fullPortraitKey: null },
  haenyeo_outfit_resort_bikini: { outfitAssetKey: "haenyeo_outfit_14", fullPortraitKey: null },
  haenyeo_outfit_pink_bear_dress: { outfitAssetKey: "haenyeo_outfit_15", fullPortraitKey: null },
  haenyeo_outfit_denim_jacket_dress: { outfitAssetKey: "haenyeo_outfit_16", fullPortraitKey: null },
  haenyeo_outfit_apron: { outfitAssetKey: "haenyeo_outfit_18", fullPortraitKey: null },
  haenyeo_outfit_pink_coat: { outfitAssetKey: "haenyeo_outfit_20", fullPortraitKey: null },
  // 해녀 원피스(캐릭터 의상 (1).png 시트) — fullPortraitKey 경로(얼굴까지 포함된 완성
  // 전신 그림)라 outfitAssetKey 대신 이쪽을 쓴다. 기존 haenyeo_outfit_dress와 같은 패턴.
  haenyeo_dress_sailor_mini: { outfit: "dress", outfitColor: "#f2b8c6", fullPortraitKey: "haenyeo_dress_01", outfitAssetKey: null },
  haenyeo_dress_coral_cardigan: { outfit: "dress", outfitColor: "#f2b8c6", fullPortraitKey: "haenyeo_dress_03", outfitAssetKey: null },
  haenyeo_dress_lavender_shirt: { outfit: "dress", outfitColor: "#f2b8c6", fullPortraitKey: "haenyeo_dress_04", outfitAssetKey: null },
  haenyeo_dress_coral_slip: { outfit: "dress", outfitColor: "#f2b8c6", fullPortraitKey: "haenyeo_dress_05", outfitAssetKey: null },
  haenyeo_dress_yellow_check: { outfit: "dress", outfitColor: "#f2b8c6", fullPortraitKey: "haenyeo_dress_06", outfitAssetKey: null },
  haenyeo_dress_white_lace: { outfit: "dress", outfitColor: "#f2b8c6", fullPortraitKey: "haenyeo_dress_07", outfitAssetKey: null },
  haenyeo_dress_beige_dot: { outfit: "dress", outfitColor: "#f2b8c6", fullPortraitKey: "haenyeo_dress_08", outfitAssetKey: null },
  haenyeo_dress_coral_shirt: { outfit: "dress", outfitColor: "#f2b8c6", fullPortraitKey: "haenyeo_dress_09", outfitAssetKey: null },
  haenam_deck_outfit_shirt_white: { outfitAssetKey: "haenam_deck_outfit_01", fullPortraitKey: null },
  haenam_deck_outfit_knit_sweater: { outfitAssetKey: "haenam_deck_outfit_03", fullPortraitKey: null },
  haenam_deck_outfit_denim_jacket: { outfitAssetKey: "haenam_deck_outfit_05", fullPortraitKey: null },
  haenam_deck_outfit_tee_shorts: { outfitAssetKey: "haenam_deck_outfit_06", fullPortraitKey: null },
  haenam_deck_outfit_hoodie_jogger: { outfitAssetKey: "haenam_deck_outfit_07", fullPortraitKey: null },
  haenam_deck_outfit_overfit_shirt: { outfitAssetKey: "haenam_deck_outfit_09", fullPortraitKey: null },
  haenam_deck_outfit_homewear: { outfitAssetKey: "haenam_deck_outfit_10", fullPortraitKey: null },
  haenam_deck_outfit_captain: { outfitAssetKey: "haenam_deck_outfit_11", fullPortraitKey: null },
  haenam_deck_outfit_uniform_map: { outfitAssetKey: "haenam_deck_outfit_12", fullPortraitKey: null },
  haenam_deck_outfit_sweater_camera: { outfitAssetKey: "haenam_deck_outfit_13", fullPortraitKey: null },
  haenam_deck_outfit_sunglasses_casual: { outfitAssetKey: "haenam_deck_outfit_14", fullPortraitKey: null },
  haenam_deck_outfit_yellow_raincoat: { outfitAssetKey: "haenam_deck_outfit_15", fullPortraitKey: null },
  haenam_deck_outfit_red_safety_vest: { outfitAssetKey: "haenam_deck_outfit_16", fullPortraitKey: null },
  haenam_deck_outfit_ocean_hoodie: { outfitAssetKey: "haenam_deck_outfit_17", fullPortraitKey: null },
  haenam_deck_outfit_hoodie_crossbag: { outfitAssetKey: "haenam_deck_outfit_18", fullPortraitKey: null },
  haenam_deck_outfit_trench_coffee: { outfitAssetKey: "haenam_deck_outfit_19", fullPortraitKey: null },
  haenam_deck_outfit_hawaiian_shirt: { outfitAssetKey: "haenam_deck_outfit_20", fullPortraitKey: null },
  haenam_deck_outfit_dolphin_pajama: { outfitAssetKey: "haenam_deck_outfit_21", fullPortraitKey: null },
  haenam_deck_outfit_scarf_coat: { outfitAssetKey: "haenam_deck_outfit_22", fullPortraitKey: null },
  haenam_engine_outfit_tee_navy: { outfitAssetKey: "haenam_engine_outfit_02", fullPortraitKey: null },
  haenam_engine_outfit_tee_workpants: { outfitAssetKey: "haenam_engine_outfit_04", fullPortraitKey: null },
  haenam_engine_outfit_hoodie_casual: { outfitAssetKey: "haenam_engine_outfit_05", fullPortraitKey: null },
  haenam_engine_outfit_overalls_denim: { outfitAssetKey: "haenam_engine_outfit_06", fullPortraitKey: null },
  haenam_engine_outfit_sweatshirt: { outfitAssetKey: "haenam_engine_outfit_07", fullPortraitKey: null },
  haenam_engine_outfit_sport: { outfitAssetKey: "haenam_engine_outfit_08", fullPortraitKey: null },
  haenam_engine_outfit_pajama_check: { outfitAssetKey: "haenam_engine_outfit_09", fullPortraitKey: null },
  haenam_engine_outfit_winter_padding: { outfitAssetKey: "haenam_engine_outfit_10", fullPortraitKey: null },
  haenam_engine_outfit_safety_orange: { outfitAssetKey: "haenam_engine_outfit_11", fullPortraitKey: null },
  haenam_engine_outfit_toolbelt: { outfitAssetKey: "haenam_engine_outfit_12", fullPortraitKey: null },
  haenam_engine_outfit_towel_gloves: { outfitAssetKey: "haenam_engine_outfit_13", fullPortraitKey: null },
  haenam_engine_outfit_mug_casual: { outfitAssetKey: "haenam_engine_outfit_14", fullPortraitKey: null },
  haenam_engine_outfit_headphones_hoodie: { outfitAssetKey: "haenam_engine_outfit_15", fullPortraitKey: null },
  haenam_engine_outfit_engineroom_hoodie: { outfitAssetKey: "haenam_engine_outfit_16", fullPortraitKey: null },
  haenam_engine_outfit_tank_wrench: { outfitAssetKey: "haenam_engine_outfit_17", fullPortraitKey: null },
  haenam_engine_outfit_tablet_shirt: { outfitAssetKey: "haenam_engine_outfit_18", fullPortraitKey: null },
  haenam_engine_outfit_snorkel_tank: { outfitAssetKey: "haenam_engine_outfit_19", fullPortraitKey: null },
  haenam_engine_outfit_long_padding: { outfitAssetKey: "haenam_engine_outfit_20", fullPortraitKey: null },
  haenam_engine_outfit_cloud_pajama: { outfitAssetKey: "haenam_engine_outfit_21", fullPortraitKey: null },
  haenam_engine_outfit_overalls_skewer: { outfitAssetKey: "haenam_engine_outfit_22", fullPortraitKey: null },
  // 새싹 의상 7종 — 3개 시안(기관사 항해사 해남이 의상/해녀 의상/캐릭터 의상)에는 없는
  // 별도 새싹 시트에서 나온 것이지만, outfit_full/child_outfit_*가 이미 정규화돼 있었는데도
  // 3벌(overalls/dress/hoodie)만 등록돼 있었던 김에 같이 정리한다.
  child_outfit_cream_romper: { outfitAssetKey: "child_outfit_01", fullPortraitKey: null },
  child_outfit_blue_shirt_bag: { outfitAssetKey: "child_outfit_03", fullPortraitKey: null },
  child_outfit_white_green_set: { outfitAssetKey: "child_outfit_06", fullPortraitKey: null },
  child_outfit_stripe_set: { outfitAssetKey: "child_outfit_07", fullPortraitKey: null },
  child_outfit_yellow_raincoat: { outfitAssetKey: "child_outfit_08", fullPortraitKey: null },
  child_outfit_blue_pajama: { outfitAssetKey: "child_outfit_09", fullPortraitKey: null },
  child_outfit_winter_coat_scarf: { outfitAssetKey: "child_outfit_10", fullPortraitKey: null },
};

export const CATEGORY_TO_SLOT: Record<string, EquipSlot> = {
  hair: "hair",
  outfit: "outfit",
  hat: "hat",
  accessory: "accessory",
};
