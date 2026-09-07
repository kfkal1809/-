import type { CharacterPortraitKey, ChildStageGroup } from "@/lib/domain/characterPortrait";
import { characterPortraitKeyFor, toStageGroup } from "@/lib/domain/characterPortrait";
import type { ChildStage } from "@/lib/domain/types";

// 목 아래(의상) 전신 스프라이트 정규화 캔버스 — scripts/normalize-outfits.py 참고.
// 모든 outfit_full/*.png는 이 캔버스 크기로 저장되어 있고, 목선(collar)이 항상 NECK_Y에 온다.
export const OUTFIT_CANVAS_W = 420;
export const OUTFIT_CANVAS_H = 512;
export const NECK_Y = 140;

// 새싹 옷 91종의 목선(y=140)~발끝 실측 결과, 목선 위치는 전부 정확히 일치했지만
// 발끝까지의 세로 길이(체형 자체가 그림에 같이 그려져 있어 사실상 "체형 크기")가
// 279~349px로 최대 25%까지 제각각이었다 — 옷을 바꿔 입힐 때마다 같은 새싹인데도 키가
// 늘었다 줄었다 하는 원인. "아기 멜빵바지"(기본 지급 아이템, child_outfit_02.png,
// 목선~발끝 324px)를 기준(=1.0)으로 삼아, 그보다 짧거나 긴 그림을 목선을 축으로
// 세로 방향으로만 다시 스케일한다(가로는 그대로 둬 좌우 비율은 안 바뀜) — 그림을
// 새로 그리거나 다시 자르지 않고 CharacterSprite에서 CSS transform: scaleY로만 보정.
// scripts/asset-tools/measure_child_outfit_scale.py로 91종 전부의 알파 채널 bbox를
// 스캔해 계산했다(측정값과 기준값이 거의 같은 파일은 표에서 뺌).
export const CHILD_OUTFIT_BODY_SCALE_Y: Record<string, number> = {
  child_elementary_male_dress_s9_01: 0.9284,
  child_elementary_male_dress_s9_02: 0.9284,
  child_elementary_male_dress_s9_03: 0.9284,
  child_elementary_male_dress_s9_04: 0.9284,
  child_elementary_male_dress_s9_05: 0.9284,
  child_elementary_male_dress_s9_06: 0.9284,
  child_elementary_male_dress_s9_07: 0.9284,
  child_elementary_male_dress_s9_08: 0.9284,
  child_elementary_male_dress_s9_09: 0.9284,
  child_outfit_01: 1.0693,
  child_outfit_03: 1.0157,
  child_outfit_04: 0.9558,
  child_outfit_05: 0.9284,
  child_outfit_06: 1.08,
  child_outfit_07: 1.0983,
  child_outfit_08: 1.1613,
  child_outfit_09: 1.0588,
  child_outfit_10: 1.0062,
  child_toddler_female_dress_s10_01: 0.9284,
  child_toddler_female_dress_s10_02: 0.9284,
  child_toddler_female_dress_s10_04: 0.9446,
  child_toddler_female_dress_s10_05: 0.9284,
  child_toddler_female_dress_s10_07: 0.9284,
  child_toddler_female_dress_s10_08: 0.9284,
  child_toddler_female_dress_s10_09: 0.9284,
  child_toddler_female_dress_s2_01: 1.0554,
  child_toddler_female_dress_s2_02: 0.9284,
  child_toddler_female_dress_s2_03: 0.9284,
  child_toddler_female_dress_s2_04: 0.9284,
  child_toddler_female_dress_s2_05: 0.9284,
  child_toddler_female_dress_s2_06: 0.9284,
  child_toddler_female_dress_s2_07: 0.9284,
  child_toddler_female_dress_s2_08: 0.9284,
  child_toddler_female_dress_s2_09: 0.9284,
  child_toddler_female_dress_s6_01: 0.9446,
  child_toddler_female_dress_s6_02: 0.9446,
  child_toddler_female_dress_s6_03: 0.9446,
  child_toddler_female_dress_s6_04: 0.9284,
  child_toddler_female_dress_s6_05: 0.9284,
  child_toddler_female_dress_s6_06: 0.9446,
  child_toddler_female_dress_s6_07: 0.9284,
  child_toddler_female_dress_s6_08: 0.9446,
  child_toddler_female_dress_s6_09: 0.9446,
  child_toddler_female_dress_s7_02: 0.9284,
  child_toddler_female_dress_s7_03: 0.9284,
  child_toddler_female_dress_s7_04: 0.9284,
  child_toddler_female_dress_s7_05: 1.0157,
  child_toddler_female_dress_s7_06: 0.9284,
  child_toddler_female_dress_s7_08: 0.9284,
  child_toddler_female_dress_s7_09: 0.9284,
  child_toddler_male_dress_s10_03: 0.9284,
  child_toddler_male_dress_s10_06: 0.9284,
  child_toddler_male_dress_s3_01: 0.9284,
  child_toddler_male_dress_s3_02: 0.9284,
  child_toddler_male_dress_s3_03: 0.9284,
  child_toddler_male_dress_s3_04: 0.9284,
  child_toddler_male_dress_s3_05: 0.9284,
  child_toddler_male_dress_s3_06: 0.9284,
  child_toddler_male_dress_s3_07: 0.9284,
  child_toddler_male_dress_s3_08: 0.9284,
  child_toddler_male_dress_s3_09: 0.9284,
  child_toddler_male_dress_s4_01: 0.9284,
  child_toddler_male_dress_s4_02: 0.9284,
  child_toddler_male_dress_s4_03: 0.9284,
  child_toddler_male_dress_s4_04: 0.9284,
  child_toddler_male_dress_s4_05: 0.9284,
  child_toddler_male_dress_s4_06: 0.9284,
  child_toddler_male_dress_s4_07: 0.9284,
  child_toddler_male_dress_s4_08: 0.9284,
  child_toddler_male_dress_s4_09: 0.9284,
  child_toddler_male_dress_s5_01: 0.9284,
  child_toddler_male_dress_s5_02: 0.9284,
  child_toddler_male_dress_s5_03: 0.9284,
  child_toddler_male_dress_s5_04: 0.9284,
  child_toddler_male_dress_s5_05: 0.9284,
  child_toddler_male_dress_s5_06: 0.9284,
  child_toddler_male_dress_s5_07: 0.9284,
  child_toddler_male_dress_s5_08: 0.9284,
  child_toddler_male_dress_s5_09: 0.9284,
  child_toddler_male_dress_s7_01: 0.9284,
  child_toddler_male_dress_s7_07: 0.9284,
  child_toddler_male_dress_s8_01: 0.9284,
  child_toddler_male_dress_s8_02: 0.9284,
  child_toddler_male_dress_s8_03: 0.9284,
  child_toddler_male_dress_s8_04: 0.9284,
  child_toddler_male_dress_s8_05: 0.9284,
  child_toddler_male_dress_s8_06: 0.9284,
  child_toddler_male_dress_s8_07: 0.9284,
  child_toddler_male_dress_s8_08: 0.9284,
  child_toddler_male_dress_s8_09: 0.9284,
};

