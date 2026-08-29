import { describe, it, expect } from "vitest";
import { getPlacementDef, zoneBoundsFor, clampToRoomZone, depthOf } from "@/lib/domain/cabinPlacement";
import {
  clampToZone,
  clampToPolygon,
  clampToFloorPolygon,
  clampToWallPolygon,
  pointInPolygon,
  isInsideFloor,
  isInKeepOutZone,
  DOOR_X_RANGE,
  DOOR_CLEARANCE,
  CHARACTER_SPAWN_ZONE,
  ROOM_ZONES,
  WALL_BOUNDS,
  FLOOR_POLYGON,
  LEFT_WALL_POLYGON,
  RIGHT_WALL_POLYGON,
} from "@/lib/domain/cabinDecor";

describe("getPlacementDef", () => {
  it("침대류는 floor에, 넓고 크게 렌더된다", () => {
    const def = getPlacementDef("furniture_bed");
    expect(def.placementType).toBe("floor");
    expect(def.baseHeightFrac).toBeGreaterThan(0.25);
  });

  it("조개 침대(vintage_shell_bed)는 선실 대비 작아 보인다는 피드백으로 기본 침대보다 20% 크다", () => {
    const bed = getPlacementDef("furniture_bed");
    const shellBed = getPlacementDef("vintage_shell_bed");
    expect(shellBed.baseHeightFrac).toBeGreaterThan(bed.baseHeightFrac);
    expect(shellBed.baseHeightFrac).toBeCloseTo(bed.baseHeightFrac * 1.2, 1);
  });

  it("현창/액자류는 wall로 분류된다", () => {
    expect(getPlacementDef("furniture_porthole").placementType).toBe("wall");
    expect(getPlacementDef("interior_lighthouse_frame").placementType).toBe("wall");
  });

  it("러그는 rug로 분류되고 상대적으로 얇다(baseHeightFrac이 작다)", () => {
    const rug = getPlacementDef("furniture_rug");
    const bed = getPlacementDef("furniture_bed");
    expect(rug.placementType).toBe("rug");
    expect(rug.baseHeightFrac).toBeLessThan(bed.baseHeightFrac);
  });

  it("의자류는 침대보다 작게 잡힌다", () => {
    const chair = getPlacementDef("furniture_chair");
    const bed = getPlacementDef("furniture_bed");
    expect(chair.baseHeightFrac).toBeLessThan(bed.baseHeightFrac);
  });

  it("알 수 없는/작은 소품은 smallDeco 기본값(가장 작은 축)으로 떨어진다", () => {
    const deco = getPlacementDef("interior_shell_pillow_set");
    const bed = getPlacementDef("furniture_bed");
    expect(deco.baseHeightFrac).toBeLessThan(bed.baseHeightFrac);
  });

  it("sku가 없으면 안전한 기본값을 반환한다", () => {
    expect(getPlacementDef(null).placementType).toBe("floor");
  });
});

describe("zoneBoundsFor", () => {
  it("wall 타입은 WALL_BOUNDS를 그대로 반환한다", () => {
    expect(zoneBoundsFor("wall")).toEqual(WALL_BOUNDS);
  });

  it("floor/rug 타입은 ROOM_ZONES.floor를 반환한다", () => {
    expect(zoneBoundsFor("floor")).toEqual(ROOM_ZONES.floor);
    expect(zoneBoundsFor("rug")).toEqual(ROOM_ZONES.floor);
  });

  it("free 타입은 방 전체(0~1)를 반환한다", () => {
    expect(zoneBoundsFor("free")).toEqual({ xMin: 0, xMax: 1, yMin: 0, yMax: 1 });
  });
});

describe("clampToZone", () => {
  it("영역 안의 좌표는 그대로 둔다", () => {
    const bounds = ROOM_ZONES.floor;
    const midX = (bounds.xMin + bounds.xMax) / 2;
    const midY = (bounds.yMin + bounds.yMax) / 2;
    expect(clampToZone(midX, midY, bounds)).toEqual({ x: midX, y: midY });
  });

  it("영역 밖으로 드래그하면 경계값으로 고정된다", () => {
    const bounds = ROOM_ZONES.floor;
    const result = clampToZone(-1, 2, bounds);
    expect(result.x).toBe(bounds.xMin);
    expect(result.y).toBe(bounds.yMax);
  });

  it("벽 영역 밖(바닥 쪽)으로 드래그해도 벽 바운드 안에 고정된다", () => {
    const result = clampToZone(0.5, 0.9, WALL_BOUNDS);
    expect(result.y).toBeLessThanOrEqual(WALL_BOUNDS.yMax);
  });
});

