// 가구 종류별 배치 규칙(크기/배치영역/스케일/방향 제약) — item_catalog에 새 컬럼을 추가하는
// 대신 sku 이름 패턴으로 furnitureKind를 분류해 종류별 기본값을 적용하고, 정말 필요한 소수의
// 아이템만 SKU_OVERRIDES로 예외 처리한다("100개를 하나씩 하드코딩" 방지, 기존 카탈로그/에셋은
// 그대로 재사용).
//
// 방향(facing) 관련 설계 원칙: 기존 가구 에셋은 전부 단일 각도로 그려진 그림이고 방향별
// 스프라이트가 없다. 그래서 "모든 가구를 모든 방향/모든 벽에 자유배치"하는 대신, 각 furnitureKind가
// 실제로 자연스러워 보이는 배치영역(allowedZones)만 허용하고, CSS rotate(90deg) 같은 걸로
// 다른 방향인 척 만들지 않는다(방향이 다르면 원근/광원이 깨짐). 좌우 대칭이라 flip만으로
// 자연스러운 것만 mirrorSafe로 표시해 반전을 허용한다. 새 방향별 에셋이 생기면
// supportedFacings 배열에 추가하고 SKU_OVERRIDES로 그 아이템만 확장하면 된다 — 구조 자체는
// 이미 그 확장을 지원한다.

import type { CSSProperties } from "react";
import { ROOM_ZONES, WALL_BOUNDS } from "@/lib/domain/cabinDecor";

export type PlacementType = "floor" | "wall" | "rug" | "free";

// 가구가 실제로 그려진(고정된) 단일 시점. "전환 가능한 방향"이 아니라 "이 그림은 원래 이
// 방향으로 그려졌다"는 정보용 값 — 새 방향 에셋이 생기기 전까지는 이 하나만 지원한다.
export type Facing = "front-left" | "front-right" | "front" | "wall";

// 배치 타입별로 드래그 가능한 영역(바운딩 박스)을 돌려준다. 기존 RoomBackground의
// ROOM_CLIP 폴리곤에서 뽑은 바운딩 박스를 그대로 재사용한다(새로 좌표를 따지 않음).
export function zoneBoundsFor(placementType: PlacementType) {
  if (placementType === "wall") return WALL_BOUNDS;
  if (placementType === "free") return { xMin: 0, xMax: 1, yMin: 0, yMax: 1 };
  return ROOM_ZONES.floor; // floor, rug 모두 바닥 영역 사용
}

// 바닥 y좌표를 기본 depth로 삼고(아래쪽일수록 앞), 사용자가 앞으로/뒤로 조정한 zIndex를
// 그 위에 더한다. y 차이(최대 1000)가 통상적인 zIndex 조정 폭보다 훨씬 커서, 화면 위/아래처럼
// 멀리 떨어진 가구끼리는 항상 y가 우선하고, 비슷한 y에서 겹치는 경우에만 zIndex로 순서가 뒤집힌다.
export function depthOf(y: number, zIndex: number): number {
  return y * 1000 + zIndex;
}

// 방(aspect-ratio로 높이가 고정된 컨테이너) 안에서 가구 한 점을 절대 위치시키는 스타일.
// groundAnchorX/Y(기본 0.5, 1 — 바닥 접점=발밑) 기준으로 앵커링해서 크기를 키워도 바닥
// 위치가 크게 흔들리지 않는다. 현재 모든 가구 이미지가 하단 여백 없이 꽉 차게 크롭돼 있어
// (public/images/items alpha bbox 확인됨) groundAnchor는 사실상 항상 (0.5, 1)이지만,
// 나중에 여백이 있는 에셋이 추가되면 아이템별로 조정할 수 있도록 파라미터로 열어둔다.
export function furnitureWrapperStyle(params: {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  flipX: boolean;
  depth: number;
  baseHeightFrac: number;
  groundAnchorX?: number;
  groundAnchorY?: number;
}): CSSProperties {
  const { x, y, scale, rotation, flipX, depth, baseHeightFrac, groundAnchorX = 0.5, groundAnchorY = 1 } = params;
  return {
    position: "absolute",
    left: `${x * 100}%`,
    top: `${y * 100}%`,
    height: `${baseHeightFrac * scale * 100}%`,
    transform: `translate(-${groundAnchorX * 100}%, -${groundAnchorY * 100}%) rotate(${rotation}deg) scaleX(${flipX ? -1 : 1})`,
    transformOrigin: `${groundAnchorX * 100}% ${groundAnchorY * 100}%`,
    zIndex: Math.round(depth * 10),
  };
}

