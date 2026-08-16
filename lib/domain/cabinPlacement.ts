// 가구 종류별 배치 규칙(크기/배치영역/스케일 범위) — item_catalog에 새 컬럼을 추가하는 대신
// sku 이름 패턴으로 카테고리를 분류해 카테고리 기본값을 적용하고, 정말 필요한 소수의 아이템만
// SKU_OVERRIDES로 예외 처리한다("100개를 하나씩 하드코딩" 방지, 기존 카탈로그/에셋은 그대로 재사용).

import type { CSSProperties } from "react";
import { ROOM_ZONES, WALL_BOUNDS } from "@/lib/domain/cabinDecor";

export type PlacementType = "floor" | "wall" | "rug" | "free";

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
// 바닥 접점(발밑) 기준으로 앵커링해서 크기를 키워도 바닥 위치가 크게 흔들리지 않게 한다.
export function furnitureWrapperStyle(params: {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  flipX: boolean;
  depth: number;
  baseHeightFrac: number;
}): CSSProperties {
  const { x, y, scale, rotation, flipX, depth, baseHeightFrac } = params;
  return {
    position: "absolute",
    left: `${x * 100}%`,
    top: `${y * 100}%`,
    height: `${baseHeightFrac * scale * 100}%`,
    transform: `translate(-50%, -100%) rotate(${rotation}deg) scaleX(${flipX ? -1 : 1})`,
    transformOrigin: "bottom center",
    zIndex: Math.round(depth * 10),
  };
}

export interface PlacementDef {
  placementType: PlacementType;
  // 방 컨테이너 높이 대비 아이템 렌더 높이 비율(scale=1 기준). 실제 렌더 크기 = 컨테이너 높이 *
  // baseHeightFrac * item.scale. 가구 원본 이미지 비율은 그대로 유지하고(aspect-ratio 보존),
  // 높이 기준으로만 정규화해 침대처럼 가로로 넓은 가구도 자연스럽게 크게 보이게 한다.
  baseHeightFrac: number;
  defaultScale: number;
  minScale: number;
  maxScale: number;
}

type Category = "bed" | "table" | "seat" | "storage" | "rug" | "lamp" | "wallDeco" | "smallDeco" | "appliance";

const CATEGORY_DEFAULTS: Record<Category, PlacementDef> = {
  bed: { placementType: "floor", baseHeightFrac: 0.34, defaultScale: 1, minScale: 0.8, maxScale: 1.3 },
  table: { placementType: "floor", baseHeightFrac: 0.26, defaultScale: 1, minScale: 0.75, maxScale: 1.35 },
  seat: { placementType: "floor", baseHeightFrac: 0.24, defaultScale: 1, minScale: 0.75, maxScale: 1.35 },
  storage: { placementType: "floor", baseHeightFrac: 0.36, defaultScale: 1, minScale: 0.8, maxScale: 1.3 },
  appliance: { placementType: "floor", baseHeightFrac: 0.3, defaultScale: 1, minScale: 0.8, maxScale: 1.3 },
  rug: { placementType: "rug", baseHeightFrac: 0.16, defaultScale: 1, minScale: 0.85, maxScale: 1.4 },
  lamp: { placementType: "floor", baseHeightFrac: 0.3, defaultScale: 1, minScale: 0.8, maxScale: 1.3 },
  wallDeco: { placementType: "wall", baseHeightFrac: 0.18, defaultScale: 1, minScale: 0.7, maxScale: 1.4 },
  smallDeco: { placementType: "floor", baseHeightFrac: 0.14, defaultScale: 1, minScale: 0.7, maxScale: 1.6 },
};

// [정규식, 카테고리] 순서대로 첫 매치를 사용. 침대/러그처럼 넓은 이름 매치가 우선되도록 구체적인
// 패턴을 앞에 둔다.
const RULES: [RegExp, Category][] = [
  [/bed/, "bed"],
  [/rug|carpet/, "rug"],
  [/(floor_lamp|stand_light|nightstand_lamp|dresser_lamp)/, "lamp"],
  [/(frame|mirror|clock|porthole_window|curtains|wall_shelf|coat_hook|sailor_coat_hooks|bell$)/, "wallDeco"],
  [/(fridge|tv|record_player)/, "appliance"],
  [/(shelf|wardrobe|cabinet|drawer|dresser|chest|closet|bookshelf)/, "storage"],
  [/(desk|table|cart|island|sideboard|vanity(?!_stool)|nightstand(?!_lamp))/, "table"],
  [
    /(chair|stool|bench|sofa|armchair|ottoman|recliner|chaise|loveseat|rocking|beanbag|cushion$|crib|bunk)/,
    "seat",
  ],
  [/porthole$/, "wallDeco"],
];

function classify(sku: string): Category {
  for (const [re, cat] of RULES) {
    if (re.test(sku)) return cat;
  }
  return "smallDeco";
}

// 카테고리 규칙만으로는 어색한 소수의 특정 아이템만 여기서 override한다.
const SKU_OVERRIDES: Record<string, Partial<PlacementDef>> = {
  furniture_porthole: { placementType: "wall", baseHeightFrac: 0.2 },
  interior_porthole_window: { placementType: "wall", baseHeightFrac: 0.2 },
  interior_lighthouse_frame: { placementType: "wall", baseHeightFrac: 0.22 },
  interior_string_lights: { placementType: "wall", baseHeightFrac: 0.1 },
  interior_bunting_flags: { placementType: "wall", baseHeightFrac: 0.1 },
  interior_seagull_mobile: { placementType: "wall", baseHeightFrac: 0.14 },
  furniture_rug: { placementType: "rug" },
  interior_oval_rug: { placementType: "rug" },
  interior_folding_screen: { baseHeightFrac: 0.34 },
  interior_bunk_bed: { baseHeightFrac: 0.4 },
  interior_baby_crib: { baseHeightFrac: 0.3 },
  // 협탁 위에 놓는 소형 탁상시계 — "clock" 정규식이 벽시계로 잘못 분류하는 것을 바로잡음.
  interior_nightstand_clock: { placementType: "floor", baseHeightFrac: 0.12 },
};

export function getPlacementDef(sku: string | null | undefined): PlacementDef {
  if (!sku) return CATEGORY_DEFAULTS.smallDeco;
  const base = CATEGORY_DEFAULTS[classify(sku)];
  const override = SKU_OVERRIDES[sku];
  return override ? { ...base, ...override } : base;
}
