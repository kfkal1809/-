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