// 해녀 옷의 몸통 폭 불일치는 런타임 scaleX 보정으로 해결하지 않는다 — 그림을 옆으로
// 찌그러뜨려서는 MASTER 체형과 같아질 수 없다는 지적에 따라 이 테이블(HAENYEO_OUTFIT_BODY_SCALE_X)은
// 폐기했다. 대신 scripts/asset-tools/build_haenyeo_master_canvas.py가 각 outfit_full의
// 피부(손/팔/다리)를 지우고 MASTER 몸 위에 옷만 겹치도록 파일 자체를 새로 굽는다
// (public/images/character/master/haenyeo_outfit/*.png) — HaenyeoMasterSprite.tsx 참고.

// 얼굴/헤어(목 위)는 모든 의상에 대해 같은 위치에 고정 배치된다 — "공통 anchor".
export const HEAD_WIDTH = 190;
export const HEAD_OVERLAP = 10;

// 머리 이미지는 목선(NECK_Y)보다 위로 올라가는 만큼 OUTFIT_CANVAS 상단을 벗어난다. 이 여유를
// 안 두면 렌더링 컨테이너 높이(size)가 실제 화면에 그려지는 키(머리~발끝)보다 작아져서, size가
// 같아도 outfitAssetKey 캐릭터가 기존 단일 이미지 캐릭터보다 눈에 띄게 커 보이는 버그가
// 생긴다 — 그래서 컨테이너 높이 계산에 이 마진을 항상 포함시켜 "size = 머리~발끝 실제
// 높이"가 모든 렌더링 방식에서 똑같이 성립하도록 한다.
//
// 예전엔 이 값이 모든 kind에 공통인 고정값(90)이었다. 그런데 HEAD_SIZE를 보면 해녀 머리
// (346x425, 세로로 긴 올림머리 포함 크롭)와 해남 머리(384x354, 가로로 넓은 크롭)는 종횡비가
// 전혀 다르다 — HEAD_WIDTH(190)로 폭을 맞춰 렌더링하면 해녀 머리는 233px 높이가 나오는데
// 해남 머리는 175px 높이밖에 안 나온다. 90이라는 여유값은 해녀 머리 높이에 맞춰 잡힌 값이라
// (91.4가 정확히 맞는 값) 해남/새싹에 그대로 쓰면 머리 위로 남는 빈 공간이 실제 필요한 것보다
// 훨씬 커진다 — 그 결과 "옷을 바꾸면(kind가 바뀌면) 캐릭터 키가 달라져 보인다" 버그로
// 이어졌다(실측: 같은 size=220에서 해녀는 박스의 96%를 채우는데 해남은 88%만 채움, DOM
// 렌더 크기를 Playwright로 직접 측정해 확인). 이제 각 kind의 실제 머리 종횡비로부터 역산한
// per-kind 값을 쓴다 — 계산식: b(=8, 머리 위 여유 버퍼) - NECK_Y - HEAD_OVERLAP +
// (HEAD_SIZE[key].h/HEAD_SIZE[key].w)*HEAD_WIDTH.
//
// 이 값은 "머리~발끝" 전체 캔버스 높이(HEAD_MARGIN_TOP + OUTFIT_CANVAS_H)를 계산하는 데만
// 쓰이고, 고정 헤어스타일이 그려진 head.png(민머리 아님, resolveHairAssetKey가 null을
// 반환하는 극히 드문 폴백 경로 — 현재 UI에서 선택 가능한 모든 헤어스타일은 실제로는 전부
// 민머리+헤어 오버레이 경로를 타므로 이 경로는 사실상 거의 도달하지 않는다)에서만 쓰인다.
// 실제로 항상 쓰이는 민머리 경로용 값은 아래 HEAD_MARGIN_TOP_BALD_BY_KIND.
export const HEAD_MARGIN_TOP_BY_KIND: Record<string, number> = {
  haenyeo: 91.4,
  haenam: 33.2,
  child_toddler_male: 59.0,
  child_toddler_female: 26.5,
  child_kindergarten_male: 48.0,
  child_kindergarten_female: 8.5,
  child_elementary_male: 52.7,
  child_elementary_female: 37.0,
};

