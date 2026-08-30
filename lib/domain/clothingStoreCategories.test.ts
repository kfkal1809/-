import { describe, it, expect } from "vitest";
import { clothingTabFor } from "@/lib/domain/clothingStoreCategories";

describe("clothingTabFor", () => {
  it("hair/hat/accessory 카테고리는 outfitKind와 무관하게 각자 탭으로 간다", () => {
    expect(clothingTabFor("hair", "any_sku")).toBe("hair");
    expect(clothingTabFor("hat", "any_sku")).toBe("hat");
    expect(clothingTabFor("accessory", "any_sku")).toBe("accessory");
  });

  it("outfitKind가 주어지면 sku 문자열이 아니라 실제 옷 종류로 원피스 여부를 가른다", () => {
    // child_dress_s3_02는 sku에 "dress"가 들어있지만 실제로는 멜빵바지(child_overalls)다 —
    // outfitKind를 넘기면 sku의 "dress" 문자열에 속지 않고 세트의상 탭으로 간다. 전신 의상은
    // 상하의가 한 그림으로 붙어 있어 "상의"가 아니라 "세트의상"으로 분류한다.
    expect(clothingTabFor("outfit", "child_dress_s3_02", "child_overalls")).toBe("set");
    expect(clothingTabFor("outfit", "child_dress_s6_01", "dress")).toBe("dress");
  });

  it("outfitKind가 없으면(구식 상품) sku 문자열 포함 여부로 폴백한다", () => {
    expect(clothingTabFor("outfit", "haenyeo_outfit_dress")).toBe("dress");
    expect(clothingTabFor("outfit", "haenyeo_outfit_overalls")).toBe("set");
  });
});
