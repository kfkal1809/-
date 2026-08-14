import type { CharacterAppearance } from "@/lib/domain/characterPresets";

export type EquipSlot = "hair" | "outfit" | "hat" | "accessory";

// 카탈로그 SKU → 실제 렌더링에 적용할 외형 패치. 착용 시 이 패치를 characters.appearance_json에 병합한다.
export const ITEM_APPEARANCE_PATCH: Record<string, Partial<CharacterAppearance>> = {
  // 해녀 옷
  haenyeo_outfit_overalls: { outfit: "haenyeo_overalls" },
  haenyeo_outfit_dress: { outfit: "dress", outfitColor: "#f2b8c6" },
  haenyeo_outfit_sweatshirt: { outfit: "sweatshirt", outfitColor: "#e9d9c3" },
  haenyeo_outfit_pajama: { outfit: "pajama", outfitColor: "#cfe0ff" },
  // 해녀 헤어
  haenyeo_hair_wave: { hairStyle: "wave" },
  haenyeo_hair_pony: { hairStyle: "pony" },
  haenyeo_hair_bob: { hairStyle: "bob" },
  haenyeo_hair_twin: { hairStyle: "twin" },
  haenyeo_hair_bun: { hairStyle: "bun" },
  // 해남 항해사
  haenam_deck_outfit_uniform: { outfit: "haenam_deck_uniform", outfitColor: "#2c3f66" },
  haenam_deck_hat_cap: { hat: "captain" },
  haenam_deck_outfit_casual: { outfit: "sweatshirt", outfitColor: "#7fa8dd" },
  haenam_deck_outfit_shirt: { outfit: "haenam_deck_uniform", outfitColor: "#3a5a8c" },
  // 해남 기관사
  haenam_engine_outfit_overalls: { outfit: "haenam_engine_overalls" },
  haenam_engine_acc_wrench: { accessory: "wrench" },
  haenam_engine_hat_helmet: { hat: "hardhat" },
  haenam_engine_outfit_casual: { outfit: "sweatshirt", outfitColor: "#ff9a4d" },
  // 새싹
  child_outfit_overalls: { outfit: "child_overalls" },
  child_outfit_dress: { outfit: "dress", outfitColor: "#f2b8c6" },
  child_outfit_hoodie: { outfit: "hoodie", outfitColor: "#a7d8c9" },
};

export const CATEGORY_TO_SLOT: Record<string, EquipSlot> = {
  hair: "hair",
  outfit: "outfit",
  hat: "hat",
  accessory: "accessory",
};