describe("depthOf", () => {
  it("y가 클수록(화면 아래쪽) depth가 커서 앞쪽에 그려진다", () => {
    expect(depthOf(0.8, 0)).toBeGreaterThan(depthOf(0.2, 0));
  });

  it("zIndex 보정으로 비슷한 y끼리는 순서를 뒤집을 수 있다", () => {
    expect(depthOf(0.5, 5)).toBeGreaterThan(depthOf(0.5, 0));
  });

  it("멀리 떨어진 y차이는 통상적인 zIndex 조정 폭(수 회 클릭)으로 뒤집히지 않는다", () => {
    expect(depthOf(0.1, 5)).toBeLessThan(depthOf(0.9, 0));
  });
});

describe("isInsideFloor", () => {
  it("방 중앙 앞쪽(러그 자리)은 바닥 폴리곤 안에 있다", () => {
    expect(isInsideFloor(0.46, 0.86)).toBe(true);
  });

  it("바운딩 박스 안이지만 실제 육각형 폴리곤 밖(뒤쪽 모서리 근처)인 점은 걸러낸다", () => {
    // ROOM_ZONES.floor 바운딩 박스 안에 있지만, 뒤쪽으로 좁아지는 실제 폴리곤 밖의 점.
    expect(isInsideFloor(0.1, 0.5)).toBe(false);
  });

  it("천장/벽 쪽 점은 바닥이 아니다", () => {
    expect(isInsideFloor(0.5, 0.1)).toBe(false);
  });
});

// 완전한 폴리곤 충돌판정 — 바운딩 박스만으로는 못 막던 "박스 안이지만 실제 육각형/평행사변형
// 밖인 모서리 빈 삼각형 구간"을 폴리곤 테두리로 정확히 스냅하는지 검증.
describe("clampToPolygon", () => {
  it("폴리곤 안의 점은 그대로 둔다", () => {
    expect(clampToPolygon(0.5, 0.7, FLOOR_POLYGON)).toEqual({ x: 0.5, y: 0.7 });
  });

  it("바운딩 박스 안이지만 실제 육각형 폴리곤 밖인 모서리 점은 테두리로 스냅된다", () => {
    // FLOOR_POLYGON의 바운딩 박스 좌상단 근처(바운딩 박스 클램프만으로는 안 걸러짐).
    const result = clampToPolygon(0.03, 0.476, FLOOR_POLYGON);
    expect(result.x).toBeCloseTo(0.073, 2);
    expect(result.y).toBeCloseTo(0.569, 2);
    // 스냅된 점 자체는 폴리곤 경계 위(또는 그 근처)라 더 이상 밖이 아니어야 한다.
    expect(pointInPolygon(result.x, result.y + 0.001, FLOOR_POLYGON)).toBe(true);
  });

  it("폴리곤 훨씬 밖(천장 쪽)의 점은 가장 가까운 변(위쪽 꼭짓점 근방)으로 스냅된다", () => {
    const result = clampToPolygon(0.5, 0, FLOOR_POLYGON);
    expect(result.y).toBeGreaterThan(0.3);
    expect(result.y).toBeLessThan(0.4);
  });
});

describe("clampToFloorPolygon / clampToWallPolygon", () => {
  it("clampToFloorPolygon은 clampToPolygon(FLOOR_POLYGON)과 동일하다", () => {
    expect(clampToFloorPolygon(0.03, 0.476)).toEqual(clampToPolygon(0.03, 0.476, FLOOR_POLYGON));
  });

  it("clampToWallPolygon은 x<0.5면 왼쪽 벽 폴리곤을, 아니면 오른쪽 벽 폴리곤을 쓴다", () => {
    expect(clampToWallPolygon(0.1, 0.5)).toEqual(clampToPolygon(0.1, 0.5, LEFT_WALL_POLYGON));
    expect(clampToWallPolygon(0.9, 0.5)).toEqual(clampToPolygon(0.9, 0.5, RIGHT_WALL_POLYGON));
  });

  it("벽 바운딩 박스 안이지만 실제 평행사변형 밖인 점도 걸러낸다", () => {
    // 벽은 원근 때문에 x가 방 중앙에 가까울수록 유효 y범위가 좁아지는 기울어진 사각형이라,
    // WALL_BOUNDS(좌우 벽을 합친 바운딩 박스) 안이지만 실제 왼쪽 벽 사각형 밖인 점이 생긴다.
    const inBox = 0.45 >= WALL_BOUNDS.xMin && 0.45 <= WALL_BOUNDS.xMax && 0.55 >= WALL_BOUNDS.yMin && 0.55 <= WALL_BOUNDS.yMax;
    expect(inBox).toBe(true);
    expect(pointInPolygon(0.45, 0.55, LEFT_WALL_POLYGON)).toBe(false);
    const result = clampToWallPolygon(0.45, 0.55);
    expect(result).not.toEqual({ x: 0.45, y: 0.55 });
    expect(result.x).toBeCloseTo(0.369, 2);
    expect(result.y).toBeCloseTo(0.404, 2);
  });
});