// 민머리 베이스(head_bald/*.png)는 head.png(고정 헤어스타일 그림)와 종횡비가 전혀 다르다 —
// 예를 들어 해녀는 head.png가 346x425(세로로 긴 올림머리 포함 크롭)인데 head_bald.png는
// 340x290(머리카락이 없어 훨씬 짧고 넓은 크롭)이다. 그런데 CharacterSprite가 렌더링 높이를
// 계산할 때 민머리 이미지를 그릴 때도 head.png 쪽 종횡비(HEAD_SIZE)를 그대로 썼다 — 그
// 결과 민머리+얼굴 이미지가 세로로 최대 44%(해녀 기준)까지 강제로 늘어나 그려지는 버그가
// 있었다. 현재 UI에서 고를 수 있는 모든 헤어스타일은 HAIR_STYLE_INDEX에 전부 매핑돼 있어서
// 실제로는 항상 민머리+헤어 오버레이 경로(useBaldHead=true)를 타므로, 이게 "화면에 실제로
// 보이는 거의 모든 캐릭터"에 영향을 준 핵심 원인이었다(특히 올림머리처럼 머리숱이 얼굴
// 옆을 안 가리는 스타일에서 얼굴이 짜부라져 보이는 형태로 두드러짐).
export const HEAD_BALD_SIZE: Record<string, { w: number; h: number }> = {
  haenyeo: { w: 340, h: 290 },
  haenam: { w: 351, h: 286 },
  child_toddler_male: { w: 349, h: 318 },
  child_toddler_female: { w: 414, h: 335 },
  child_kindergarten_male: { w: 408, h: 328 },
  child_kindergarten_female: { w: 400, h: 336 },
  child_elementary_male: { w: 436, h: 343 },
  child_elementary_female: { w: 323, h: 288 },
};

// 민머리 종횡비 기준으로 다시 계산한 kind별 머리 위 여유값(공식은 위와 동일, HEAD_SIZE
// 대신 HEAD_BALD_SIZE 사용) — useBaldHead=true일 때(=거의 항상) 이 값을 쓴다.
export const HEAD_MARGIN_TOP_BALD_BY_KIND: Record<string, number> = {
  haenyeo: 20.1,
  haenam: 12.8,
  child_toddler_male: 31.1,
  child_toddler_female: 11.7,
  child_kindergarten_male: 10.7,
  child_kindergarten_female: 17.6,
  child_elementary_male: 7.5,
  child_elementary_female: 27.4,
};

export function headMarginTopFor(headKey: string, useBaldHead: boolean): number {
  if (useBaldHead) return HEAD_MARGIN_TOP_BALD_BY_KIND[headKey] ?? HEAD_MARGIN_TOP_BY_KIND[headKey] ?? 90;
  return HEAD_MARGIN_TOP_BY_KIND[headKey] ?? 90;
}

// 해남/해녀를 같은 세계관 스케일로 맞추되, 해녀가 살짝 더 작아 보이도록 하는 키 보정.
// 발 기준선(바닥)은 그대로 두고 위쪽만 줄어들도록 렌더링 쪽에서 하단 정렬로 적용한다
// (CharacterSprite 참고) — 의상도 체형과 한 장으로 묶인 스프라이트라 자동으로 같이 줄어든다.
// child는 예전엔 1(성인과 완전히 같은 키)이었다 — 새싹 그림 자체가 아동 비율(큰 머리)로
// 그려져 있긴 해도 전체 캔버스 높이가 해남/해녀와 거의 같아서(PORTRAIT_SIZE 참고), 선실처럼
// 어른과 나란히 서면 새싹이 어른만큼 커 보이는 체형 문제가 있었다. heightScaleFor()로
// 연령대별로 더 작게 줄인다.
// 해녀는 이제 HaenyeoMasterSprite(별도 MASTER 캔버스 렌더러)를 쓰므로 이 표를 거치지
// 않는다 — 예전에 있던 haenyeo: 0.94 항목은 해녀를 성인 해남보다 작게 그리는 원인 중
// 하나였다("해녀가 새싹처럼 작아 보인다"는 제보). 두 성인 kind는 전역 배율 1이 맞고,
// 실제 키 차이는 각자의 MASTER 원본 체형 차이만으로 남겨야 한다.
export const HEIGHT_SCALE_BY_KIND: Record<string, number> = {};

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
  // 선글라스 — 고글류와 같은 "hat" 슬롯 메커니즘을 그대로 재사용하되(안경도 결국 머리에
  // 고정하는 소품), bottomFrac을 고글류(0.58, 이마 위로 밀어올린 위치)보다 크게(더 아래로)
  // 잡아 실제로 눈에 걸쳐 쓴 것처럼 보이게 한다.
  hat_sunglasses: { w: 92, h: 57 },
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
  hat_captain: { widthFrac: 1.08, bottomFrac: 0.44 },
  hat_hardhat: { widthFrac: 0.96, bottomFrac: 0.5 },
  hat_sailor_cap: { widthFrac: 1.02, bottomFrac: 0.44 },
  hat_sailor_bow: { widthFrac: 1.0, bottomFrac: 0.34 },
  hat_bucket: { widthFrac: 1.05, bottomFrac: 0.46 },
  hat_straw: { widthFrac: 1.15, bottomFrac: 0.32 },
  hat_aviator_white: { widthFrac: 0.95, bottomFrac: 0.52 },
  hat_aviator_blue: { widthFrac: 0.95, bottomFrac: 0.52 },
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
  // bottomFrac이 클수록 머리 위쪽에서 더 내려온 위치(머리 top 기준)라, 이마 위로 밀어올린
  // 고글류(0.58)보다 더 큰 값을 줘야 실제로 눈높이까지 내려온 안경처럼 보인다.
  hat_sunglasses: { widthFrac: 0.72, bottomFrac: 0.68 },
};

