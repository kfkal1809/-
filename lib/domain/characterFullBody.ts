import type { CharacterPortraitKey } from "@/lib/domain/characterPortrait";
import { characterPortraitKeyFor } from "@/lib/domain/characterPortrait";

// 목 아래(의상) 전신 스프라이트 정규화 캔버스 — scripts/normalize-outfits.py 참고.
// 모든 outfit_full/*.png는 이 캔버스 크기로 저장되어 있고, 목선(collar)이 항상 NECK_Y에 온다.
export const OUTFIT_CANVAS_W = 420;
export const OUTFIT_CANVAS_H = 512;
export const NECK_Y = 140;

// 얼굴/헤어(목 위)는 모든 의상에 대해 같은 위치에 고정 배치된다 — "공통 anchor".
export const HEAD_WIDTH = 190;
export const HEAD_OVERLAP = 10;

// 머리 이미지는 목선(NECK_Y)보다 위로 올라가는 만큼 OUTFIT_CANVAS 상단을 벗어난다(해녀 기준
// 최대 ~84px 초과). 이 여유를 안 두면 렌더링 컨테이너 높이(size)가 실제 화면에 그려지는
// 키(머리~발끝)보다 작아져서, size가 같아도 outfitAssetKey 캐릭터가 fullPortraitKey/기존
// 단일 이미지 캐릭터보다 눈에 띄게 커 보이는 버그가 생긴다 — 그래서 컨테이너 높이 계산에
// 이 마진을 항상 포함시켜 "size = 머리~발끝 실제 높이"가 모든 렌더링 방식에서 똑같이
// 성립하도록 한다.
export const HEAD_MARGIN_TOP = 90;

// 해남/해녀를 같은 세계관 스케일로 맞추되, 해녀가 살짝 더 작아 보이도록 하는 키 보정.
// 발 기준선(바닥)은 그대로 두고 위쪽만 줄어들도록 렌더링 쪽에서 하단 정렬로 적용한다
// (CharacterSprite 참고) — 의상도 체형과 한 장으로 묶인 스프라이트라 자동으로 같이 줄어든다.
export const HEIGHT_SCALE_BY_KIND: Record<string, number> = {
  haenyeo: 0.94,
  haenam: 1,
  child: 1,
};

// public/images/character/base/head/*.png 실측 크기(스크립트로 생성, 8종 고정값).
export const HEAD_SIZE: Record<string, { w: number; h: number }> = {
  haenyeo: { w: 346, h: 425 },
  haenam: { w: 384, h: 354 },
  child_toddler_male: { w: 398, h: 421 },
  child_toddler_female: { w: 441, h: 391 },
  child_kindergarten_male: { w: 429, h: 429 },
  child_kindergarten_female: { w: 418, h: 331 },
  child_elementary_male: { w: 400, h: 410 },
  child_elementary_female: { w: 396, h: 373 },
};

export function headSrc(key: CharacterPortraitKey): string {
  return `/images/character/base/head/${characterPortraitKeyFor(key)}.png`;
}

// public/images/character/hats/*.png 실측 크기(design-assets/모자 소품.png에서 크롭).
export const HAT_SIZE: Record<string, { w: number; h: number }> = {
  hat_captain: { w: 284, h: 169 },
  hat_hardhat: { w: 251, h: 203 },
  hat_sailor_cap: { w: 300, h: 209 },
  hat_sailor_bow: { w: 267, h: 231 },
  hat_bucket: { w: 290, h: 177 },
  hat_straw: { w: 300, h: 197 },
  hat_aviator_white: { w: 245, h: 200 },
  hat_aviator_blue: { w: 252, h: 197 },
  hat_goggles_brown: { w: 269, h: 112 },
  hat_goggles_red: { w: 245, h: 146 },
  hat_wrench_headband_gray: { w: 192, h: 174 },
  hat_wrench_headband_red: { w: 199, h: 174 },
  hat_wrench_headband_star: { w: 198, h: 181 },
  hat_bow_headband_navy: { w: 226, h: 150 },
  hat_bow_headband_small: { w: 207, h: 168 },
  hat_bow_headband_floral: { w: 218, h: 188 },
  hat_anchor_clip_1: { w: 167, h: 128 },
  hat_anchor_clip_2: { w: 160, h: 112 },
  hat_shell_clip: { w: 165, h: 93 },
  hat_starfish_clip: { w: 167, h: 103 },
  hat_daisy_clip: { w: 157, h: 109 },
  hat_shell_cluster_clip: { w: 176, h: 96 },
  hat_bow_clip_navy: { w: 171, h: 127 },
};

