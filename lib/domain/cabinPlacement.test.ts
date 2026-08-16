import { describe, it, expect } from "vitest";
import { getPlacementDef, zoneBoundsFor, depthOf } from "@/lib/domain/cabinPlacement";
import { clampToZone, ROOM_ZONES, WALL_BOUNDS } from "@/lib/domain/cabinDecor";

describe("getPlacementDef", () => {
  it("침대류는 floor에, 넓고 크게 렌더된다", () => {
    const def = getPlacementDef("furniture_bed");
    expect(def.placementType).toBe("floor");
    expect(def.baseHeightFrac).toBeGreaterThan(0.25);
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
