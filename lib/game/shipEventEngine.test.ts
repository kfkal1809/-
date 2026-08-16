import { describe, it, expect } from "vitest";
import { dailySlotCount, scheduledSlotTime, pickShipType, pickReward } from "@/lib/game/shipEventEngine";
import { SHIP_TYPES, SHIP_EVENT_CONFIG } from "@/lib/domain/shipEvents";
import { createSeededRandom } from "@/lib/game/fishingLoot";

describe("SHIP_TYPES config", () => {
  it("가중치 합이 100이다", () => {
    const total = SHIP_TYPES.reduce((sum, s) => sum + s.spawnWeight, 0);
    expect(total).toBe(100);
  });

  it("선종 key가 전부 유일하다", () => {
    const keys = SHIP_TYPES.map((s) => s.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe("dailySlotCount", () => {
  it("설정된 dailyMin~dailyMax 범위 안에서만 나온다", () => {
    for (let i = 0; i < 300; i++) {
      const count = dailySlotCount("household-x", `2026-08-${(i % 28) + 1}`.padStart(10, "0"));
      expect(count).toBeGreaterThanOrEqual(SHIP_EVENT_CONFIG.dailyMin);
      expect(count).toBeLessThanOrEqual(SHIP_EVENT_CONFIG.dailyMax);
    }
  });

  it("같은 household+날짜는 항상 같은 개수를 낸다 (재계산해도 동일 — 크론 없는 lazy-spawn의 전제)", () => {
    const a = dailySlotCount("household-A", "2026-08-16");
    const b = dailySlotCount("household-A", "2026-08-16");
    expect(a).toBe(b);
  });

  it("household가 다르면 스케줄도 (대체로) 달라진다 — 전 세대가 동시에 뜨지 않도록", () => {
    const counts = new Set<number>();
    for (let i = 0; i < 20; i++) {
      counts.add(dailySlotCount(`household-${i}`, "2026-08-16"));
    }
    // dailyMin~dailyMax 범위가 좁아 완전히 다 다르진 않지만, 최소한 다양성은 있어야 한다.
    expect(counts.size).toBeGreaterThan(1);
  });
});

describe("scheduledSlotTime", () => {
  it("모든 슬롯이 windowStartHour~windowEndHour(KST) 사이에 들어온다", () => {
    const dateStr = "2026-08-16";
    const count = dailySlotCount("household-y", dateStr);
    for (let slot = 0; slot < count; slot++) {
      const t = scheduledSlotTime("household-y", dateStr, slot, count);
      const kstHour = new Date(t.getTime() + 9 * 60 * 60000).getUTCHours();
      expect(kstHour).toBeGreaterThanOrEqual(SHIP_EVENT_CONFIG.windowStartHour);
      expect(kstHour).toBeLessThan(SHIP_EVENT_CONFIG.windowEndHour);
    }
  });

  it("슬롯 인덱스가 커질수록 시간도 뒤로 간다 (겹치지 않는 버킷 분할)", () => {
    const dateStr = "2026-08-16";
    const count = 3;
    const t0 = scheduledSlotTime("household-z", dateStr, 0, count);
    const t1 = scheduledSlotTime("household-z", dateStr, 1, count);
    const t2 = scheduledSlotTime("household-z", dateStr, 2, count);
    expect(t0.getTime()).toBeLessThan(t1.getTime());
    expect(t1.getTime()).toBeLessThan(t2.getTime());
  });
});

describe("pickShipType", () => {
  it("excludeKey로 지정한 선종은 절대 연속으로 나오지 않는다", () => {
    const random = createSeededRandom("streak-check");
    let prev: string | null = null;
    for (let i = 0; i < 500; i++) {
      const picked = pickShipType(random, prev);
      if (prev) expect(picked.key).not.toBe(prev);
      prev = picked.key;
    }
  });

  it("가중치가 큰 선종(container)이 작은 선종(vlcc)보다 통계적으로 훨씬 자주 뽑힌다", () => {
    const random = createSeededRandom("weight-check");
    const counts: Record<string, number> = {};
    for (let i = 0; i < 5000; i++) {
      const picked = pickShipType(random, null);
      counts[picked.key] = (counts[picked.key] ?? 0) + 1;
    }
    expect(counts["container"]).toBeGreaterThan(counts["vlcc"]);
  });
});

describe("pickReward", () => {
  const shipType = SHIP_TYPES.find((s) => s.key === "container")!;

  it("현금 보상이 항상 cashMin~cashMax 범위(0.5 단위 반올림) 안에 있다", () => {
    const random = createSeededRandom("cash-range");
    for (let i = 0; i < 500; i++) {
      const { cash } = pickReward(shipType, random, []);
      expect(cash).toBeGreaterThanOrEqual(shipType.cashMin);
      expect(cash).toBeLessThanOrEqual(shipType.cashMax);
      expect(cash * 2).toBeCloseTo(Math.round(cash * 2), 10);
    }
  });

  it("카탈로그가 비어있으면 아이템은 절대 나오지 않는다", () => {
    const random = createSeededRandom("no-catalog");
    for (let i = 0; i < 50; i++) {
      const { catalogItemId, itemQty } = pickReward(shipType, random, []);
      expect(catalogItemId).toBeNull();
      expect(itemQty).toBe(0);
    }
  });

  it("아이템이 나오면 항상 catalogRows 중 하나이고 수량은 1이다", () => {
    const random = createSeededRandom("with-catalog");
    const rows = [{ id: "a" }, { id: "b" }, { id: "c" }];
    const validIds = new Set(rows.map((r) => r.id));
    let sawItem = false;
    for (let i = 0; i < 500; i++) {
      const { catalogItemId, itemQty } = pickReward(shipType, random, rows);
      if (catalogItemId) {
        sawItem = true;
        expect(validIds.has(catalogItemId)).toBe(true);
        expect(itemQty).toBe(1);
      } else {
        expect(itemQty).toBe(0);
      }
    }
    expect(sawItem).toBe(true);
  });
});