export function hatSrc(key: string): string {
  return `/images/character/hats/${key}.png`;
}

// 모자별 배치값 — widthFrac: 렌더된 머리 폭(headRenderW) 대비 모자 폭 비율.
// bottomFrac: 머리 렌더 높이(headRenderH) 대비, 머리 top에서 얼마나 내려온 지점에 모자
// 밑단을 맞출지(앞머리와 자연스럽게 겹치도록 살짝 내려서 얹음, 고글류는 이 값을 크게 잡아
// 눈높이 부근까지 내림). offsetXFrac(선택, 기본 0): 헤어핀처럼 정중앙이 아니라 옆으로
// 치우쳐 꽂는 소품 전용 — 렌더된 머리 폭 대비 좌우 이동량(양수 = 오른쪽). 라이브 브라우저로
// 캡틴모자/안전모/손소품 3종만 실제 확인했고, 나머지 21종은 같은 공식으로 어림값만 잡았다 —
// 실제로 보면서 미세조정 필요할 수 있음(정직하게 기록).
export const HAT_PLACEMENT: Record<string, { widthFrac: number; bottomFrac: number; offsetXFrac?: number }> = {
  hat_captain: { widthFrac: 1.08, bottomFrac: 0.34 },
  hat_hardhat: { widthFrac: 0.96, bottomFrac: 0.4 },
  hat_sailor_cap: { widthFrac: 1.02, bottomFrac: 0.34 },
  hat_sailor_bow: { widthFrac: 1.0, bottomFrac: 0.34 },
  hat_bucket: { widthFrac: 1.05, bottomFrac: 0.36 },
  hat_straw: { widthFrac: 1.15, bottomFrac: 0.32 },
  hat_aviator_white: { widthFrac: 0.95, bottomFrac: 0.42 },
  hat_aviator_blue: { widthFrac: 0.95, bottomFrac: 0.42 },
  hat_goggles_brown: { widthFrac: 0.85, bottomFrac: 0.58 },
  hat_goggles_red: { widthFrac: 0.8, bottomFrac: 0.58 },
  hat_wrench_headband_gray: { widthFrac: 0.85, bottomFrac: 0.3 },
  hat_wrench_headband_red: { widthFrac: 0.85, bottomFrac: 0.3 },
  hat_wrench_headband_star: { widthFrac: 0.85, bottomFrac: 0.3 },
  hat_bow_headband_navy: { widthFrac: 0.8, bottomFrac: 0.28 },
  hat_bow_headband_small: { widthFrac: 0.8, bottomFrac: 0.28 },
  hat_bow_headband_floral: { widthFrac: 0.8, bottomFrac: 0.28 },
  hat_anchor_clip_1: { widthFrac: 0.4, bottomFrac: 0.5, offsetXFrac: 0.35 },
  hat_anchor_clip_2: { widthFrac: 0.4, bottomFrac: 0.5, offsetXFrac: -0.35 },
  hat_shell_clip: { widthFrac: 0.4, bottomFrac: 0.5, offsetXFrac: 0.35 },
  hat_starfish_clip: { widthFrac: 0.4, bottomFrac: 0.5, offsetXFrac: -0.35 },
  hat_daisy_clip: { widthFrac: 0.4, bottomFrac: 0.5, offsetXFrac: 0.35 },
  hat_shell_cluster_clip: { widthFrac: 0.42, bottomFrac: 0.5, offsetXFrac: -0.35 },
  hat_bow_clip_navy: { widthFrac: 0.45, bottomFrac: 0.5, offsetXFrac: 0.35 },
};

