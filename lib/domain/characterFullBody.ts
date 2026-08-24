import type { CharacterPortraitKey, ChildStageGroup } from "@/lib/domain/characterPortrait";
import { characterPortraitKeyFor, toStageGroup } from "@/lib/domain/characterPortrait";
import type { ChildStage } from "@/lib/domain/types";

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
// child는 예전엔 1(성인과 완전히 같은 키)이었다 — 새싹 그림 자체가 아동 비율(큰 머리)로
// 그려져 있긴 해도 전체 캔버스 높이가 해남/해녀와 거의 같아서(PORTRAIT_SIZE 참고), 선실처럼
// 어른과 나란히 서면 새싹이 어른만큼 커 보이는 체형 문제가 있었다. heightScaleFor()로
// 연령대별로 더 작게 줄인다.
export const HEIGHT_SCALE_BY_KIND: Record<string, number> = {
  haenyeo: 0.94,
  haenam: 1,
};

// 새싹 연령대별 키 보정 — 유아가 가장 작고 초등학생이 어른에 가장 가깝게, 3단계로 점차
// 커지도록. bodyScale(구버전 벡터 폴백 전용 필드)과 별개로 실사 렌더링 경로(outfitAssetKey)
// 전용이다.
export const CHILD_STAGE_HEIGHT_SCALE: Record<ChildStageGroup, number> = {
  toddler: 0.72,
  kindergarten: 0.8,
  elementary: 0.88,
};

export function heightScaleFor(kind: string, childStage?: ChildStage | null): number {
  if (kind === "child") return CHILD_STAGE_HEIGHT_SCALE[toStageGroup(childStage)];
  return HEIGHT_SCALE_BY_KIND[kind] ?? 1;
}

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
// hand_fishing_rod: design-assets/낚시대.png(사용자 업로드)에서 여백만 잘라낸 실측 크기.
export const HAND_SIZE: Record<string, { w: number; h: number }> = {
  hand_tool_pouch: { w: 217, h: 192 },
  hand_fishing_rod: { w: 700, h: 540 },
};

export const HAND_ACCESSORY_ANCHOR = { x: 310, y: 300 };

