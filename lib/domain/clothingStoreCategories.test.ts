import { describe, it, expect } from "vitest";
import { clothingTabFor } from "@/lib/domain/clothingStoreCategories";

describe("clothingTabFor", () => {
  it("category를 그대로 탭으로 쓴다 — outfit은 옷 종류와 무관하게 항상 '의상' 한 탭", () => {
    // 오버롤이든 원피스든 outfit_full/dress_full 한 장짜리 전신 스프라이트라 세부 구분이
    // 필요 없다(상의/하의/원피스/신발 탭 폐지).
    expect(clothingTabFor("outfit")).toBe("outfit");
    expect(clothingTabFor("hair")).toBe("hair");
    expect(clothingTabFor("hat")).toBe("hat");
    expect(clothingTabFor("accessory")).toBe("accessory");
  });
});