// public/images/character/hand_accessories/*.png 실측 크기(design-assets/모자 소품.png에서 크롭).
// 손소품은 머리처럼 별도 레이어가 없는 outfit_full 그림 위에 얹으므로, 모든 의상이 공유하는
// 팔 늘어뜨린 기본 포즈에서 "오른손 부근" 한 점(HAND_ACCESSORY_ANCHOR, OUTFIT_CANVAS 좌표계)에
// 고정 앵커링한다 — 실측: haenam_engine_outfit_01 기준 오른손 중심 약 (310, 300).
// hand_fishing_rod: design-assets/낚시대.png(사용자 업로드)에서 여백만 잘라낸 실측 크기.
// hand_binoculars~hand_compass(10종): design-assets/모자 소품.png(손소품 시트, 기존
// hand_tool_pouch를 크롭했던 것과 같은 시트) 5~6행에서 나머지 손소품류를 마저 크롭한
// 실측 크기 — "손소품 렌더 슬롯 신설" 때 인프라만 만들고 미뤄뒀던 13종 중 목에 거는
// 반다나/보타이 3종(별도 anchor 필요, 이번에 포함 안 함)을 뺀 손에 드는 10종.
export const HAND_SIZE: Record<string, { w: number; h: number }> = {
  hand_tool_pouch: { w: 217, h: 192 },
  hand_fishing_rod: { w: 700, h: 540 },
  hand_binoculars: { w: 227, h: 218 },
  hand_life_ring_bag: { w: 202, h: 231 },
  hand_shell_purse: { w: 181, h: 228 },
  hand_walkie_talkie: { w: 132, h: 238 },
  hand_lantern: { w: 120, h: 229 },
  hand_canteen: { w: 190, h: 216 },
  hand_rope_bracelet: { w: 188, h: 147 },
  hand_satchel_bag: { w: 195, h: 149 },
  hand_scroll: { w: 198, h: 133 },
  hand_compass: { w: 206, h: 155 },
  // hand_umbrella/hand_doll: design-assets/캐릭터 의상 (7).png(시트 7 처리 때 같이 크롭)
  // 우산·인형(불가사리 소품과 마찬가지로 슬롯 없는 소품)을 손소품 슬롯으로 연결.
  hand_umbrella: { w: 77, h: 258 },
  hand_doll: { w: 122, h: 192 },
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
  // 손잡이/끈 고리가 위쪽에 있는 가방·주머니류 — anchorY를 작게 잡아 손 앵커에 그 고리가
  // 걸리듯 오도록.
  hand_binoculars: { widthFrac: 0.22, anchorX: 0.5, anchorY: 0.08 },
  hand_life_ring_bag: { widthFrac: 0.22, anchorX: 0.5, anchorY: 0.06 },
  hand_shell_purse: { widthFrac: 0.2, anchorX: 0.5, anchorY: 0.06 },
  hand_lantern: { widthFrac: 0.14, anchorX: 0.5, anchorY: 0.1 },
  hand_canteen: { widthFrac: 0.2, anchorX: 0.5, anchorY: 0.06 },
  hand_satchel_bag: { widthFrac: 0.22, anchorX: 0.5, anchorY: 0.12 },
  hand_compass: { widthFrac: 0.2, anchorX: 0.5, anchorY: 0.15 },
  // 손잡이 없이 손에 직접 쥐는 기기 — 몸통 중간 높이를 앵커에 맞춘다.
  hand_walkie_talkie: { widthFrac: 0.16, anchorX: 0.5, anchorY: 0.35 },
  // 팔찌(손목에 거는 원형)/두루마리(가운데 띠를 쥠) — 이미지 가운데 근처를 앵커에 맞춘다.
  hand_rope_bracelet: { widthFrac: 0.22, anchorX: 0.5, anchorY: 0.42 },
  hand_scroll: { widthFrac: 0.22, anchorX: 0.5, anchorY: 0.42 },
  // 우산은 고리 손잡이가 위쪽에 있어(지팡이처럼 손잡이를 잡고 아래로 늘어뜨린 모양) 다른
  // 손잡이류와 같은 방식(anchorY 작게). 인형은 품에 안듯 살짝 아래로.
  hand_umbrella: { widthFrac: 0.17, anchorX: 0.5, anchorY: 0.08 },
  hand_doll: { widthFrac: 0.22, anchorX: 0.5, anchorY: 0.15 },
};