// 소품별 배치값 — widthFrac: OUTFIT_CANVAS_W 대비 소품 폭 비율. anchorX/anchorY: 소품 이미지
// 안에서 HAND_ACCESSORY_ANCHOR 점에 맞출 상대 위치(0~1, 손잡이 부분 등). 라이브 브라우저로
// 픽셀 단위까지 검증하지 못해 어림값 — 실제로 보면서 미세조정 필요할 수 있음(정직하게 기록).
export const HAND_PLACEMENT: Record<string, { widthFrac: number; anchorX: number; anchorY: number }> = {
  hand_tool_pouch: { widthFrac: 0.24, anchorX: 0.5, anchorY: 0.15 },
  // 손잡이(파란 anchor 무늬 부분)가 오른손 앵커에 오도록, 낚싯대는 손잡이~릴 근처를 잡고
  // 대는 대각선 위로 뻗어나가는 모양이라 다른 소품보다 폭을 훨씬 크게 잡았다.
  hand_fishing_rod: { widthFrac: 0.62, anchorX: 0.02, anchorY: 0.82 },
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
  haenyeo_01: { widthFrac: 1.0, leftFrac: 0.0, topFrac: -0.1379, w: 340, h: 331 },
  haenyeo_02: { widthFrac: 1.0, leftFrac: 0.0, topFrac: -0.1379, w: 340, h: 307 },
  haenyeo_03: { widthFrac: 1.0, leftFrac: 0.0, topFrac: -0.1379, w: 340, h: 348 },
  haenyeo_04: { widthFrac: 1.0, leftFrac: 0.0, topFrac: -0.1379, w: 340, h: 301 },
  haenyeo_05: { widthFrac: 1.0, leftFrac: 0.0, topFrac: -0.1379, w: 340, h: 381 },
  haenyeo_06: { widthFrac: 1.0, leftFrac: 0.0, topFrac: -0.1379, w: 340, h: 310 },
  haenyeo_07: { widthFrac: 1.0, leftFrac: 0.0, topFrac: -0.1379, w: 340, h: 341 },
  haenyeo_08: { widthFrac: 1.0, leftFrac: 0.0, topFrac: -0.1379, w: 340, h: 380 },
  haenyeo_09: { widthFrac: 1.0, leftFrac: 0.0, topFrac: -0.1379, w: 340, h: 330 },
  haenyeo_10: { widthFrac: 1.0, leftFrac: 0.0, topFrac: -0.1379, w: 340, h: 423 },
  haenyeo_11: { widthFrac: 1.0, leftFrac: 0.0, topFrac: -0.1379, w: 340, h: 354 },
  haenyeo_12: { widthFrac: 1.0, leftFrac: 0.0, topFrac: -0.1379, w: 340, h: 340 },
  haenyeo_13: { widthFrac: 1.0, leftFrac: 0.0, topFrac: -0.1379, w: 340, h: 454 },
  haenyeo_14: { widthFrac: 1.0, leftFrac: 0.0, topFrac: -0.1379, w: 340, h: 310 },
  haenyeo_15: { widthFrac: 1.0, leftFrac: 0.0, topFrac: -0.1379, w: 340, h: 324 },
  haenyeo_16: { widthFrac: 1.0, leftFrac: 0.0, topFrac: -0.1379, w: 340, h: 358 },
  haenyeo_17: { widthFrac: 1.0, leftFrac: 0.0, topFrac: -0.1379, w: 340, h: 338 },
  haenyeo_18: { widthFrac: 1.0, leftFrac: 0.0, topFrac: -0.1379, w: 340, h: 329 },
  haenyeo_19: { widthFrac: 1.0, leftFrac: 0.0, topFrac: -0.1379, w: 340, h: 381 },
  haenyeo_20: { widthFrac: 1.0, leftFrac: 0.0, topFrac: -0.1379, w: 340, h: 412 },
  haenam_01: { widthFrac: 0.9174, leftFrac: -0.0174, topFrac: -0.0079, w: 322, h: 228 },
  haenam_02: { widthFrac: 0.9573, leftFrac: -0.0064, topFrac: -0.0431, w: 336, h: 238 },
  haenam_03: { widthFrac: 0.9373, leftFrac: -0.0017, topFrac: -0.0126, w: 329, h: 241 },
  haenam_04: { widthFrac: 0.9487, leftFrac: -0.0106, topFrac: 0.011, w: 333, h: 239 },
  haenam_05: { widthFrac: 0.9088, leftFrac: 0.0271, topFrac: 0.0137, w: 319, h: 218 },
  haenam_06: { widthFrac: 0.9088, leftFrac: -0.0112, topFrac: 0.0043, w: 319, h: 229 },
  haenam_07: { widthFrac: 0.9088, leftFrac: 0.0137, topFrac: 0.0142, w: 319, h: 229 },
  haenam_08: { widthFrac: 0.9174, leftFrac: -0.0065, topFrac: 0.0104, w: 322, h: 229 },
  haenam_10: { widthFrac: 0.9402, leftFrac: -0.0105, topFrac: -0.0486, w: 330, h: 229 },
  haenam_11: { widthFrac: 0.9658, leftFrac: -0.0393, topFrac: 0.0026, w: 339, h: 241 },
  haenam_12: { widthFrac: 0.943, leftFrac: -0.0079, topFrac: 0.0161, w: 331, h: 236 },
  haenam_13: { widthFrac: 0.9687, leftFrac: -0.0425, topFrac: -0.0707, w: 340, h: 242 },
  haenam_14: { widthFrac: 0.9288, leftFrac: 0.0028, topFrac: -0.0444, w: 326, h: 239 },
  haenam_15: { widthFrac: 0.9202, leftFrac: -0.0103, topFrac: -0.0007, w: 323, h: 222 },
  haenam_16: { widthFrac: 0.9316, leftFrac: -0.0251, topFrac: 0.0051, w: 327, h: 335 },
  haenam_17: { widthFrac: 0.9886, leftFrac: -0.0906, topFrac: 0.0103, w: 347, h: 333 },
  haenam_18: { widthFrac: 0.906, leftFrac: 0.0021, topFrac: 0.0083, w: 318, h: 226 },
  haenam_19: { widthFrac: 0.9573, leftFrac: -0.0575, topFrac: 0.0149, w: 336, h: 332 },
  haenam_20: { widthFrac: 1.0028, leftFrac: -0.0532, topFrac: -0.0031, w: 352, h: 335 },
  child_toddler_male_01: { widthFrac: 1.0229, leftFrac: -0.0013, topFrac: -0.0077, w: 357, h: 203 },
  child_toddler_male_02: { widthFrac: 1.1375, leftFrac: -0.0513, topFrac: 0.0117, w: 397, h: 289 },
  child_toddler_male_03: { widthFrac: 1.2206, leftFrac: 0.015, topFrac: 0.0164, w: 426, h: 196 },
  child_toddler_male_04: { widthFrac: 1.1662, leftFrac: -0.0081, topFrac: 0.0035, w: 407, h: 273 },
  child_toddler_male_05: { widthFrac: 1.0831, leftFrac: -0.0084, topFrac: 0.0229, w: 378, h: 227 },
  child_toddler_male_06: { widthFrac: 1.0602, leftFrac: -0.015, topFrac: 0.0259, w: 370, h: 323 },
  child_toddler_male_07: { widthFrac: 1.0888, leftFrac: 0.0157, topFrac: -0.0087, w: 380, h: 295 },
  child_toddler_male_08: { widthFrac: 1.0917, leftFrac: 0.0084, topFrac: 0.0155, w: 381, h: 289 },
  child_toddler_male_09: { widthFrac: 1.1146, leftFrac: 0.0141, topFrac: 0.0155, w: 389, h: 274 },
  child_toddler_male_10: { widthFrac: 1.0344, leftFrac: 0.0202, topFrac: 0.0033, w: 361, h: 320 },
  child_toddler_female_01: { widthFrac: 0.9662, leftFrac: -0.0032, topFrac: -0.0099, w: 400, h: 227 },
  child_toddler_female_02: { widthFrac: 1.0725, leftFrac: -0.0496, topFrac: 0.0109, w: 444, h: 323 },
  child_toddler_female_03: { widthFrac: 1.1425, leftFrac: 0.0135, topFrac: 0.0167, w: 473, h: 216 },
  child_toddler_female_04: { widthFrac: 1.0918, leftFrac: -0.0076, topFrac: 0.0037, w: 452, h: 304 },
  child_toddler_female_05: { widthFrac: 1.0193, leftFrac: -0.0081, topFrac: 0.0228, w: 422, h: 254 },
  child_toddler_female_06: { widthFrac: 0.9976, leftFrac: -0.0127, topFrac: 0.0267, w: 413, h: 362 },
  child_toddler_female_07: { widthFrac: 1.0242, leftFrac: 0.0157, topFrac: -0.0097, w: 424, h: 330 },
  child_toddler_female_08: { widthFrac: 1.0242, leftFrac: 0.0078, topFrac: 0.0186, w: 424, h: 322 },
  child_toddler_female_09: { widthFrac: 1.0435, leftFrac: 0.014, topFrac: 0.018, w: 432, h: 304 },
  child_toddler_female_10: { widthFrac: 0.9734, leftFrac: 0.0191, topFrac: 0.0033, w: 403, h: 358 },
  child_kindergarten_male_01: { widthFrac: 0.9632, leftFrac: -0.0021, topFrac: -0.0087, w: 393, h: 223 },
  child_kindergarten_male_02: { widthFrac: 1.0686, leftFrac: -0.0484, topFrac: 0.0122, w: 436, h: 317 },
  child_kindergarten_male_03: { widthFrac: 1.1373, leftFrac: 0.014, topFrac: 0.0174, w: 464, h: 213 },
  child_kindergarten_male_04: { widthFrac: 1.0907, leftFrac: -0.0071, topFrac: 0.0042, w: 445, h: 298 },
  child_kindergarten_male_05: { widthFrac: 1.0147, leftFrac: -0.0072, topFrac: 0.0236, w: 414, h: 249 },
  child_kindergarten_male_06: { widthFrac: 0.9951, leftFrac: -0.0146, topFrac: 0.0249, w: 406, h: 356 },
  child_kindergarten_male_07: { widthFrac: 1.0221, leftFrac: 0.0139, topFrac: -0.0092, w: 417, h: 323 },
  child_kindergarten_male_08: { widthFrac: 1.0221, leftFrac: 0.0082, topFrac: 0.0163, w: 417, h: 316 },
  child_kindergarten_male_09: { widthFrac: 1.0417, leftFrac: 0.0146, topFrac: 0.0188, w: 425, h: 299 },
  child_kindergarten_male_10: { widthFrac: 0.9681, leftFrac: 0.0198, topFrac: 0.0039, w: 395, h: 351 },
  child_kindergarten_female_01: { widthFrac: 0.9825, leftFrac: -0.0022, topFrac: -0.0086, w: 393, h: 223 },
  child_kindergarten_female_02: { widthFrac: 1.0925, leftFrac: -0.0495, topFrac: 0.0118, w: 437, h: 317 },
  child_kindergarten_female_03: { widthFrac: 1.165, leftFrac: 0.0142, topFrac: 0.0169, w: 466, h: 214 },
  child_kindergarten_female_04: { widthFrac: 1.1175, leftFrac: -0.0074, topFrac: 0.004, w: 447, h: 299 },
  child_kindergarten_female_05: { widthFrac: 1.0375, leftFrac: -0.0075, topFrac: 0.023, w: 415, h: 250 },
  child_kindergarten_female_06: { widthFrac: 1.0175, leftFrac: -0.0149, topFrac: 0.0242, w: 407, h: 356 },
  child_kindergarten_female_07: { widthFrac: 1.045, leftFrac: 0.0141, topFrac: -0.009, w: 418, h: 324 },
  child_kindergarten_female_08: { widthFrac: 1.0425, leftFrac: 0.0083, topFrac: 0.0158, w: 417, h: 317 },
  child_kindergarten_female_09: { widthFrac: 1.065, leftFrac: 0.0149, topFrac: 0.0183, w: 426, h: 300 },
  child_kindergarten_female_10: { widthFrac: 0.99, leftFrac: 0.0202, topFrac: 0.0038, w: 396, h: 352 },
  child_elementary_male_01: { widthFrac: 0.9541, leftFrac: -0.0032, topFrac: -0.0099, w: 416, h: 236 },
  child_elementary_male_02: { widthFrac: 1.0573, leftFrac: -0.0487, topFrac: 0.0114, w: 461, h: 336 },
  child_elementary_male_03: { widthFrac: 1.1239, leftFrac: 0.0123, topFrac: 0.0156, w: 490, h: 225 },
  child_elementary_male_04: { widthFrac: 1.0757, leftFrac: -0.0061, topFrac: 0.0056, w: 469, h: 315 },
  child_elementary_male_05: { widthFrac: 1.0046, leftFrac: -0.0075, topFrac: 0.0244, w: 438, h: 263 },
  child_elementary_male_06: { widthFrac: 0.9839, leftFrac: -0.0138, topFrac: 0.0276, w: 429, h: 376 },
  child_elementary_male_07: { widthFrac: 1.0115, leftFrac: 0.0141, topFrac: -0.0111, w: 441, h: 343 },
  child_elementary_male_08: { widthFrac: 1.0092, leftFrac: 0.0091, topFrac: 0.0174, w: 440, h: 335 },
  child_elementary_male_09: { widthFrac: 1.0298, leftFrac: 0.0146, topFrac: 0.0166, w: 449, h: 316 },
  child_elementary_male_10: { widthFrac: 0.9587, leftFrac: 0.0194, topFrac: 0.0052, w: 418, h: 371 },
  child_elementary_female_01: { widthFrac: 1.0124, leftFrac: -0.0011, topFrac: -0.0082, w: 327, h: 185 },
  child_elementary_female_02: { widthFrac: 1.1238, leftFrac: -0.0514, topFrac: 0.011, w: 363, h: 264 },
  child_elementary_female_03: { widthFrac: 1.2074, leftFrac: 0.0146, topFrac: 0.0164, w: 390, h: 179 },
  child_elementary_female_04: { widthFrac: 1.1517, leftFrac: -0.0087, topFrac: 0.0027, w: 372, h: 250 },
  child_elementary_female_05: { widthFrac: 1.0712, leftFrac: -0.0067, topFrac: 0.0235, w: 346, h: 208 },
  child_elementary_female_06: { widthFrac: 1.0464, leftFrac: -0.0148, topFrac: 0.0248, w: 338, h: 296 },
  child_elementary_female_07: { widthFrac: 1.0774, leftFrac: 0.0161, topFrac: -0.0093, w: 348, h: 270 },
  child_elementary_female_08: { widthFrac: 1.0774, leftFrac: 0.0106, topFrac: 0.0154, w: 348, h: 264 },
  child_elementary_female_09: { widthFrac: 1.0991, leftFrac: 0.0148, topFrac: 0.0161, w: 355, h: 249 },
  child_elementary_female_10: { widthFrac: 1.0217, leftFrac: 0.0214, topFrac: 0.0025, w: 330, h: 293 },
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
