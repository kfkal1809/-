export const SKIN_SWATCHES = ["#ffe9d9", "#ffe3cf", "#ffd9bc"];
export const HAIR_SWATCHES = ["#3b2f28", "#5b4433", "#6b4a35", "#8a5a3c", "#a9754a"];
export const HAENYEO_HAIR_STYLES = ["wave", "pony", "bob", "twin", "bun"] as const;
export const HAENAM_HAIR_STYLES = ["short_neat", "buzz", "sideswept", "bob"] as const;
export const CHILD_HAIR_STYLES = ["bob", "twin", "pony", "bun"] as const;

export const HAENYEO_OUTFIT_SWATCHES = ["#7fa8dd", "#9cc9ef", "#a7d8c9", "#f2b8c6"];
export const HAENAM_DECK_OUTFIT_SWATCHES = ["#2c3f66", "#3a5a8c", "#24365a"];
export const HAENAM_ENGINE_OUTFIT_SWATCHES = ["#ff9a4d", "#ffb066", "#ff8a6b"];
export const CHILD_OUTFIT_SWATCHES = ["#ffc9a8", "#a7d8c9", "#f2b8c6", "#cfe6ff"];

// 의상 컬러 스와치를 고르면 실사 일러스트에서는 색만 물드는 게 아니라 실제로 다른 디자인의
// 정규화된 전신 의상 스프라이트로 바뀐다(각 색상에 어울리는 의상을 하나씩 배정) — CharacterFullBody 참고.
export const HAENYEO_OUTFIT_ASSET_BY_SWATCH: Record<string, string> = {
  "#7fa8dd": "haenyeo_outfit_02",
  "#9cc9ef": "haenyeo_outfit_17",
  "#a7d8c9": "haenyeo_outfit_04",
  "#f2b8c6": "haenyeo_outfit_19",
};
export const HAENAM_DECK_OUTFIT_ASSET_BY_SWATCH: Record<string, string> = {
  "#2c3f66": "haenam_deck_outfit_04",
  "#3a5a8c": "haenam_deck_outfit_08",
  "#24365a": "haenam_deck_outfit_02",
};
export const HAENAM_ENGINE_OUTFIT_ASSET_BY_SWATCH: Record<string, string> = {
  "#ff9a4d": "haenam_engine_outfit_01",
  "#ffb066": "haenam_engine_outfit_04",
  "#ff8a6b": "haenam_engine_outfit_10",
};
export const CHILD_OUTFIT_ASSET_BY_SWATCH: Record<string, string> = {
  "#ffc9a8": "child_outfit_02",
  "#a7d8c9": "child_outfit_05",
  "#f2b8c6": "child_outfit_04",
  "#cfe6ff": "child_outfit_07",
};