export function handAccessorySrc(key: string): string {
  return `/images/character/hand_accessories/${key}.png`;
}

// 목에 거는 소품(반다나/보타이) — 손소품과 같은 원리로 고정 앵커 하나(목선 중앙, OUTFIT_CANVAS
// 좌표계)에 얹는다. design-assets/모자 소품.png 손소품 시트에서 "손소품 렌더 슬롯 신설" 때
// 별도 anchor가 필요해 미뤄뒀던 3종(반다나 2색 + 보타이) — NECK_Y(목선)를 그대로 기준으로 쓴다.
export const NECK_SIZE: Record<string, { w: number; h: number }> = {
  neck_bandana_blue: { w: 180, h: 169 },
  neck_bandana_red: { w: 170, h: 165 },
  neck_bow_tie_navy: { w: 186, h: 145 },
};

export const NECK_ACCESSORY_ANCHOR = { x: OUTFIT_CANVAS_W / 2, y: NECK_Y + 5 };

// widthFrac: OUTFIT_CANVAS_W 대비 소품 폭 비율. anchorX/anchorY: 소품 이미지 안에서
// NECK_ACCESSORY_ANCHOR에 맞출 상대 위치(0~1) — 매듭/중심 부분을 목선에 맞춘다.
export const NECK_PLACEMENT: Record<string, { widthFrac: number; anchorX: number; anchorY: number }> = {
  neck_bandana_blue: { widthFrac: 0.34, anchorX: 0.5, anchorY: 0.25 },
  neck_bandana_red: { widthFrac: 0.32, anchorX: 0.5, anchorY: 0.25 },
  neck_bow_tie_navy: { widthFrac: 0.3, anchorX: 0.5, anchorY: 0.3 },
};

export function neckAccessorySrc(key: string): string {
  return `/images/character/neck_accessories/${key}.png`;
}

export function outfitFullSrc(assetKey: string): string {
  return `/images/character/outfit_full/${assetKey}.png`;
}