describe("clampToRoomZone", () => {
  it("floor/rug는 바운딩 박스가 아니라 실제 바닥 폴리곤으로 클램프된다", () => {
    const result = clampToRoomZone(0.03, 0.476, "floor");
    expect(result).toEqual(clampToFloorPolygon(0.03, 0.476));
    expect(result).not.toEqual(clampToZone(0.03, 0.476, ROOM_ZONES.floor));
  });

  it("wall은 실제 벽 폴리곤으로 클램프된다", () => {
    const result = clampToRoomZone(0.05, 0.55, "wall");
    expect(result).toEqual(clampToWallPolygon(0.05, 0.55));
  });

  it("free는 폴리곤 없이 방 전체(0~1) 바운딩 박스만 적용된다", () => {
    expect(clampToRoomZone(-1, 2, "free")).toEqual({ x: 0, y: 1 });
  });

  it("폴리곤 안쪽 점은 floor/wall 모두 좌표가 그대로 유지된다", () => {
    expect(clampToRoomZone(0.46, 0.86, "floor")).toEqual({ x: 0.46, y: 0.86 });
  });
});

// 기본 선실 배치(app/api/onboarding/complete/route.ts DEFAULT_FURNITURE_LAYOUT,
// lib/game/cabinData.ts DEMO)가 실제 바닥 폴리곤 안에, 문 앞을 피해서 놓이는지 회귀 검증.
// 좌표를 여기 값과 동기화해서 유지한다.
describe("기본 선실 배치 좌표", () => {
  const floorItems: { name: string; x: number; y: number }[] = [
    { name: "침대", x: 0.22, y: 0.65 },
    { name: "책상", x: 0.68, y: 0.58 },
    { name: "의자", x: 0.68, y: 0.72 },
    { name: "냉장고", x: 0.56, y: 0.5 },
    { name: "스탠드조명", x: 0.16, y: 0.7 },
    { name: "러그", x: 0.46, y: 0.86 },
  ];

  it.each(floorItems)("$name는 실제 바닥 폴리곤 안에 있다", ({ x, y }) => {
    expect(isInsideFloor(x, y)).toBe(true);
  });

  it.each(floorItems.filter((i) => i.name === "책상" || i.name === "의자" || i.name === "냉장고"))(
    "$name는 문 앞 구간(DOOR_X_RANGE)을 피한다",
    ({ x }) => {
      expect(x).toBeLessThan(DOOR_X_RANGE.min);
    }
  );
});

describe("PlacementDef 확장 필드(furnitureKind/allowedZones/facing)", () => {
  it("furnitureKind가 실제 분류와 일치한다", () => {
    expect(getPlacementDef("furniture_bed").furnitureKind).toBe("bed");
    expect(getPlacementDef("interior_lighthouse_frame").furnitureKind).toBe("wallDeco");
  });

  it("allowedZones는 현재 방향별 에셋이 없어 항상 preferredZone 하나뿐이다", () => {
    const def = getPlacementDef("furniture_desk");
    expect(def.allowedZones).toEqual([def.preferredZone]);
  });

  it("supportedFacings는 현재 defaultFacing 하나뿐이다(방향별 에셋 없음)", () => {
    const def = getPlacementDef("furniture_bed");
    expect(def.supportedFacings).toEqual([def.defaultFacing]);
  });

  it("groundAnchor는 기본적으로 바닥 접점(0.5, 1)이다", () => {
    const def = getPlacementDef("furniture_chair");
    expect(def.groundAnchorX).toBe(0.5);
    expect(def.groundAnchorY).toBe(1);
  });

  it("벽 아이템은 wall 하나만 allowedZones로 갖는다", () => {
    const def = getPlacementDef("furniture_porthole");
    expect(def.allowedZones).toEqual(["wall"]);
  });
});

