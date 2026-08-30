import { describe, it, expect } from "vitest";
import { ITEM_APPEARANCE_PATCH } from "@/lib/domain/itemAppearance";
import type { CharacterAppearance } from "@/lib/domain/characterPresets";

describe("ITEM_APPEARANCE_PATCH — outfitAssetKey/fullPortraitKey는 항상 배타적 세트로 명시", () => {
  // CharacterSprite는 fullPortraitKey가 있으면 무조건 그쪽을 먼저 그린다(outfitAssetKey는
  // 무시). 그래서 원피스(fullPortraitKey 사용) 착용 후 오버롤(outfitAssetKey만 있는 패치)로
  // 갈아입을 때 patch에 fullPortraitKey: null이 없으면, appearance_json 병합
  // ({...prev, ...patch})이 이전 원피스의 fullPortraitKey를 그대로 남겨 오버롤로 안 바뀌고
  // 계속 원피스가 렌더링되는 실제 버그가 있었다(0024 마이그레이션 작업 중 발견, 수정).
  for (const [sku, patch] of Object.entries(ITEM_APPEARANCE_PATCH)) {
    const hasOutfitAssetKey = "outfitAssetKey" in patch;
    const hasFullPortraitKey = "fullPortraitKey" in patch;
    if (!hasOutfitAssetKey && !hasFullPortraitKey) continue; // 옷이 아닌 상품(헤어/모자/소품)

    it(`${sku}: outfitAssetKey를 쓰면 fullPortraitKey도, 그 반대도 항상 같이 명시한다`, () => {
      // 두 키가 전부 존재해야 착용 전환 시 병합({...prev, ...patch})이 반대쪽 경로의 이전
      // 값을 확실히 지운다 — 렌더링 시 어느 쪽이 실제로 그려지는지는 CharacterSprite가
      // fullPortraitKey를 우선하므로(값이 있으면 그쪽) 여기서는 "키 존재 여부"만 검사한다.
      expect(hasOutfitAssetKey).toBe(true);
      expect(hasFullPortraitKey).toBe(true);
    });

    it(`${sku}: fullPortraitKey가 실제 값이면 렌더링에서 우선되므로 outfitAssetKey는 없어도(null) 무방하다`, () => {
      const outfitVal = (patch as Partial<CharacterAppearance>).outfitAssetKey;
      const fullVal = (patch as Partial<CharacterAppearance>).fullPortraitKey;
      // 최소한 하나는 실제 렌더링 키여야 한다(둘 다 null인 건 옷을 안 그리겠다는 뜻이라 버그).
      expect(outfitVal !== null || fullVal !== null).toBe(true);
    });
  }
});