// scripts/asset-tools 로 생성 — 해녀/해남/새싹 민머리 베이스 + 헤어스타일 오버레이 배치값.
// widthFrac/leftFrac/topFrac은 headRenderW/headRenderH(렌더된 머리 폭/높이) 기준 비율.
//
// 해녀 20종(haenyeo_01~20)은 전부 같은 값 하나(HAENYEO_HAIR_PLACEMENT)를 쓴다 — 예전엔
// 헤어마다 다른 topFrac을 하나씩 손으로 잡았는데(심지어 한때는 20개 전부 -0.1379로 똑같은
// 값을 그냥 복사해 쓴 적도 있었다), 헤어 PNG마다 "앞머리가 끝나는 지점"이 제각각이라 개별
// 보정값이 하나라도 어긋나면 헤어 중심과 얼굴 중심이 안 맞거나, 정수리 위로 대머리가 보이거나,
// 심한 경우 원피스처럼 얼굴을 완전히 덮어버리는 문제가 반복됐다. 이제는 정렬 오프셋을 코드가
// 아니라 PNG 자체에 구워 넣는다 — scripts/asset-tools/normalize_haenyeo_hair.py가 20종 전부를
// base/head_bald/haenyeo.png(340x290)와 같은 좌표계의 공유 마스터 캔버스(380x600, 머리
// 원점이 캔버스의 (20,140))에 재배치해 public/images/character/haenyeo/hair_normalized/에
// 저장했다. 그 결과 20개 PNG는 전부 같은 크기·같은 좌표계라 런타임에서 헤어마다 다른 숫자를
// 쓸 필요가 없어졌다 — 이 표에 남은 해녀 항목이 전부 동일한 값인 건 실수가 아니라 의도다.
const HAENYEO_HAIR_PLACEMENT = { widthFrac: 380 / 340, leftFrac: -20 / 340, topFrac: -140 / 290, w: 380, h: 600 };
// 뒷머리(behind-face) 예외 2종 — haenyeo_19/20은 다른 18장과 달리 정면에 얼굴이 비칠 "구멍"이
// 전혀 없는 통짜 그림이다(중앙 세로 밴드 알파 스캔 결과 전체 높이의 90% 이상 구간에서 커버리지가
// 0으로 안 떨어짐). 원본을 새로 그리거나 잘라내지 않고 그대로 쓰는 유일한 방법은 얼굴보다
// 뒤에 그리는 것뿐이라(정수리 부근 리본/집게핀만 얼굴 위로 살짝 보이고 나머지는 옆·아래로
// 자연스럽게 흘러내림), CharacterSprite.tsx에서 이 두 키만 얼굴보다 먼저(뒤에) 그리도록
// 분기한다 — "헤어별 CSS 보정"이 아니라 이 2건에 한해 필요한 레이어 순서 예외임을 명시적으로
// 기록해둔다(정렬 좌표 자체는 위 HAENYEO_HAIR_PLACEMENT와 동일한 공식을 그대로 쓴다).
export const HAENYEO_HAIR_BACK_LAYER_KEYS = new Set(["haenyeo_19", "haenyeo_20"]);
export const HAIR_ASSET_PLACEMENT: Record<string, { widthFrac: number; leftFrac: number; topFrac: number; w: number; h: number }> = {
  haenyeo_01: HAENYEO_HAIR_PLACEMENT,
  haenyeo_02: HAENYEO_HAIR_PLACEMENT,
  haenyeo_03: HAENYEO_HAIR_PLACEMENT,
  haenyeo_04: HAENYEO_HAIR_PLACEMENT,
  haenyeo_05: HAENYEO_HAIR_PLACEMENT,
  haenyeo_06: HAENYEO_HAIR_PLACEMENT,
  haenyeo_07: HAENYEO_HAIR_PLACEMENT,
  haenyeo_08: HAENYEO_HAIR_PLACEMENT,
  haenyeo_09: HAENYEO_HAIR_PLACEMENT,
  haenyeo_10: HAENYEO_HAIR_PLACEMENT,
  haenyeo_11: HAENYEO_HAIR_PLACEMENT,
  haenyeo_12: HAENYEO_HAIR_PLACEMENT,
  haenyeo_13: HAENYEO_HAIR_PLACEMENT,
  haenyeo_14: HAENYEO_HAIR_PLACEMENT,
  haenyeo_15: HAENYEO_HAIR_PLACEMENT,
  haenyeo_16: HAENYEO_HAIR_PLACEMENT,
  haenyeo_17: HAENYEO_HAIR_PLACEMENT,
  haenyeo_18: HAENYEO_HAIR_PLACEMENT,
  haenyeo_19: HAENYEO_HAIR_PLACEMENT,
  haenyeo_20: HAENYEO_HAIR_PLACEMENT,
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
// 2026-09-07 사용자 지시: 해녀는 20종 중 얼굴을 심하게 가리거나(01,02,04,08,09,10,13,14,15,18)
// 정면용 앞머리가 아예 없는(19,20) 것들을 빼고, 검수를 통과한 8종(03,05,06,07,11,12,16,17)만
// 선택 가능해야 한다. 기존 이름(pony/bun)은 그 번호 자체가 빠졌으므로 실제로 존재하는 번호 중
// 디자인이 그나마 가까운 것으로 다시 연결했다 — pony(포니테일)→17(사이드 포니), bun(올림머리)
// →07(하프업 번). bangs/braid/layered는 새로 추가한 이름(05/12/16).
export const HAIR_STYLE_INDEX: Record<"haenyeo" | "haenam" | "child", Partial<Record<string, string>>> = {
  haenyeo: { wave: "03", bob: "06", twin: "11", bun: "07", pony: "17", bangs: "05", braid: "12", layered: "16" },
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
// 해녀만 hair_normalized 하위 폴더를 쓴다 — scripts/asset-tools/normalize_haenyeo_hair.py로
// 공유 마스터 캔버스에 재배치한 결과물이며, 원본(hair/)은 그대로 보존돼 있다. 해남/새싹은
// 이번 작업 범위가 아니라 건드리지 않았다.
export function hairOverlaySrc(portraitKey: CharacterPortraitKey, styleIndex: string): string {
  const group = portraitKey.kind;
  if (group === "child") {
    const headKey = characterPortraitKeyFor(portraitKey);
    return `/images/character/child/hair/${headKey}/child_hair_${styleIndex}.png`;
  }
  if (group === "haenyeo") {
    return `/images/character/haenyeo/hair_normalized/haenyeo_hair_${styleIndex}.png`;
  }
  return `/images/character/${group}/hair/${group}_hair_${styleIndex}.png`;
}

export function hairOverlayMaskSrc(portraitKey: CharacterPortraitKey, styleIndex: string): string {
  const group = portraitKey.kind;
  if (group === "child") {
    const headKey = characterPortraitKeyFor(portraitKey);
    return `/images/character/child/hair/${headKey}/masks/child_hair_${styleIndex}_mask.png`;
  }
  if (group === "haenyeo") {
    return `/images/character/haenyeo/hair_normalized/masks/haenyeo_hair_${styleIndex}_mask.png`;
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

// 옷가게 헤어 카탈로그 sku(예: "child_hair_bob", "haenyeo_hair_wave")는 마지막
// "_hair_" 뒤에 HairStyle 값이 그대로 붙는 명명 규칙이라, 여기서 스타일명을 뽑아
// hairOverlaySrc와 같은 실제 헤어 오버레이 PNG 경로를 돌려준다 — 옷가게 썸네일이
// 실제 착용 시 보이는 그림과 정확히 같아진다(기존엔 sku가 ITEM_ICON_SKUS 화이트리스트에
// 없어 항상 null → 이름 텍스트만 뜨는 플레이스홀더로 빠졌었다).
export function hairCatalogPreviewSrc(sku: string, portraitKey: CharacterPortraitKey): string | null {
  const style = sku.split("_hair_").pop();
  if (!style) return null;
  const idx = HAIR_STYLE_INDEX[portraitKey.kind]?.[style];
  if (!idx) return null;
  return hairOverlaySrc(portraitKey, idx);
}

// =========================================================
// 해녀 MASTER 전신 캔버스 (scripts/asset-tools/build_haenyeo_master_canvas.py)
// =========================================================
// 런타임 topFrac/widthFrac/scaleX/scaleY 보정을 전부 없애기 위해, 해녀의 몸/얼굴/헤어/
// 의상을 전부 같은 441x906 캔버스로 미리 구워 저장했다. 이 캔버스 안에서는 모든 레이어가
// 이미 같은 좌표계라 CharacterSprite는 이 넷을 순서대로 겹쳐 그리기만 하면 된다 —
// position:absolute, inset:0, width/height:100%. 개별 레이어 보정 없음.
//
// 캔버스 규격(441x906)과 키포인트는 scripts/asset-tools/build_master_keypoint_guides.py가
// 실측해 만든 가이드 이미지(public/images/character/master/guides/haenyeo_template_guide.png,
// 사용자에게 전달됨)와 정확히 같은 값이다 — 2026-09-06 사용자가 업로드한 새
// haenyeo_outfit_06/08~20.png가 바로 이 가이드 좌표계에 맞춰 그려졌기 때문에, 이 상수를
// 가이드와 다르게 두면 새 의상이 몸에서 어긋난다.
export const HAENYEO_MASTER_CANVAS_W = 441;
export const HAENYEO_MASTER_CANVAS_H = 906;
// 목선/손목/발바닥 y좌표 — 검수 화면에서 가이드선으로만 쓰고, 렌더링에는 쓰지 않는다
// (레이어 자체가 이미 이 좌표에 맞게 저장돼 있어서 런타임 계산이 필요 없다).
export const HAENYEO_MASTER_NECK_Y = 503;
export const HAENYEO_MASTER_WRIST_Y = 685;
export const HAENYEO_MASTER_SOLE_Y = 876;
export const HAENYEO_MASTER_CENTER_X = 219.5;

const HAENYEO_MASTER_DIR = "/images/character/master";
// 19/20번(얼굴 구멍이 없던 통짜 그림)만 뒷머리 조각이 별도로 있다 — 나머지 18종은
// 원래부터 정면 그림 자체에 얼굴이 비치는 구멍이 뚫려 있어 뒷머리가 따로 필요 없다.
export const HAENYEO_MASTER_HAIR_BACK_KEYS = new Set(["19", "20"]);

// 2026-09-07 사용자 결정 — 눈 가림 정량 실측(눈 좌표 반경 16px 알파 커버리지) 결과에 따라
// 확정한 선택 가능 8종. 나머지 12종(01,02,04,08,09,10,13,14,15,18 — 얼굴을 심하게 가림,
// 19,20 — 정면 앞머리 없음)은 새 원화가 올라오기 전까지 선택 목록에서 뺀다. 렌더러 자체는
// 남겨둔다(기존에 이미 이 스타일을 쓰는 캐릭터가 있을 수 있음 — 아래 haenyeoResolveHairIdx가
// 화면에는 안전한 기본값(03)으로 대체해서 보여준다).
export const HAENYEO_HAIR_VALID_KEYS = new Set(["03", "05", "06", "07", "11", "12", "16", "17"]);
export const HAENYEO_HAIR_DEFAULT_KEY = "03";
export const HAENYEO_HAIR_HIDDEN_FROM_PICKER = new Set(
  Array.from({ length: 20 }, (_, i) => `${i + 1}`.padStart(2, "0")).filter(
    (k) => !HAENYEO_HAIR_VALID_KEYS.has(k)
  )
);

// 저장된 hairStyle이 가리키는 번호가 선택 목록에서 빠진 것이면(예전에 hair_style_index가
// 가리키던 09/10처럼) 깨진 헤어를 그대로 보여주지 않고 정상 기본 헤어(03)로 표시한다 —
// DB 값 자체를 바꾸지는 않는다(재접속해도 원래 선택은 남아 있고, 그 스타일 원화가 올라오면
// 다시 정상적으로 보인다).
export function haenyeoResolveHairIdx(idx: string | null): string | null {
  if (idx === null) return null;
  return HAENYEO_HAIR_VALID_KEYS.has(idx) ? idx : HAENYEO_HAIR_DEFAULT_KEY;
}

// 2026-09-07 사용자 지적 + 실측 확인: 08(상의 없이 장화만), 14(상의 없이 스커트만),
// 17(베레모가 머리가 아니라 목/가슴 위치에 그려짐) — 전부 design-assets 원본 파일
// 자체의 결함이다(내 파이프라인이 만든 게 아니라 업로드된 raw PNG를 그대로 열어서
// 확인함). 재업로드 전까지 실제 존재하는 목록(AVAILABLE)에서도 별도로 걸러낸다.
export const HAENYEO_OUTFIT_INVALID_KEYS = new Set(
  ["08", "14", "17"].map((n) => `haenyeo_custom_outfit_${n}`)
);

// 헤어를 쓰지 않을 때(민머리)는 원본 MASTER 몸을, 헤어를 쓸 때는 그 헤어 전용으로 미리 구운
// 변형(민머리 정수리 외곽선이 두피 위 얇은 링만큼 지워진 버전 — build_haenyeo_master_canvas.py의
// build_hair_body_variants 참고)을 쓴다. 얼굴 오val·귀는 그 변형에서도 항상 그대로 보존된다.
export function haenyeoMasterBodySrc(hairIdx?: string | null): string {
  if (hairIdx && HAENYEO_HAIR_VALID_KEYS.has(hairIdx)) {
    return `${HAENYEO_MASTER_DIR}/haenyeo_bald_body_hair_${hairIdx}.png`;
  }
  return `${HAENYEO_MASTER_DIR}/haenyeo_bald_body.png`;
}

export function haenyeoMasterSkinMaskSrc(): string {
  return `${HAENYEO_MASTER_DIR}/haenyeo_bald_skin_mask.png`;
}

// 2026-09-06 사용자가 GitHub에 직접 업로드한 haenyeo_outfit_06/08~20.png(14종)만 실제
// 에셋이 존재한다. 01~05, 07(6종)은 아직 업로드되지 않았다(사용자가 추후 업로드 예정) —
// build_haenyeo_master_canvas.py도 이 6종은 만들지 않는다. 이 목록은 그 스크립트의 산출물과
// 정확히 일치해야 한다(스크립트를 다시 돌려 새 번호가 추가되면 이 표도 같이 갱신).
//
// 2026-09-07 사용자 결정: haenyeo_outfit_06 등 기존 번호형 asset key는 이미 예전 SKU
// (haenyeo_outfit_sweatshirt 등)가 물고 있어서, 새 원화를 그 이름으로 저장하면 기존 상품이
// 자동으로 다른 그림을 입게 된다("기존 상품 이미지를 바꾸지 마라"는 지시 위반). 그래서
// 파이프라인 산출물은 haenyeo_custom_outfit_NN.png로 저장하고, 이 목록도 그 이름을 쓴다 —
// 기존 haenyeo_outfit_NN(번호만 있는) 키는 이제 어떤 목록에도 없으므로 항상 "없음"으로
// 처리돼 대체 없이 생략된다(기존 SKU가 새 그림을 입는 사고 방지).
export const HAENYEO_OUTFIT_AVAILABLE_KEYS = new Set(
  ["06", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20"].map(
    (n) => `haenyeo_custom_outfit_${n}`
  )
);
export const HAENYEO_OUTFIT_MISSING_KEYS = new Set(
  ["01", "02", "03", "04", "05", "07"].map((n) => `haenyeo_custom_outfit_${n}`)
);
// 파일은 존재하지만(AVAILABLE) 원본 자체가 깨져 있어(HAENYEO_OUTFIT_INVALID_KEYS 참고) 정상
// 상품으로 쓸 수 없는 것까지 제외한, 실제로 "검수 통과"한 목록. QA 그리드·옷가게 후보는
// 전부 이 목록만 써야 한다.
export const HAENYEO_OUTFIT_VALID_KEYS = new Set(
  Array.from(HAENYEO_OUTFIT_AVAILABLE_KEYS).filter((k) => !HAENYEO_OUTFIT_INVALID_KEYS.has(k))
);
// 2026-09-06 사용자 지시: 없는 의상을 다른 번호로 대체하지 않는다(같은 옷이 여러 상품으로
// 중복 노출되는 문제 때문에 폐기). 원본이 없거나(MISSING) 원본이 깨져 있으면(INVALID) 그
// 캐릭터는 의상 레이어 없이(MASTER 몸 자체의 기본 이너웨어만) 렌더링하고, 정확히 무엇이
// 문제인지만 개발 로그에 남긴다 — 호출부(HaenyeoMasterSprite)가 null을 받으면 <Image>를
// 아예 렌더링하지 않는다.
// design-assets에는 항상 haenyeo_outfit_NN.png(번호만)로 업로드된다 — 로그에는 실제
// 업로드 파일명을 보여준다(custom_ 접두사는 상품/렌더링 키 전용, 업로드 파일명이 아님).
function haenyeoOutfitSourceFileName(outfitAssetKey: string): string {
  const num = outfitAssetKey.match(/(\d{2})$/)?.[1];
  return num ? `haenyeo_outfit_${num}.png` : `${outfitAssetKey}.png`;
}

export function haenyeoMasterOutfitSrc(outfitAssetKey: string): string | null {
  if (HAENYEO_OUTFIT_INVALID_KEYS.has(outfitAssetKey)) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn(
        `[haenyeo] design-assets/${haenyeoOutfitSourceFileName(outfitAssetKey)} 원본 결함(불완전한 의상/좌표 이상) — 의상 레이어 생략, 재업로드 필요`
      );
    }
    return null;
  }
  if (!HAENYEO_OUTFIT_AVAILABLE_KEYS.has(outfitAssetKey)) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn(
        `[haenyeo] outfitAssetKey "${outfitAssetKey}" 에 연결된 MASTER 파이프라인 산출물 없음 — 의상 레이어 생략(다른 번호로 대체하지 않음)`
      );
    }
    return null;
  }
  return `${HAENYEO_MASTER_DIR}/haenyeo_outfit/${outfitAssetKey}.png`;
}

export function haenyeoMasterHairFrontSrc(styleIndex: string): string {
  return `${HAENYEO_MASTER_DIR}/haenyeo_hair_front/haenyeo_hair_${styleIndex}.png`;
}

export function haenyeoMasterHairFrontMaskSrc(styleIndex: string): string {
  return `${HAENYEO_MASTER_DIR}/haenyeo_hair_front/masks/haenyeo_hair_${styleIndex}_mask.png`;
}

export function haenyeoMasterHairBackSrc(styleIndex: string): string {
  return `${HAENYEO_MASTER_DIR}/haenyeo_hair_back/haenyeo_hair_${styleIndex}.png`;
}
