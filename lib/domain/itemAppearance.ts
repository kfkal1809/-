import type { CharacterAppearance } from "@/lib/domain/characterPresets";

export type EquipSlot = "hair" | "outfit" | "hat" | "accessory";

// 카탈로그 SKU → 실제 렌더링에 적용할 외형 패치. 착용 시 이 패치를 characters.appearance_json에 병합한다.
// outfitAssetKey: public/images/character/outfit_full/<key>.png — 목 아래 전신 실루엣을 통째로
// 교체하는 실사 일러스트 키(scripts/normalize_outfits.py로 50장을 공통 캔버스에 정규화한 것 중
// 하나를 항목별로 골라 연결). outfit/outfitColor는 여전히 구버전 SVG 폴백용으로 유지.
export const ITEM_APPEARANCE_PATCH: Record<string, Partial<CharacterAppearance>> = {
  // 해녀 옷
  haenyeo_outfit_overalls: { outfit: "haenyeo_overalls", outfitAssetKey: "haenyeo_outfit_02" },
  haenyeo_outfit_dress: { outfit: "dress", outfitColor: "#f2b8c6", outfitAssetKey: "haenyeo_outfit_17", fullPortraitKey: "haenyeo_dress_02" },
  haenyeo_outfit_sweatshirt: { outfit: "sweatshirt", outfitColor: "#e9d9c3", outfitAssetKey: "haenyeo_outfit_06" },
  haenyeo_outfit_pajama: { outfit: "pajama", outfitColor: "#cfe0ff", outfitAssetKey: "haenyeo_outfit_19" },
  // 해녀 헤어
  haenyeo_hair_wave: { hairStyle: "wave" },
  haenyeo_hair_pony: { hairStyle: "pony" },
  haenyeo_hair_bob: { hairStyle: "bob" },
  haenyeo_hair_twin: { hairStyle: "twin" },
  haenyeo_hair_bun: { hairStyle: "bun" },
  // 해남 항해사
  haenam_deck_outfit_uniform: { outfit: "haenam_deck_uniform", outfitColor: "#2c3f66", outfitAssetKey: "haenam_deck_outfit_04" },
  haenam_deck_hat_cap: { hat: "captain", hatAssetKey: "hat_captain" },
  haenam_deck_outfit_casual: { outfit: "sweatshirt", outfitColor: "#7fa8dd", outfitAssetKey: "haenam_deck_outfit_02" },
  haenam_deck_outfit_shirt: { outfit: "haenam_deck_uniform", outfitColor: "#3a5a8c", outfitAssetKey: "haenam_deck_outfit_08" },
  // 해남 기관사
  haenam_engine_outfit_overalls: { outfit: "haenam_engine_overalls", outfitAssetKey: "haenam_engine_outfit_01" },
  haenam_engine_acc_wrench: { accessory: "wrench", handAssetKey: "hand_tool_pouch" },
  haenam_engine_hat_helmet: { hat: "hardhat", hatAssetKey: "hat_hardhat" },
  haenam_engine_outfit_casual: { outfit: "sweatshirt", outfitColor: "#ff9a4d", outfitAssetKey: "haenam_engine_outfit_03" },
  // 새싹
  child_outfit_overalls: { outfit: "child_overalls", outfitAssetKey: "child_outfit_02" },
  child_outfit_dress: { outfit: "dress", outfitColor: "#f2b8c6", outfitAssetKey: "child_outfit_04" },
  child_outfit_hoodie: { outfit: "hoodie", outfitColor: "#a7d8c9", outfitAssetKey: "child_outfit_05" },
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
};

export const CATEGORY_TO_SLOT: Record<string, EquipSlot> = {
  hair: "hair",
  outfit: "outfit",
  hat: "hat",
  accessory: "accessory",
};
