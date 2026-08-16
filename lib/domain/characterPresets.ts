// 캐릭터 프리셋 — 기획서 1.9/1.11 아트 디렉션 기준
// 2.3~2.5등신, 아주 작은 점눈, 옅은 홍조, 맑은 파스텔. 해녀는 잠수복 대신 평범한 일상복.

export type HairStyle = "wave" | "pony" | "bob" | "twin" | "bun" | "short_neat" | "buzz" | "sideswept";
export type OutfitStyle =
  | "haenyeo_overalls"
  | "haenam_deck_uniform"
  | "haenam_engine_overalls"
  | "child_overalls"
  | "chef"
  | "cardigan"
  | "tank"
  | "dress"
  | "sweatshirt"
  | "pajama"
  | "hoodie";
export type HatStyle = "captain" | "chef" | "hardhat" | "none";
export type AccessoryStyle = "wrench" | "tablet" | "none";

export interface CharacterAppearance {
  skinTone: string;
  hairColor: string;
  hairStyle: HairStyle;
  outfit: OutfitStyle;
  outfitColor: string;
  outfitAccent: string;
  hat: HatStyle;
  accessory: AccessoryStyle;
  eyelash: boolean;
  eyeScale: number; // 1 = 기본, 아랍처럼 눈이 더 큰 경우 1.3
  bodyScale: number; // 새싹은 더 작게
  toned: boolean; // 리리처럼 팔뚝에 살짝 근육 표현
  // 실사 일러스트(kind가 있는 CharacterSprite) 전용: 목 아래 전신 의상 스프라이트 키.
  // public/images/character/outfit_full/<key>.png — 없으면 기존 색상 틴트 방식으로 폴백.
  outfitAssetKey?: string | null;
}

const BASE: CharacterAppearance = {
  skinTone: "#ffe3cf",
  hairColor: "#5b4433",
  hairStyle: "bob",
  outfit: "haenyeo_overalls",
  outfitColor: "#7fb2e0",
  outfitAccent: "#ffffff",
  hat: "none",
  accessory: "none",
  eyelash: false,
  eyeScale: 1,
  bodyScale: 1,
  toned: false,
  outfitAssetKey: null,
};

export function haenyeoPreset(overrides: Partial<CharacterAppearance> = {}): CharacterAppearance {
  return {
    ...BASE,
    hairColor: "#6b4a35",
    hairStyle: "wave",
    outfit: "haenyeo_overalls",
    outfitColor: "#7fa8dd",
    outfitAccent: "#ffffff",
    eyelash: true,
    outfitAssetKey: "haenyeo_outfit_02",
    ...overrides,
  };
}

export function haenamDeckPreset(overrides: Partial<CharacterAppearance> = {}): CharacterAppearance {
  return {
    ...BASE,
    skinTone: "#ffdcc4",
    hairColor: "#3b2f28",
    hairStyle: "short_neat",
    outfit: "haenam_deck_uniform",
    outfitColor: "#2c3f66",
    outfitAccent: "#ffffff",
    hat: "captain",
    outfitAssetKey: "haenam_deck_outfit_04",
    ...overrides,
  };
}

export function haenamEnginePreset(overrides: Partial<CharacterAppearance> = {}): CharacterAppearance {
  return {
    ...BASE,
    skinTone: "#ffd9bf",
    hairColor: "#2c2420",
    hairStyle: "buzz",
    outfit: "haenam_engine_overalls",
    outfitColor: "#ff9a4d",
    outfitAccent: "#3b2f28",
    accessory: "wrench",
    outfitAssetKey: "haenam_engine_outfit_01",
    ...overrides,
  };
}

export function childPreset(overrides: Partial<CharacterAppearance> = {}): CharacterAppearance {
  return {
    ...BASE,
    hairColor: "#7a5a41",
    hairStyle: "twin",
    outfit: "child_overalls",
    outfitColor: "#ffc9a8",
    outfitAccent: "#ffffff",
    bodyScale: 0.86,
    eyelash: false,
    outfitAssetKey: "child_outfit_02",
    ...overrides,
  };
}

// =========================================================
// NPC 프리셋 (1.11) — "NPC" 배지는 어디에도 표시하지 않는다
// =========================================================
export const NPC_APPEARANCE: Record<string, CharacterAppearance> = {
  arab: {
    ...BASE,
    skinTone: "#ffe1cb",
    hairColor: "#2b2420",
    hairStyle: "short_neat",
    outfit: "haenam_deck_uniform",
    outfitColor: "#3a5a8c",
    outfitAccent: "#f4f8ff",
    accessory: "tablet",
    eyeScale: 1.35,
  },
  dubu: {
    ...BASE,
    skinTone: "#ffe9d9",
    hairColor: "#4a3626",
    hairStyle: "bob",
    outfit: "chef",
    outfitColor: "#ffffff",
    outfitAccent: "#ff9a8b",
    hat: "chef",
    eyeScale: 1.05,
  },
  mami: {
    ...BASE,
    skinTone: "#ffe3cf",
    hairColor: "#6b4a35",
    hairStyle: "bun",
    outfit: "cardigan",
    outfitColor: "#f4c978",
    outfitAccent: "#8fe3c6",
  },
  liri: {
    ...BASE,
    skinTone: "#ffd9bc",
    hairColor: "#382a22",
    hairStyle: "pony",
    outfit: "tank",
    outfitColor: "#ff9a8b",
    outfitAccent: "#fff2ea",
    toned: true,
  },
};