export interface PlacementDef {
  // 이 가구가 어떤 종류인지(분류 라벨) — 가구 분류표/디버깅용으로 그대로 노출한다.
  furnitureKind: FurnitureKind;
  placementType: PlacementType;
  // placementType과 동일하지만 "이 가구가 기본으로 놓이길 원하는 영역"이라는 의미를 명시.
  // allowedZones가 여러 개로 늘어나도(향후) preferredZone은 기본 스폰 위치 계산에 쓰인다.
  preferredZone: PlacementType;
  // 드래그로 이동 가능한 배치영역 목록. 지금은 항상 [preferredZone] 하나뿐이지만(방향별
  // 에셋이 없어 다른 영역에 놓으면 부자연스러움), 배열로 열어둬서 나중에 벽/바닥 겸용 같은
  // 가구가 추가되면 그대로 확장할 수 있다.
  allowedZones: PlacementType[];
  // 방 컨테이너 높이 대비 아이템 렌더 높이 비율(scale=1 기준). 실제 렌더 크기 = 컨테이너 높이 *
  // baseHeightFrac * item.scale. 가구 원본 이미지 비율은 그대로 유지하고(aspect-ratio 보존),
  // 높이 기준으로만 정규화해 침대처럼 가로로 넓은 가구도 자연스럽게 크게 보이게 한다.
  baseHeightFrac: number;
  defaultScale: number;
  minScale: number;
  maxScale: number;
  defaultFacing: Facing;
  // 현재 지원되는(에셋이 실제로 존재하는) 방향 목록 — 지금은 항상 [defaultFacing] 하나뿐.
  // 새 방향 에셋이 추가되면 이 배열에 더하고 SKU_OVERRIDES로 그 아이템만 확장한다.
  supportedFacings: Facing[];
  // scaleX(-1) 좌우반전만으로 자연스럽게 방향을 바꿀 수 있는지. 침대/수납장/가전처럼 손잡이·
  // 헤드보드 등 좌우 비대칭 디테일이 있을 가능성이 높은 카테고리는 기본 false로 두고, 실제로
  // 확인된 특정 아이템만 SKU_OVERRIDES에서 true로 뒤집는다.
  mirrorSafe: boolean;
  groundAnchorX: number;
  groundAnchorY: number;
}

export type FurnitureKind = "bed" | "table" | "seat" | "storage" | "rug" | "lamp" | "wallDeco" | "smallDeco" | "appliance";

// 각 furnitureKind가 "zone-fixed"(단일 배치영역 고정)인지, wall-only인지, mirror-safe인지,
// 방향별 에셋이 생기면 덕을 볼 future-directional-needed 후보인지 — 가구 분류표
// (docs/PROGRESS.md에 표로도 정리)의 근거가 되는 원본 데이터.
const CATEGORY_DEFAULTS: Record<FurnitureKind, Omit<PlacementDef, "furnitureKind">> = {
  bed: {
    placementType: "floor",
    preferredZone: "floor",
    allowedZones: ["floor"],
    baseHeightFrac: 0.34,
    defaultScale: 1,
    minScale: 0.8,
    maxScale: 1.3,
    defaultFacing: "front-left",
    supportedFacings: ["front-left"],
    mirrorSafe: false,
    groundAnchorX: 0.5,
    groundAnchorY: 1,
  },
  table: {
    placementType: "floor",
    preferredZone: "floor",
    allowedZones: ["floor"],
    baseHeightFrac: 0.26,
    defaultScale: 1,
    minScale: 0.75,
    maxScale: 1.35,
    defaultFacing: "front-right",
    supportedFacings: ["front-right"],
    mirrorSafe: true,
    groundAnchorX: 0.5,
    groundAnchorY: 1,
  },
  seat: {
    placementType: "floor",
    preferredZone: "floor",
    allowedZones: ["floor"],
    baseHeightFrac: 0.24,
    defaultScale: 1,
    minScale: 0.75,
    maxScale: 1.35,
    defaultFacing: "front-right",
    supportedFacings: ["front-right"],
    mirrorSafe: true,
    groundAnchorX: 0.5,
    groundAnchorY: 1,
  },
  storage: {
    placementType: "floor",
    preferredZone: "floor",
    allowedZones: ["floor"],
    baseHeightFrac: 0.36,
    defaultScale: 1,
    minScale: 0.8,
    maxScale: 1.3,
    defaultFacing: "front-right",
    supportedFacings: ["front-right"],
    mirrorSafe: false,
    groundAnchorX: 0.5,
    groundAnchorY: 1,
  },
  appliance: {
    placementType: "floor",
    preferredZone: "floor",
    allowedZones: ["floor"],
    baseHeightFrac: 0.3,
    defaultScale: 1,
    minScale: 0.8,
    maxScale: 1.3,
    defaultFacing: "front-right",
    supportedFacings: ["front-right"],
    mirrorSafe: false,
    groundAnchorX: 0.5,
    groundAnchorY: 1,
  },
  rug: {
    placementType: "rug",
    preferredZone: "rug",
    allowedZones: ["rug"],
    baseHeightFrac: 0.16,
    defaultScale: 1,
    minScale: 0.85,
    maxScale: 1.4,
    defaultFacing: "front",
    supportedFacings: ["front"],
    mirrorSafe: true,
    groundAnchorX: 0.5,
    groundAnchorY: 1,
  },
  lamp: {
    placementType: "floor",
    preferredZone: "floor",
    allowedZones: ["floor"],
    baseHeightFrac: 0.3,
    defaultScale: 1,
    minScale: 0.8,
    maxScale: 1.3,
    defaultFacing: "front",
    supportedFacings: ["front"],
    mirrorSafe: true,
    groundAnchorX: 0.5,
    groundAnchorY: 1,
  },
  wallDeco: {
    placementType: "wall",
    preferredZone: "wall",
    allowedZones: ["wall"],
    baseHeightFrac: 0.18,
    defaultScale: 1,
    minScale: 0.7,
    maxScale: 1.4,
    defaultFacing: "wall",
    supportedFacings: ["wall"],
    mirrorSafe: true,
    groundAnchorX: 0.5,
    groundAnchorY: 1,
  },
  smallDeco: {
    placementType: "floor",
    preferredZone: "floor",
    allowedZones: ["floor"],
    baseHeightFrac: 0.14,
    defaultScale: 1,
    minScale: 0.7,
    maxScale: 1.6,
    defaultFacing: "front",
    supportedFacings: ["front"],
    mirrorSafe: true,
    groundAnchorX: 0.5,
    groundAnchorY: 1,
  },
};

