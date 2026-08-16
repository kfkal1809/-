import { describe, it, expect } from "vitest";
import { characterPortraitKeyFor, characterPortraitSrc, characterOutfitMaskSrc, PORTRAIT_SIZE } from "@/lib/domain/characterPortrait";

describe("characterPortraitKeyFor", () => {
  it("해녀/해남은 성별·연령 무관하게 고정 키를 반환한다", () => {
    expect(characterPortraitKeyFor({ kind: "haenyeo" })).toBe("haenyeo");
    expect(characterPortraitKeyFor({ kind: "haenam" })).toBe("haenam");
  });

  it("새싹은 연령대×성별 조합으로 키를 만든다", () => {
    expect(characterPortraitKeyFor({ kind: "child", childGender: "male", childStage: "toddler" })).toBe("child_toddler_male");
    expect(characterPortraitKeyFor({ kind: "child", childGender: "female", childStage: "kindergarten" })).toBe(
      "child_kindergarten_female"
    );
    expect(characterPortraitKeyFor({ kind: "child", childGender: "male", childStage: "elementary" })).toBe(
      "child_elementary_male"
    );
  });

  it("그림이 없는 연령대는 가장 가까운 단계로 근사한다", () => {
    expect(characterPortraitKeyFor({ kind: "child", childGender: "male", childStage: "infant" })).toBe("child_toddler_male");
    expect(characterPortraitKeyFor({ kind: "child", childGender: "female", childStage: "middle" })).toBe(
      "child_elementary_female"
    );
    expect(characterPortraitKeyFor({ kind: "child", childGender: "male", childStage: "high" })).toBe("child_elementary_male");
    expect(characterPortraitKeyFor({ kind: "child", childGender: "female", childStage: "university" })).toBe(
      "child_elementary_female"
    );
  });

  it("성별 미지정(unset)은 male로 근사한다", () => {
    expect(characterPortraitKeyFor({ kind: "child", childGender: "unset", childStage: "toddler" })).toBe("child_toddler_male");
    expect(characterPortraitKeyFor({ kind: "child", childGender: null, childStage: "toddler" })).toBe("child_toddler_male");
  });

  it("모든 키가 PORTRAIT_SIZE에 실측값을 갖고 있다", () => {
    const keys = [
      characterPortraitKeyFor({ kind: "haenyeo" }),
      characterPortraitKeyFor({ kind: "haenam" }),
      characterPortraitKeyFor({ kind: "child", childGender: "male", childStage: "toddler" }),
      characterPortraitKeyFor({ kind: "child", childGender: "female", childStage: "toddler" }),
      characterPortraitKeyFor({ kind: "child", childGender: "male", childStage: "kindergarten" }),
      characterPortraitKeyFor({ kind: "child", childGender: "female", childStage: "kindergarten" }),
      characterPortraitKeyFor({ kind: "child", childGender: "male", childStage: "elementary" }),
      characterPortraitKeyFor({ kind: "child", childGender: "female", childStage: "elementary" }),
    ];
    for (const key of keys) {
      expect(PORTRAIT_SIZE[key]).toBeDefined();
      expect(PORTRAIT_SIZE[key].w).toBeGreaterThan(0);
      expect(PORTRAIT_SIZE[key].h).toBeGreaterThan(0);
    }
  });
});

describe("characterPortraitSrc / characterOutfitMaskSrc", () => {
  it("일러스트/마스크 경로를 base 디렉터리 규칙대로 만든다", () => {
    expect(characterPortraitSrc({ kind: "haenyeo" })).toBe("/images/character/base/haenyeo.png");
    expect(characterOutfitMaskSrc({ kind: "haenyeo" })).toBe("/images/character/base/masks/haenyeo_outfit_mask.png");
    expect(characterPortraitSrc({ kind: "child", childGender: "female", childStage: "kindergarten" })).toBe(
      "/images/character/base/child_kindergarten_female.png"
    );
  });
});
