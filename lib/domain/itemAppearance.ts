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
};

export const CATEGORY_TO_SLOT: Record<string, EquipSlot> = {
  hair: "hair",
  outfit: "outfit",
  hat: "hat",
  accessory: "accessory",
};
