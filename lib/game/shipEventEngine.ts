import { createSeededRandom } from "@/lib/game/fishingLoot";
import { SHIP_TYPES, SHIP_EVENT_CONFIG } from "@/lib/domain/shipEvents";
import type { ShipTypeConfig } from "@/lib/domain/shipEvents";

// household+날짜 조합으로 결정적 시드를 만들어, 같은 요청을 다시 계산해도
// 같은 하루 스케줄이 나오도록 한다(별도 크론 없이 폴링만으로 lazy-spawn 가능).
export function dailySlotCount(householdId: string, dateStr: string): number {
  const random = createSeededRandom(`ship:${householdId}:${dateStr}:count`);
  const { dailyMin, dailyMax } = SHIP_EVENT_CONFIG;
  return dailyMin + Math.floor(random() * (dailyMax - dailyMin + 1));
}

export function scheduledSlotTime(householdId: string, dateStr: string, slotIndex: number, count: number): Date {
  const { windowStartHour, windowEndHour } = SHIP_EVENT_CONFIG;
  const windowMinutes = (windowEndHour - windowStartHour) * 60;
  const bucketWidth = windowMinutes / count;
  const random = createSeededRandom(`ship:${householdId}:${dateStr}:slot:${slotIndex}`);
  const offsetInBucket = random() * bucketWidth;
  const totalOffsetMinutes = slotIndex * bucketWidth + offsetInBucket;
  const kstMidnight = new Date(`${dateStr}T00:00:00+09:00`);
  return new Date(kstMidnight.getTime() + (windowStartHour * 60 + totalOffsetMinutes) * 60000);
}

// 가중치 기반 선종 선택. excludeKey를 주면 직전 선종을 제외해 연속 반복(스트릭)을 막는다.
export function pickShipType(random: () => number, excludeKey?: string | null): ShipTypeConfig {
  const pool = SHIP_TYPES.filter((s) => s.key !== excludeKey);
  const candidates = pool.length > 0 ? pool : SHIP_TYPES;
  const totalWeight = candidates.reduce((sum, s) => sum + s.spawnWeight, 0);
  let roll = random() * totalWeight;
  for (const ship of candidates) {
    if (roll < ship.spawnWeight) return ship;
    roll -= ship.spawnWeight;
  }
  return candidates[candidates.length - 1];
}

export interface RewardCatalogRow {
  id: string;
}

export function pickReward(
  shipType: ShipTypeConfig,
  random: () => number,
  catalogRows: RewardCatalogRow[]
): { cash: number; catalogItemId: string | null; itemQty: number } {
  const raw = shipType.cashMin + random() * (shipType.cashMax - shipType.cashMin);
  const cash = Math.round(raw * 2) / 2;

  let catalogItemId: string | null = null;
  let itemQty = 0;
  if (catalogRows.length > 0 && random() < shipType.itemChance) {
    catalogItemId = catalogRows[Math.floor(random() * catalogRows.length)].id;
    itemQty = 1;
  }

  return { cash, catalogItemId, itemQty };
}