// public/images/character/hand_accessories/*.png 실측 크기(design-assets/모자 소품.png에서 크롭).
// 손소품은 머리처럼 별도 레이어가 없는 outfit_full 그림 위에 얹으므로, 모든 의상이 공유하는
// 팔 늘어뜨린 기본 포즈에서 "오른손 부근" 한 점(HAND_ACCESSORY_ANCHOR, OUTFIT_CANVAS 좌표계)에
// 고정 앵커링한다 — 실측: haenam_engine_outfit_01 기준 오른손 중심 약 (310, 300).
export const HAND_SIZE: Record<string, { w: number; h: number }> = {
  hand_tool_pouch: { w: 217, h: 192 },
};

export const HAND_ACCESSORY_ANCHOR = { x: 310, y: 300 };

// 소품별 배치값 — widthFrac: OUTFIT_CANVAS_W 대비 소품 폭 비율. anchorX/anchorY: 소품 이미지
// 안에서 HAND_ACCESSORY_ANCHOR 점에 맞출 상대 위치(0~1, 손잡이 부분 등). 라이브 브라우저로
// 픽셀 단위까지 검증하지 못해 어림값 — 실제로 보면서 미세조정 필요할 수 있음(정직하게 기록).
export const HAND_PLACEMENT: Record<string, { widthFrac: number; anchorX: number; anchorY: number }> = {
  hand_tool_pouch: { widthFrac: 0.24, anchorX: 0.5, anchorY: 0.15 },
};

export function handAccessorySrc(key: string): string {
  return `/images/character/hand_accessories/${key}.png`;
}

export function outfitFullSrc(assetKey: string): string {
  return `/images/character/outfit_full/${assetKey}.png`;
}

