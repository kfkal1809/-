import { describe, it, expect } from "vitest";
import { availableFacings, cycleFacing, furnitureImageSrc } from "@/lib/domain/furnitureFacingAssets";

describe("availableFacings", () => {
  it("실제 방향별 그림이 있는 가구는 등록된 방향을 전부 돌려준다", () => {
    expect(availableFacings("vintage_shell_bed")).toEqual(["front", "front-left", "front-right"]);
  });

  it("방향별 그림이 없는 가구는 기본 방향 하나만 돌려준다", () => {
    expect(availableFacings("vintage_anchor_desk")).toEqual(["front-right"]);
    expect(availableFacings("furniture_bed")).toHaveLength(1);
  });
});

describe("cycleFacing", () => {
  it("등록된 방향을 순서대로 순환한다", () => {
    expect(cycleFacing("vintage_shell_bed", "front")).toBe("front-left");
    expect(cycleFacing("vintage_shell_bed", "front-left")).toBe("front-right");
    expect(cycleFacing("vintage_shell_bed", "front-right")).toBe("front"); // 한 바퀴 돌아옴
  });

  it("방향 전환 미지원 가구는 항상 같은 값을 돌려준다(no-op)", () => {
    expect(cycleFacing("vintage_anchor_desk", "front-right")).toBe("front-right");
  });
});

describe("furnitureImageSrc", () => {
  it("방향별 그림이 등록된 가구는 facing에 맞는 파일 경로를 반환한다", () => {
    expect(furnitureImageSrc("vintage_shell_bed", "front")).toBe("/images/items/vintage_shell_bed.png");
    expect(furnitureImageSrc("vintage_shell_bed", "front-left")).toBe("/images/items/vintage_shell_bed_left.png");
    expect(furnitureImageSrc("vintage_shell_bed", "front-right")).toBe("/images/items/vintage_shell_bed_right.png");
  });

  it("방향별 그림이 없는 가구는 facing과 무관하게 항상 sku 기본 그림을 쓴다", () => {
    expect(furnitureImageSrc("vintage_anchor_desk", "front-right")).toBe("/images/items/vintage_anchor_desk.png");
    expect(furnitureImageSrc("vintage_anchor_desk", null)).toBe("/images/items/vintage_anchor_desk.png");
  });

  it("ITEM_ICON_SKUS에 없는 sku는 null을 반환한다(이니셜 배지 폴백, itemIconSrc와 동일 규칙)", () => {
    expect(furnitureImageSrc("no_such_sku", "front")).toBeNull();
  });
});