// [정규식, furnitureKind] 순서대로 첫 매치를 사용. 침대/러그처럼 넓은 이름 매치가 우선되도록
// 구체적인 패턴을 앞에 둔다.
const RULES: [RegExp, FurnitureKind][] = [
  [/bed|crib|bunk/, "bed"],
  [/rug|carpet/, "rug"],
  [/(floor_lamp|stand_light|nightstand_lamp|dresser_lamp)/, "lamp"],
  [/(frame|mirror|clock|porthole_window|curtains|wall_shelf|coat_hook|sailor_coat_hooks|bell$)/, "wallDeco"],
  [/(fridge|tv|record_player)/, "appliance"],
  [/(shelf|wardrobe|cabinet|drawer|dresser|chest|closet|bookshelf)/, "storage"],
  [/(desk|table|cart|island|sideboard|vanity(?!_stool)|nightstand(?!_lamp))/, "table"],
  [/(chair|stool|bench|sofa|armchair|ottoman|recliner|chaise|loveseat|rocking|beanbag|cushion$)/, "seat"],
  [/porthole$/, "wallDeco"],
];

export function classify(sku: string): FurnitureKind {
  for (const [re, kind] of RULES) {
    if (re.test(sku)) return kind;
  }
  return "smallDeco";
}

// furnitureKind 규칙만으로는 어색한 소수의 특정 아이템만 여기서 override한다.
const SKU_OVERRIDES: Record<string, Partial<PlacementDef>> = {
  furniture_porthole: { placementType: "wall", preferredZone: "wall", allowedZones: ["wall"], baseHeightFrac: 0.2 },
  interior_porthole_window: { placementType: "wall", preferredZone: "wall", allowedZones: ["wall"], baseHeightFrac: 0.2 },
  interior_lighthouse_frame: { baseHeightFrac: 0.22 },
  interior_string_lights: { baseHeightFrac: 0.1 },
  interior_bunting_flags: { baseHeightFrac: 0.1 },
  interior_seagull_mobile: { baseHeightFrac: 0.14 },
  furniture_rug: { placementType: "rug", preferredZone: "rug", allowedZones: ["rug"] },
  interior_oval_rug: { placementType: "rug", preferredZone: "rug", allowedZones: ["rug"] },
  interior_folding_screen: { baseHeightFrac: 0.34 },
  interior_bunk_bed: { baseHeightFrac: 0.4 },
  interior_baby_crib: { baseHeightFrac: 0.3 },
  // 협탁 위에 놓는 소형 탁상시계 — "clock" 정규식이 벽시계로 잘못 분류하는 것을 바로잡음.
  interior_nightstand_clock: { placementType: "floor", preferredZone: "floor", allowedZones: ["floor"], baseHeightFrac: 0.12 },
  // 빈티지 가구 시리즈 원본 시트에 실제로 좌/우로 튼 3/4 각도 그림이 따로 있는 유일한 아이템 —
  // furnitureFacingAssets.ts의 FURNITURE_FACING_ASSETS와 짝을 맞춰 방향 전환을 지원한다.
  vintage_shell_bed: { defaultFacing: "front", supportedFacings: ["front", "front-left", "front-right"] },
};

export function getPlacementDef(sku: string | null | undefined): PlacementDef {
  const kind = sku ? classify(sku) : "smallDeco";
  const base: PlacementDef = { furnitureKind: kind, ...CATEGORY_DEFAULTS[kind] };
  const override = sku ? SKU_OVERRIDES[sku] : undefined;
  return override ? { ...base, ...override } : base;
}
