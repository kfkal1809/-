import { describe, it, expect } from "vitest";
import { createSeededRandom, pickFishingLoot, pickFishingLootSchedule, type LootCatalogRow } from "@/lib/game/fishingLoot";

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
  it("4시간 낚시는 7~9개를 반환한다 (대략 30분에 한 개꼴)", () => {
    for (let seed = 0; seed < 200; seed++) {
      const random = createSeededRandom(`4h:${seed}`);
      const result = pickFishingLoot(4, CATALOG, random);
      expect(result.length).toBeGreaterThanOrEqual(7);
      expect(result.length).toBeLessThanOrEqual(9);
    }
  });

  it("8시간 낚시는 15~17개를 반환한다 (대략 30분에 한 개꼴)", () => {
    for (let seed = 0; seed < 200; seed++) {
      const random = createSeededRandom(`8h:${seed}`);
      const result = pickFishingLoot(8, CATALOG, random);
      expect(result.length).toBeGreaterThanOrEqual(15);
      expect(result.length).toBeLessThanOrEqual(17);
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

describe("pickFishingLootSchedule", () => {
  it("4시간(240분)은 개수만큼 offsetMinutes가 0~240 사이에 고르게 퍼진다", () => {
    for (let seed = 0; seed < 100; seed++) {
      const schedule = pickFishingLootSchedule(4, CATALOG, createSeededRandom(`sched4:${seed}`));
      expect(schedule.length).toBeGreaterThanOrEqual(7);
      expect(schedule.length).toBeLessThanOrEqual(9);
      for (const c of schedule) {
        expect(c.offsetMinutes).toBeGreaterThan(0);
        expect(c.offsetMinutes).toBeLessThan(240);
      }
    }
  });

  it("offsetMinutes는 항상 오름차순으로 정렬돼 있다", () => {
    const schedule = pickFishingLootSchedule(8, CATALOG, createSeededRandom("sorted-check"));
    for (let i = 1; i < schedule.length; i++) {
      expect(schedule[i].offsetMinutes).toBeGreaterThanOrEqual(schedule[i - 1].offsetMinutes);
    }
  });

  it("평균 간격이 30분 안팎이다 (너무 뜸하지 않게)", () => {
    let totalGapMinutes = 0;
    let totalGaps = 0;
    for (let seed = 0; seed < 500; seed++) {
      const schedule4 = pickFishingLootSchedule(4, CATALOG, createSeededRandom(`gap4:${seed}`));
      totalGapMinutes += 240;
      totalGaps += schedule4.length;
    }
    const avgGap = totalGapMinutes / totalGaps;
    expect(avgGap).toBeGreaterThan(24);
    expect(avgGap).toBeLessThan(36);
  });

  it("동일 시드면 스케줄도 항상 재현된다", () => {
    const seed = "reproduce-schedule";
    const run = () => pickFishingLootSchedule(8, CATALOG, createSeededRandom(seed));
    expect(run()).toEqual(run());
  });

  it("카탈로그가 비어있으면 빈 배열을 반환한다", () => {
    expect(pickFishingLootSchedule(4, [], createSeededRandom("empty-sched"))).toEqual([]);
  });
});