describe("isInKeepOutZone", () => {
  it("문 앞 구간은 keep-out이다", () => {
    const midX = (DOOR_CLEARANCE.xMin + DOOR_CLEARANCE.xMax) / 2;
    const midY = (DOOR_CLEARANCE.yMin + DOOR_CLEARANCE.yMax) / 2;
    expect(isInKeepOutZone(midX, midY)).toBe(true);
  });

  it("캐릭터 스폰 자리는 keep-out이다", () => {
    const midX = (CHARACTER_SPAWN_ZONE.xMin + CHARACTER_SPAWN_ZONE.xMax) / 2;
    const midY = (CHARACTER_SPAWN_ZONE.yMin + CHARACTER_SPAWN_ZONE.yMax) / 2;
    expect(isInKeepOutZone(midX, midY)).toBe(true);
  });

  it("두 keep-out 밖의 일반 바닥 지점은 자유롭게 배치 가능하다", () => {
    expect(isInKeepOutZone(0.22, 0.65)).toBe(false); // 기본 침대 자리
  });
});

// 빈티지 가구 시리즈(22종, supabase/migrations/0011_vintage_furniture_pack.sql) — sku 이름
// 패턴만으로 새 규칙 추가 없이 전부 올바르게 분류되는지 회귀 검증.
describe("빈티지 가구 시리즈 furnitureKind 분류", () => {
  const expected: Record<string, string> = {
    vintage_shell_bed: "bed",
    vintage_shell_deco: "smallDeco",
    vintage_stripe_loveseat: "seat",
    vintage_stripe_armchair: "seat",
    vintage_wood_chair: "seat",
    vintage_plant_side_table: "table",
    vintage_shell_floor_lamp: "lamp",
    vintage_anchor_desk: "table",
    vintage_nightstand_plain: "table",
    vintage_nightstand_drawer: "storage",
    vintage_book_boat_shelf: "storage",
    vintage_potted_plant: "smallDeco",
    vintage_oval_mirror: "wallDeco",
    vintage_round_mirror: "wallDeco",
    vintage_curtains_blue: "wallDeco",
    vintage_lighthouse_frame: "wallDeco",
    vintage_wood_door: "smallDeco",
    vintage_treasure_chest: "storage",
    vintage_anchor_fridge: "appliance",
    vintage_travel_luggage: "smallDeco",
    vintage_wheel_rug: "rug",
    vintage_office_chair: "seat",
  };

  it.each(Object.entries(expected))("%s는 %s로 분류된다", (sku, kind) => {
    expect(getPlacementDef(sku).furnitureKind).toBe(kind);
  });
});

// 캐리비안의 해적 시리즈(16종) — sku 이름 패턴 분류 회귀 검증.
describe("캐리비안의 해적 시리즈 furnitureKind 분류", () => {
  const expected: Record<string, string> = {
    pirate_bed: "bed",
    pirate_book_lantern_shelf: "storage",
    pirate_compass_deco: "smallDeco",
    pirate_compass_rug: "rug",
    pirate_desk: "table",
    pirate_floor_lamp: "lamp",
    pirate_gold_hoard_deco: "smallDeco",
    pirate_loveseat: "seat",
    pirate_map_frame: "wallDeco",
    pirate_money_stack_deco: "smallDeco",
    pirate_office_chair: "seat",
    pirate_potted_plant: "smallDeco",
    pirate_ship_bottle_deco: "smallDeco",
    pirate_treasure_chest: "storage",
    pirate_trunk_table: "table",
    pirate_wall_lantern: "smallDeco",
  };

  it.each(Object.entries(expected))("%s는 %s로 분류된다", (sku, kind) => {
    expect(getPlacementDef(sku).furnitureKind).toBe(kind);
  });

  it("pirate_wall_lantern은 SKU_OVERRIDES로 벽 배치가 된다", () => {
    const def = getPlacementDef("pirate_wall_lantern");
    expect(def.placementType).toBe("wall");
  });
});

// 숲의 요정 시리즈(18종) — sku 이름 패턴 분류 회귀 검증.
describe("숲의 요정 시리즈 furnitureKind 분류", () => {
  const expected: Record<string, string> = {
    fairy_acorn_box_deco: "smallDeco",
    fairy_bed: "bed",
    fairy_book_lantern_shelf: "storage",
    fairy_desk: "table",
    fairy_drawer_cabinet: "storage",
    fairy_floor_lamp: "lamp",
    fairy_frame_flower: "wallDeco",
    fairy_frame_leaf: "wallDeco",
    fairy_frame_mushroom: "wallDeco",
    fairy_leaf_deco: "smallDeco",
    fairy_loveseat: "seat",
    fairy_mushroom_stand_light: "lamp",
    fairy_potted_flower: "smallDeco",
    fairy_round_rug: "rug",
    fairy_round_table: "table",
    fairy_stool_chair: "seat",
    fairy_teacup_deco: "smallDeco",
    fairy_wall_lantern: "smallDeco",
  };

  it.each(Object.entries(expected))("%s는 %s로 분류된다", (sku, kind) => {
    expect(getPlacementDef(sku).furnitureKind).toBe(kind);
  });

  it("fairy_wall_lantern은 SKU_OVERRIDES로 벽 배치가 된다", () => {
    const def = getPlacementDef("fairy_wall_lantern");
    expect(def.placementType).toBe("wall");
  });
});