// "드레스 오버레이" 방식(scripts/asset-tools/normalize_dress_overlays.py) — 목 아래 전신
// 인형이 아니라 상의/원피스만 그려진 의상 세트를, 기본 체형 원본(팔다리 포함) 위에 어깨폭
// 기준으로 얹고 신발을 발 위치에 따로 앵커링해 만든 "완성된 전신 이미지". outfit_full의
// 420x512 캔버스와 달리 각 kind의 기본 체형 원본과 동일한 실측 픽셀 크기를 그대로 쓴다.
export function dressFullSrc(assetKey: string): string {
  return `/images/character/dress_full/${assetKey}.png`;
}
// scripts/asset-tools 로 생성 — 해녀/해남/새싹 민머리 베이스 + 헤어스타일 오버레이 배치값.
// widthFrac/leftFrac/topFrac은 headRenderW/headRenderH(렌더된 머리 폭/높이) 기준 비율.
export const HAIR_ASSET_PLACEMENT: Record<string, { widthFrac: number; leftFrac: number; topFrac: number; w: number; h: number }> = {
  haenyeo_01: { widthFrac: 0.8, leftFrac: 0.1, topFrac: -0.1897, w: 272, h: 272 },
  haenyeo_02: { widthFrac: 0.8, leftFrac: 0.1, topFrac: -0.1897, w: 272, h: 246 },
  haenyeo_03: { widthFrac: 0.8, leftFrac: 0.1, topFrac: -0.1897, w: 272, h: 267 },
  haenyeo_04: { widthFrac: 0.8, leftFrac: 0.1, topFrac: -0.1897, w: 272, h: 233 },
  haenyeo_05: { widthFrac: 0.8, leftFrac: 0.1, topFrac: -0.1897, w: 272, h: 304 },
  haenyeo_06: { widthFrac: 0.8, leftFrac: 0.1, topFrac: -0.1897, w: 272, h: 248 },
  haenyeo_07: { widthFrac: 0.8, leftFrac: 0.1, topFrac: -0.1897, w: 272, h: 278 },
  haenyeo_08: { widthFrac: 0.8, leftFrac: 0.1, topFrac: -0.1897, w: 272, h: 303 },
  haenyeo_09: { widthFrac: 0.8, leftFrac: 0.1, topFrac: -0.1897, w: 272, h: 263 },
  haenyeo_10: { widthFrac: 0.8, leftFrac: 0.1, topFrac: -0.1897, w: 272, h: 336 },
  haenyeo_11: { widthFrac: 0.8, leftFrac: 0.1, topFrac: -0.1897, w: 272, h: 273 },
  haenyeo_12: { widthFrac: 0.8, leftFrac: 0.1, topFrac: -0.1897, w: 272, h: 265 },
  haenyeo_13: { widthFrac: 0.8, leftFrac: 0.1, topFrac: -0.1897, w: 272, h: 406 },
  haenyeo_14: { widthFrac: 0.8, leftFrac: 0.1, topFrac: -0.1897, w: 272, h: 253 },
  haenyeo_15: { widthFrac: 0.8, leftFrac: 0.1, topFrac: -0.1897, w: 272, h: 263 },
  haenyeo_16: { widthFrac: 0.8, leftFrac: 0.1, topFrac: -0.1897, w: 272, h: 283 },
  haenyeo_17: { widthFrac: 0.8, leftFrac: 0.1, topFrac: -0.1897, w: 272, h: 269 },
  haenyeo_18: { widthFrac: 0.8, leftFrac: 0.1, topFrac: -0.1897, w: 272, h: 262 },
  haenyeo_19: { widthFrac: 0.8, leftFrac: 0.1, topFrac: -0.1897, w: 272, h: 284 },
  haenyeo_20: { widthFrac: 0.8, leftFrac: 0.1, topFrac: -0.1897, w: 272, h: 304 },
  haenam_01: { widthFrac: 0.9259, leftFrac: -0.0157, topFrac: -0.0315, w: 325, h: 264 },
  haenam_02: { widthFrac: 0.9573, leftFrac: -0.0266, topFrac: -0.003, w: 336, h: 324 },
  haenam_03: { widthFrac: 0.9516, leftFrac: -0.0054, topFrac: -0.0149, w: 334, h: 243 },
  haenam_04: { widthFrac: 0.9487, leftFrac: -0.0029, topFrac: -0.0011, w: 333, h: 240 },
  haenam_05: { widthFrac: 0.9345, leftFrac: 0.0309, topFrac: 0.0089, w: 328, h: 223 },
  haenam_06: { widthFrac: 0.9402, leftFrac: -0.0155, topFrac: -0.0069, w: 330, h: 235 },
  haenam_07: { widthFrac: 0.9744, leftFrac: -0.0219, topFrac: -0.0331, w: 342, h: 265 },
  haenam_08: { widthFrac: 0.9117, leftFrac: -0.0031, topFrac: 0.0049, w: 320, h: 228 },
  haenam_10: { widthFrac: 0.9088, leftFrac: -0.0067, topFrac: 0.0202, w: 319, h: 218 },
  haenam_11: { widthFrac: 0.9573, leftFrac: -0.0434, topFrac: -0.016, w: 336, h: 238 },
  haenam_12: { widthFrac: 0.9231, leftFrac: -0.0123, topFrac: 0.0034, w: 324, h: 234 },
  haenam_13: { widthFrac: 0.9231, leftFrac: -0.0168, topFrac: -0.0156, w: 324, h: 341 },
  haenam_14: { widthFrac: 0.9345, leftFrac: -0.0014, topFrac: 0.0097, w: 328, h: 237 },
  haenam_15: { widthFrac: 0.9373, leftFrac: 0.0071, topFrac: -0.081, w: 329, h: 231 },
  haenam_16: { widthFrac: 0.9573, leftFrac: -0.0307, topFrac: -0.0022, w: 336, h: 232 },
  haenam_17: { widthFrac: 1.0, leftFrac: -0.0615, topFrac: -0.0024, w: 351, h: 328 },
  haenam_18: { widthFrac: 0.9402, leftFrac: -0.0104, topFrac: -0.0567, w: 330, h: 341 },
  haenam_19: { widthFrac: 0.8974, leftFrac: 0.0218, topFrac: -0.0071, w: 315, h: 228 },
  haenam_20: { widthFrac: 1.0085, leftFrac: -0.0474, topFrac: -0.0699, w: 354, h: 273 },
  child_toddler_male_01: { widthFrac: 1.0458, leftFrac: -0.0175, topFrac: -0.0601, w: 365, h: 332 },
  child_toddler_male_02: { widthFrac: 1.1834, leftFrac: -0.048, topFrac: -0.0527, w: 413, h: 337 },
  child_toddler_male_03: { widthFrac: 1.2149, leftFrac: 0.008, topFrac: -0.0038, w: 424, h: 199 },
  child_toddler_male_04: { widthFrac: 1.1834, leftFrac: -0.0012, topFrac: -0.0135, w: 413, h: 270 },
  child_toddler_male_05: { widthFrac: 1.1117, leftFrac: -0.0169, topFrac: 0.016, w: 388, h: 304 },
  child_toddler_male_06: { widthFrac: 1.0602, leftFrac: -0.0193, topFrac: -0.0222, w: 370, h: 233 },
  child_toddler_male_07: { widthFrac: 1.1461, leftFrac: -0.0594, topFrac: 0.0047, w: 400, h: 307 },
  child_toddler_male_08: { widthFrac: 1.1146, leftFrac: -0.0149, topFrac: 0.0027, w: 389, h: 313 },
  child_toddler_male_09: { widthFrac: 1.1032, leftFrac: 0.009, topFrac: 0.0035, w: 385, h: 304 },
  child_toddler_male_10: { widthFrac: 1.0917, leftFrac: 0.0154, topFrac: -0.0472, w: 381, h: 238 },
  child_toddler_female_01: { widthFrac: 0.9855, leftFrac: -0.0181, topFrac: -0.0642, w: 408, h: 372 },
  child_toddler_female_02: { widthFrac: 1.1135, leftFrac: -0.0452, topFrac: -0.0559, w: 461, h: 376 },
  child_toddler_female_03: { widthFrac: 1.1329, leftFrac: 0.0076, topFrac: -0.0026, w: 469, h: 221 },
  child_toddler_female_04: { widthFrac: 1.1087, leftFrac: -0.0008, topFrac: -0.0138, w: 459, h: 299 },
  child_toddler_female_05: { widthFrac: 1.0459, leftFrac: -0.016, topFrac: 0.0161, w: 433, h: 339 },
  child_toddler_female_06: { widthFrac: 1.0, leftFrac: -0.0194, topFrac: -0.0242, w: 414, h: 262 },
  child_toddler_female_07: { widthFrac: 1.0797, leftFrac: -0.0555, topFrac: 0.0042, w: 447, h: 344 },
  child_toddler_female_08: { widthFrac: 1.0459, leftFrac: -0.0138, topFrac: 0.003, w: 433, h: 349 },
  child_toddler_female_09: { widthFrac: 1.0338, leftFrac: 0.0089, topFrac: 0.0033, w: 428, h: 339 },
  child_toddler_female_10: { widthFrac: 1.029, leftFrac: 0.0144, topFrac: -0.0503, w: 426, h: 266 },
  child_kindergarten_male_01: { widthFrac: 0.9828, leftFrac: -0.0174, topFrac: -0.0643, w: 401, h: 365 },
  child_kindergarten_male_02: { widthFrac: 1.1103, leftFrac: -0.0451, topFrac: -0.056, w: 453, h: 369 },
  child_kindergarten_male_03: { widthFrac: 1.1299, leftFrac: 0.0084, topFrac: -0.0017, w: 461, h: 217 },
  child_kindergarten_male_04: { widthFrac: 1.1054, leftFrac: -0.0024, topFrac: -0.0159, w: 451, h: 295 },
  child_kindergarten_male_05: { widthFrac: 1.0392, leftFrac: -0.0155, topFrac: 0.0173, w: 424, h: 332 },
  child_kindergarten_male_06: { widthFrac: 0.9975, leftFrac: -0.0183, topFrac: -0.0236, w: 407, h: 257 },
  child_kindergarten_male_07: { widthFrac: 1.076, leftFrac: -0.0542, topFrac: 0.0053, w: 439, h: 338 },
  child_kindergarten_male_08: { widthFrac: 1.0417, leftFrac: -0.013, topFrac: 0.0041, w: 425, h: 343 },
  child_kindergarten_male_09: { widthFrac: 1.0319, leftFrac: 0.0076, topFrac: 0.0044, w: 421, h: 333 },
  child_kindergarten_male_10: { widthFrac: 1.0221, leftFrac: 0.0156, topFrac: -0.0525, w: 417, h: 262 },
  child_kindergarten_female_01: { widthFrac: 1.005, leftFrac: -0.0178, topFrac: -0.0629, w: 402, h: 366 },
  child_kindergarten_female_02: { widthFrac: 1.135, leftFrac: -0.0461, topFrac: -0.0548, w: 454, h: 370 },
  child_kindergarten_female_03: { widthFrac: 1.1575, leftFrac: 0.0084, topFrac: -0.0019, w: 463, h: 217 },
  child_kindergarten_female_04: { widthFrac: 1.1325, leftFrac: -0.0027, topFrac: -0.0158, w: 453, h: 296 },
  child_kindergarten_female_05: { widthFrac: 1.065, leftFrac: -0.0159, topFrac: 0.0168, w: 426, h: 333 },
  child_kindergarten_female_06: { widthFrac: 1.0175, leftFrac: -0.0188, topFrac: -0.0232, w: 407, h: 257 },
  child_kindergarten_female_07: { widthFrac: 1.0975, leftFrac: -0.0554, topFrac: 0.0052, w: 439, h: 339 },
  child_kindergarten_female_08: { widthFrac: 1.065, leftFrac: -0.0134, topFrac: 0.0038, w: 426, h: 344 },
  child_kindergarten_female_09: { widthFrac: 1.055, leftFrac: 0.0076, topFrac: 0.0041, w: 422, h: 334 },
  child_kindergarten_female_10: { widthFrac: 1.045, leftFrac: 0.0158, topFrac: -0.0485, w: 418, h: 261 },
  child_elementary_male_01: { widthFrac: 0.9725, leftFrac: -0.0169, topFrac: -0.0653, w: 424, h: 387 },
  child_elementary_male_02: { widthFrac: 1.0986, leftFrac: -0.0446, topFrac: -0.0567, w: 479, h: 391 },
  child_elementary_male_03: { widthFrac: 1.1147, leftFrac: 0.0081, topFrac: -0.0014, w: 486, h: 228 },
  child_elementary_male_04: { widthFrac: 1.0917, leftFrac: -0.0024, topFrac: -0.0161, w: 476, h: 311 },
  child_elementary_male_05: { widthFrac: 1.0321, leftFrac: -0.0166, topFrac: 0.0168, w: 450, h: 352 },
  child_elementary_male_06: { widthFrac: 0.9885, leftFrac: -0.0189, topFrac: -0.0229, w: 431, h: 271 },
  child_elementary_male_07: { widthFrac: 1.0665, leftFrac: -0.0548, topFrac: 0.0048, w: 465, h: 358 },
  child_elementary_male_08: { widthFrac: 1.0321, leftFrac: -0.013, topFrac: 0.0039, w: 450, h: 362 },
  child_elementary_male_09: { widthFrac: 1.0183, leftFrac: 0.0086, topFrac: 0.0039, w: 444, h: 352 },
  child_elementary_male_10: { widthFrac: 1.0138, leftFrac: 0.0139, topFrac: -0.0504, w: 442, h: 276 },
  child_elementary_female_01: { widthFrac: 1.0341, leftFrac: -0.0199, topFrac: -0.0605, w: 334, h: 304 },
  child_elementary_female_02: { widthFrac: 1.1703, leftFrac: -0.0475, topFrac: -0.0533, w: 378, h: 308 },
  child_elementary_female_03: { widthFrac: 1.195, leftFrac: 0.0096, topFrac: -0.0031, w: 386, h: 182 },
  child_elementary_female_04: { widthFrac: 1.1703, leftFrac: -0.0029, topFrac: -0.0155, w: 378, h: 247 },
  child_elementary_female_05: { widthFrac: 1.0991, leftFrac: -0.0175, topFrac: 0.0151, w: 355, h: 278 },
  child_elementary_female_06: { widthFrac: 1.0464, leftFrac: -0.0198, topFrac: -0.023, w: 338, h: 214 },
  child_elementary_female_07: { widthFrac: 1.1331, leftFrac: -0.059, topFrac: 0.0034, w: 366, h: 282 },
  child_elementary_female_08: { widthFrac: 1.0991, leftFrac: -0.0133, topFrac: 0.0043, w: 355, h: 286 },
  child_elementary_female_09: { widthFrac: 1.0898, leftFrac: 0.0093, topFrac: 0.0022, w: 352, h: 279 },
  child_elementary_female_10: { widthFrac: 1.0774, leftFrac: 0.0158, topFrac: -0.0494, w: 348, h: 218 },
};

