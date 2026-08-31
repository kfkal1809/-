import { describe, it, expect } from "vitest";
import { ITEM_APPEARANCE_PATCH } from "@/lib/domain/itemAppearance";
import type { CharacterAppearance } from "@/lib/domain/characterPresets";

describe("ITEM_APPEARANCE_PATCH — 의상 상품은 항상 outfitAssetKey로만 렌더링한다", () => {
  // 예전엔 완성 전신 PNG를 통째로 그리는 fullPortraitKey 경로가 outfitAssetKey와 병존해서,
  // 같은 캐릭터인데 의상마다(경로에 따라) 머리 크기·키·다리 길이가 달라지는 버그가 있었다.
  // fullPortraitKey 필드 자체를 CharacterAppearance 타입에서 없애 재발을 구조적으로 막았으니,
  // 여기서는 outfit 필드가 있는 상품(옷)이면 반드시 outfitAssetKey로 실제 그림을 그리는지만
  // 확인한다.
  for (const [sku, patch] of Object.entries(ITEM_APPEARANCE_PATCH)) {
    if (!("outfit" in patch) && !("outfitAssetKey" in patch)) continue; // 옷이 아닌 상품(헤어/모자/소품)

    it(`${sku}: outfitAssetKey가 실제 값으로 설정돼 있다`, () => {
      const outfitVal = (patch as Partial<CharacterAppearance>).outfitAssetKey;
      expect(typeof outfitVal).toBe("string");
      expect(outfitVal).not.toBe("");
    });
  }
});
