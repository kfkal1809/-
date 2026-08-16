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
