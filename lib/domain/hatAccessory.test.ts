import { describe, it, expect } from "vitest";
import { HAT_SIZE, HAT_PLACEMENT, HAND_SIZE, HAND_PLACEMENT } from "@/lib/domain/characterFullBody";
import { ITEM_APPEARANCE_PATCH } from "@/lib/domain/itemAppearance";

// HAT_SIZE/HAT_PLACEMENT, HAND_SIZE/HAND_PLACEMENT는 키가 어긋나면 조용히 렌더링이 안 되거나
// (Image가 그냥 안 뜸) 크기가 0이 되는 방식으로 실패하는데, 둘 다 화면 확인 없이는 눈에 안 띈다.
// 두 레지스트리가 항상 같은 키 집합을 갖는지, ITEM_APPEARANCE_PATCH가 참조하는 키가 실제로
// 등록돼 있는지를 회귀 테스트로 고정.
describe("모자 소품 레지스트리 일관성", () => {
  it("HAT_SIZE와 HAT_PLACEMENT는 정확히 같은 키 집합을 갖는다", () => {
    expect(Object.keys(HAT_SIZE).sort()).toEqual(Object.keys(HAT_PLACEMENT).sort());
  });

  it("HAND_SIZE와 HAND_PLACEMENT는 정확히 같은 키 집합을 갖는다", () => {
    expect(Object.keys(HAND_SIZE).sort()).toEqual(Object.keys(HAND_PLACEMENT).sort());
  });

  it("ITEM_APPEARANCE_PATCH의 모든 hatAssetKey는 HAT_SIZE에 등록돼 있다", () => {
    for (const [sku, patch] of Object.entries(ITEM_APPEARANCE_PATCH)) {
      if (patch.hatAssetKey) {
        expect(HAT_SIZE, `${sku} -> hatAssetKey "${patch.hatAssetKey}"`).toHaveProperty(patch.hatAssetKey);
      }
    }
  });

  it("ITEM_APPEARANCE_PATCH의 모든 handAssetKey는 HAND_SIZE에 등록돼 있다", () => {
    for (const [sku, patch] of Object.entries(ITEM_APPEARANCE_PATCH)) {
      if (patch.handAssetKey) {
        expect(HAND_SIZE, `${sku} -> handAssetKey "${patch.handAssetKey}"`).toHaveProperty(patch.handAssetKey);
      }
    }
  });

  it("21종 신규 모자 sku가 전부 hatAssetKey로 연결돼 있다", () => {
    const skus = [
      "haenam_deck_hat_sailor_cap",
      "haenam_deck_hat_bucket",
      "haenam_engine_hat_aviator_white",
      "haenam_engine_hat_aviator_blue",
      "haenam_engine_hat_goggles_brown",
      "haenam_engine_hat_goggles_red",
      "haenam_engine_hat_wrench_gray",
      "haenam_engine_hat_wrench_red",
      "haenam_engine_hat_wrench_star",
      "haenyeo_hat_sailor_bow",
      "haenyeo_hat_straw",
      "haenyeo_hat_bow_headband_navy",
      "haenyeo_hat_bow_headband_small",
      "haenyeo_hat_bow_headband_floral",
      "haenyeo_hat_anchor_clip_1",
      "haenyeo_hat_anchor_clip_2",
      "haenyeo_hat_shell_clip",
      "haenyeo_hat_starfish_clip",
      "haenyeo_hat_daisy_clip",
      "haenyeo_hat_shell_cluster_clip",
      "haenyeo_hat_bow_clip_navy",
    ];
    for (const sku of skus) {
      expect(ITEM_APPEARANCE_PATCH[sku]?.hatAssetKey, sku).toBeTruthy();
    }
  });
});
