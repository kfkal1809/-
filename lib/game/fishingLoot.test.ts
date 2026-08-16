import { describe, it, expect } from "vitest";
import { createSeededRandom, pickFishingLoot, type LootCatalogRow } from "@/lib/game/fishingLoot";

describe("createSeededRandom", () => {
  it("같은 시드는 항상 같은 수열을 만든다 (결정적)", () => {
    const a = createSeededRandom("household-1:2026-08-16");
    const b = createSeededRandom("household-1:2026-08-16");
    const seqA = Array.from({ length: 20 }, () => a());
    const seqB = Array.from({ length: 20 }, () => b());
    expect(seqA).toEqual(seqB);
  });

  it("다른 시드는 (거의 항상) 다른 수열을 만든다", () => {
    const a = createSeededRandom("household-1:2026-08-16");
    const b = createSeededRandom("household-2:2026-08-16");
    expect(a()).not.toBe(b());
  });

  it("항상 [0, 1) 범위의 값을 낸다", () => {
    const r = createSeededRandom("range-check");
    for (let i = 0; i < 5000; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

const CATALOG: LootCatalogRow[] = [
  { id: "trash_1", subcategory: "trash", rarity: "common" },
  { id: "trash_2", subcategory: "trash", rarity: "common" },
  { id: "fish_common_1", subcategory: "fish", rarity: "common" },
  { id: "fish_common_2", subcategory: "fish", rarity: "common" },
  { id: "fish_rare_1", subcategory: "fish", rarity: "rare" },
  { id: "lost_1", subcategory: "lost", rarity: "rare" },
  { id: "legend_1", subcategory: "legend", rarity: "legendary" },
];

describe("pickFishingLoot", () => {
  it("4시간 낚시는 2~4개를 반환한다 (기획서 1.32/1.33)", () => {
    for (let seed = 0; seed < 200; seed++) {
      const random = createSeededRandom(`4h:${seed}`);
      const result = pickFishingLoot(4, CATALOG, random);
      expect(result.length).toBeGreaterThanOrEqual(2);
      expect(result.length).toBeLessThanOrEqual(4);
    }
  });

  it("8시간 낚시는 5~8개를 반환한다", () => {
    for (let seed = 0; seed < 200; seed++) {
      const random = createSeededRandom(`8h:${seed}`);
      const result = pickFishingLoot(8, CATALOG, random);
      expect(result.length).toBeGreaterThanOrEqual(5);
      expect(result.length).toBeLessThanOrEqual(8);
    }
  });

  it("결과는 항상 카탈로그에 실제로 존재하는 id만 포함한다", () => {
    const validIds = new Set(CATALOG.map((c) => c.id));
    for (let seed = 0; seed < 100; seed++) {
      const random = createSeededRandom(`valid:${seed}`);
      const result = pickFishingLoot(8, CATALOG, random);
      for (const id of result) expect(validIds.has(id)).toBe(true);
    }
  });

  it("카탈로그가 비어있으면 빈 배열을 반환한다", () => {
    const random = createSeededRandom("empty");
    expect(pickFishingLoot(4, [], random)).toEqual([]);
  });

  it("8시간이 4시간보다 희귀(legend/lost) 비중이 통계적으로 더 높다", () => {
    const RARE_BUCKETS = new Set(["lost_1", "legend_1", "fish_rare_1"]);
    let rare4 = 0;
    let total4 = 0;
    let rare8 = 0;
    let total8 = 0;
    for (let seed = 0; seed < 3000; seed++) {
      const r4 = createSeededRandom(`stat4:${seed}`);
      const res4 = pickFishingLoot(4, CATALOG, r4);
      total4 += res4.length;
      rare4 += res4.filter((id) => RARE_BUCKETS.has(id)).length;

      const r8 = createSeededRandom(`stat8:${seed}`);
      const res8 = pickFishingLoot(8, CATALOG, r8);
      total8 += res8.length;
      rare8 += res8.filter((id) => RARE_BUCKETS.has(id)).length;
    }
    const ratio4 = rare4 / total4;
    const ratio8 = rare8 / total8;
    expect(ratio8).toBeGreaterThan(ratio4);
  });

  it("동일 시드 + 동일 카탈로그면 결과가 항상 재현된다", () => {
    const seed = "reproduce-me";
    const run = () => pickFishingLoot(8, CATALOG, createSeededRandom(seed));
    expect(run()).toEqual(run());
  });
});
