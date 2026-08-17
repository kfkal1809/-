import { describe, it, expect } from "vitest";
import {
  OUTFIT_VARIANT_MANIFEST,
  ITEM_APPEARANCE_VARIANTS,
  bodyPresetKeyFor,
  resolveAppearancePatch,
  isCompatibleWithBody,
  type BodyPresetKey,
} from "@/lib/domain/itemAppearanceVariants";

const ALL_BODY_PRESETS: BodyPresetKey[] = [
  "haenyeo",
  "haenam",
  "child_toddler_male",
  "child_toddler_female",
  "child_kindergarten_male",
  "child_kindergarten_female",
  "child_elementary_male",
  "child_elementary_female",
];

describe("bodyPresetKeyFor", () => {
  it("해녀/해남은 체형이 하나뿐이라 항상 같은 키를 반환한다", () => {
    expect(bodyPresetKeyFor("haenyeo", null, null)).toBe("haenyeo");
    expect(bodyPresetKeyFor("haenam", null, null)).toBe("haenam");
  });

  it("새싹은 성별/연령대 조합으로 8개 중 하나로 매핑된다", () => {
    expect(bodyPresetKeyFor("child", "male", "toddler")).toBe("child_toddler_male");
    expect(bodyPresetKeyFor("child", "female", "kindergarten")).toBe("child_kindergarten_female");
    expect(bodyPresetKeyFor("child", "male", "elementary")).toBe("child_elementary_male");
  });

  it("characterPortraitKeyFor와 동일한 규칙을 쓰므로 미지정 성별/범위 밖 연령대도 안전하게 근사한다", () => {
    // toStageGroup(characterPortrait.ts)의 default 분기: 연령대 미지정/범위 밖은 elementary로 근사.
    expect(bodyPresetKeyFor("child", null, null)).toBe("child_elementary_male");
    expect(bodyPresetKeyFor("child", "female", "university")).toBe("child_elementary_female");
  });
});

describe("OUTFIT_VARIANT_MANIFEST", () => {
  it("정확히 63개 항목(7개 시트 x 9벌)이 있다", () => {
    expect(OUTFIT_VARIANT_MANIFEST).toHaveLength(63);
  });

  it("logicalItemKey는 전부 유일하다", () => {
    const keys = OUTFIT_VARIANT_MANIFEST.map((m) => m.logicalItemKey);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("전부 reviewStatus가 verified다(눈으로 검수 완료된 것만 카탈로그에 연결)", () => {
    expect(OUTFIT_VARIANT_MANIFEST.every((m) => m.reviewStatus === "verified")).toBe(true);
  });

  it("매니페스트의 모든 항목이 ITEM_APPEARANCE_VARIANTS에도 정확히 대응한다(누락/불일치 없음)", () => {
    for (const entry of OUTFIT_VARIANT_MANIFEST) {
      const variants = ITEM_APPEARANCE_VARIANTS[entry.logicalItemKey];
      expect(variants, `${entry.logicalItemKey} missing from ITEM_APPEARANCE_VARIANTS`).toBeDefined();
      const match = variants.find((v) => v.bodyPresetKey === entry.bodyPresetKey);
      expect(match, `${entry.logicalItemKey} has no variant for ${entry.bodyPresetKey}`).toBeDefined();
      expect(match?.assetKey).toBe(entry.assetKey);
    }
  });

  it("ITEM_APPEARANCE_VARIANTS에 매니페스트에 없는 여분 sku가 없다", () => {
    const manifestKeys = new Set(OUTFIT_VARIANT_MANIFEST.map((m) => m.logicalItemKey));
    for (const sku of Object.keys(ITEM_APPEARANCE_VARIANTS)) {
      expect(manifestKeys.has(sku)).toBe(true);
    }
  });

  it("각 항목의 bodyPresetKey는 8개 유효 체형 preset 중 하나다", () => {
    for (const entry of OUTFIT_VARIANT_MANIFEST) {
      expect(ALL_BODY_PRESETS).toContain(entry.bodyPresetKey);
    }
  });
});

describe("resolveAppearancePatch", () => {
  it("variant가 등록된 sku는 일치하는 체형에서만 patch를 반환한다", () => {
    const patch = resolveAppearancePatch("child_dress_s3_01", "child_toddler_male");
    expect(patch).not.toBeNull();
    expect(patch?.fullPortraitKey).toBe("child_toddler_male_dress_s3_01");
  });

  it("variant가 등록된 sku를 다른 체형으로 조회하면 null이다(다른 체형 그림으로 강제 대체 금지)", () => {
    expect(resolveAppearancePatch("child_dress_s3_01", "child_toddler_female")).toBeNull();
    expect(resolveAppearancePatch("child_dress_s6_01", "child_toddler_male")).toBeNull();
    expect(resolveAppearancePatch("child_dress_s9_01", "child_kindergarten_male")).toBeNull();
  });

  it("기존(체형 제약 없는) 해녀/해남/범용 새싹 상품은 기존 ITEM_APPEARANCE_PATCH로 폴백한다(회귀 없음)", () => {
    const haenyeo = resolveAppearancePatch("haenyeo_outfit_dress", "haenyeo");
    expect(haenyeo).not.toBeNull();
    expect(haenyeo?.fullPortraitKey).toBe("haenyeo_dress_02");

    const genericChild = resolveAppearancePatch("child_outfit_hoodie", "child_kindergarten_female");
    expect(genericChild).not.toBeNull();
    expect(genericChild?.outfitAssetKey).toBe("child_outfit_05");
  });

  it("알 수 없는 sku는 빈 patch를 반환한다(에러 대신 안전한 기본값)", () => {
    expect(resolveAppearancePatch("no_such_sku", "haenyeo")).toEqual({});
  });
});

describe("isCompatibleWithBody", () => {
  it("체형 제약이 있는 상품은 맞는 체형에서만 호환된다", () => {
    expect(isCompatibleWithBody("child_dress_s3_01", "child_toddler_male")).toBe(true);
    expect(isCompatibleWithBody("child_dress_s3_01", "child_toddler_female")).toBe(false);
    expect(isCompatibleWithBody("child_dress_s3_01", "child_elementary_male")).toBe(false);
  });

  it("체형 제약이 없는(레거시) 상품은 모든 체형과 호환된다", () => {
    for (const key of ALL_BODY_PRESETS) {
      expect(isCompatibleWithBody("child_outfit_hoodie", key)).toBe(true);
    }
  });

  it("63벌 전체가 정확히 하나의 체형과만 호환된다(현재 데이터셋엔 다체형 variant가 없음)", () => {
    for (const entry of OUTFIT_VARIANT_MANIFEST) {
      const compatibleCount = ALL_BODY_PRESETS.filter((key) => isCompatibleWithBody(entry.logicalItemKey, key)).length;
      expect(compatibleCount).toBe(1);
    }
  });
});