// 마린시리즈(30종) — sku 이름 패턴 분류 회귀 검증.
describe("마린시리즈 furnitureKind 분류", () => {
  const expected: Record<string, string> = {
    marine_anchor_clock_deco: "wallDeco",
    marine_bed: "bed",
    marine_chair: "seat",
    marine_coffee_table: "table",
    marine_compass_deco: "smallDeco",
    marine_coral_deco: "smallDeco",
    marine_desk: "table",
    marine_floor_lamp: "lamp",
    marine_fridge: "appliance",
    marine_jar_shell_deco: "smallDeco",
    marine_lantern_deco: "smallDeco",
    marine_life_ring_deco: "smallDeco",
    marine_loveseat: "seat",
    marine_mailbox: "smallDeco",
    marine_mug_deco: "smallDeco",
    marine_porthole_mirror: "wallDeco",
    marine_potted_plant: "smallDeco",
    marine_round_rug: "rug",
    marine_shelf: "storage",
    marine_shell_pillow_deco: "smallDeco",
    marine_shell_spiral_deco: "smallDeco",
    marine_shell_teal_deco: "smallDeco",
    marine_ship_bottle_deco: "smallDeco",
    marine_ship_wheel_deco: "smallDeco",
    marine_sideboard: "table",
    marine_starfish_deco: "smallDeco",
    marine_wall_lamp: "smallDeco",
    marine_wave_pillow_deco: "smallDeco",
    marine_whale_books_deco: "smallDeco",
    marine_whale_pillow_deco: "smallDeco",
  };

  it.each(Object.entries(expected))("%s는 %s로 분류된다", (sku, kind) => {
    expect(getPlacementDef(sku).furnitureKind).toBe(kind);
  });

  it("marine_anchor_clock_deco는 SKU_OVERRIDES로 바닥 배치가 된다(clock 정규식이 벽시계로 오분류하는 것을 보정)", () => {
    expect(getPlacementDef("marine_anchor_clock_deco").placementType).toBe("floor");
  });

  it.each(["marine_ship_wheel_deco", "marine_wall_lamp"])("%s는 SKU_OVERRIDES로 벽 배치가 된다", (sku) => {
    expect(getPlacementDef(sku).placementType).toBe("wall");
  });
});

// 방선에서 생긴일(코티지) 시리즈(23종) — sku 이름 패턴 분류 회귀 검증.
describe("방선에서 생긴일 시리즈 furnitureKind 분류", () => {
  const expected: Record<string, string> = {
    cottage_basket_deco: "smallDeco",
    cottage_bed: "bed",
    cottage_book_boat_shelf: "storage",
    cottage_chair: "seat",
    cottage_coffee_table: "table",
    cottage_desk: "table",
    cottage_floor_lamp: "lamp",
    cottage_folded_blanket_deco: "smallDeco",
    cottage_lemon_frame_deco: "wallDeco",
    cottage_lighthouse_frame: "wallDeco",
    cottage_loveseat: "seat",
    cottage_mailbox: "smallDeco",
    cottage_mug_deco: "smallDeco",
    cottage_nightstand: "table",
    cottage_pillow_deco: "smallDeco",
    cottage_porthole_window: "wallDeco",
    cottage_potted_plant: "smallDeco",
    cottage_round_rug: "rug",
    cottage_sailboat_deco: "smallDeco",
    cottage_shell_frame_deco: "wallDeco",
    cottage_side_table: "table",
    cottage_sideboard: "table",
    cottage_wall_sconce: "smallDeco",
  };

  it.each(Object.entries(expected))("%s는 %s로 분류된다", (sku, kind) => {
    expect(getPlacementDef(sku).furnitureKind).toBe(kind);
  });

  it("cottage_wall_sconce는 SKU_OVERRIDES로 벽 배치가 된다", () => {
    expect(getPlacementDef("cottage_wall_sconce").placementType).toBe("wall");
  });
});