// HairStyle(온보딩 선택지) → 그룹별 사용 가능한 스타일 번호. 값이 없으면(예: 새싹 bun) 그림 자산이
// 없다는 뜻 — 숨기지 않고 민머리 베이스로 자연스럽게 폴백한다(docs/PROGRESS.md 기록).
export const HAIR_STYLE_INDEX: Record<"haenyeo" | "haenam" | "child", Partial<Record<string, string>>> = {
  haenyeo: { wave: "03", pony: "09", bob: "06", twin: "11", bun: "10" },
  haenam: { short_neat: "01", buzz: "07", sideswept: "15", bob: "18" },
  child: { bob: "02", twin: "03", pony: "04" },
};
// 민머리 베이스(공급받은 원본 시트에서 크롭, docs/PROGRESS.md 기록) — 얼굴/피부톤/표정/체형은
// 기존 base/head 그림과 동일, 머리카락만 빠져 있다. 헤어스타일 오버레이를 얹기 위한 밑그림.
export function baldHeadSrc(key: CharacterPortraitKey): string {
  return `/images/character/base/head_bald/${characterPortraitKeyFor(key)}.png`;
}

export function baldSkinMaskSrc(key: CharacterPortraitKey): string {
  return `/images/character/base/masks/${characterPortraitKeyFor(key)}_bald_skin_mask.png`;
}

// 헤어스타일 오버레이 자산은 해녀/해남/새싹 3그룹 폴더로 나뉜다(kind가 그대로 그룹명). 새싹은
// 연령대×성별 6종 헤드마다 그림 크기가 달라 하위 폴더(characterPortraitKeyFor 키)로 한 번 더 나눈다.
export function hairOverlaySrc(portraitKey: CharacterPortraitKey, styleIndex: string): string {
  const group = portraitKey.kind;
  if (group === "child") {
    const headKey = characterPortraitKeyFor(portraitKey);
    return `/images/character/child/hair/${headKey}/child_hair_${styleIndex}.png`;
  }
  return `/images/character/${group}/hair/${group}_hair_${styleIndex}.png`;
}

export function hairOverlayMaskSrc(portraitKey: CharacterPortraitKey, styleIndex: string): string {
  const group = portraitKey.kind;
  if (group === "child") {
    const headKey = characterPortraitKeyFor(portraitKey);
    return `/images/character/child/hair/${headKey}/masks/child_hair_${styleIndex}_mask.png`;
  }
  return `/images/character/${group}/hair/masks/${group}_hair_${styleIndex}_mask.png`;
}

// HairStyle 선택값 → HAIR_ASSET_PLACEMENT 키. 해당 그룹에 그림 자산이 없는 조합(새싹 bun 등)은
// null을 반환 — 이 경우 CharacterSprite가 민머리 베이스로 자연스럽게 폴백한다.
export function resolveHairAssetKey(portraitKey: CharacterPortraitKey, hairStyle: string): string | null {
  const idx = HAIR_STYLE_INDEX[portraitKey.kind]?.[hairStyle];
  if (!idx) return null;
  return `${characterPortraitKeyFor(portraitKey)}_${idx}`;
}
