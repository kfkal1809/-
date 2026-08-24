// 기획서 1.32/1.33 확장: 4시간 7~9개, 8시간 15~17개(대략 30분에 한 개꼴 — 예전 2~4개/5~8개는
// 1~2시간에 한 개꼴이라 너무 뜸하다는 피드백으로 상향), 8시간은 희귀도 가중치도 여전히 상승.
export interface LootCatalogRow {
  id: string;
  subcategory: string | null;
  rarity: string;
}

// 세션 시작 시점에 결정되는 "언제 무엇이 잡히는지" 한 항목.
export interface ScheduledCatch {
  itemId: string;
  offsetMinutes: number;
}

const BUCKET_WEIGHTS: Record<number, Record<string, number>> = {
  4: { trash: 40, fish_common: 35, fish_rare: 15, lost: 8, legend: 2 },
  8: { trash: 25, fish_common: 30, fish_rare: 25, lost: 15, legend: 5 },
};

function bucketOf(item: LootCatalogRow): string | null {
  if (item.subcategory === "fish") return item.rarity === "common" ? "fish_common" : "fish_rare";
  if (item.subcategory === "trash") return "trash";
  if (item.subcategory === "lost") return "lost";
  if (item.subcategory === "legend") return "legend";
  return null;
}

export function pickFishingLoot(durationHours: 4 | 8, catalog: LootCatalogRow[], seedRandom: () => number): string[] {
  const buckets = new Map<string, LootCatalogRow[]>();
  for (const item of catalog) {
    const bucket = bucketOf(item);
    if (!bucket) continue;
    if (!buckets.has(bucket)) buckets.set(bucket, []);
    buckets.get(bucket)!.push(item);
  }

  const weights = BUCKET_WEIGHTS[durationHours];
  const weightedPool: { itemId: string; weight: number }[] = [];
  for (const [bucket, items] of buckets.entries()) {
    const bucketWeight = weights[bucket] ?? 0;
    if (bucketWeight <= 0 || items.length === 0) continue;
    const perItemWeight = bucketWeight / items.length;
    for (const item of items) {
      weightedPool.push({ itemId: item.id, weight: perItemWeight });
    }
  }

  if (weightedPool.length === 0) return [];

  const totalWeight = weightedPool.reduce((sum, w) => sum + w.weight, 0);
  const count = pickCatchCount(durationHours, seedRandom);

  const results: string[] = [];
  for (let i = 0; i < count; i++) {
    results.push(rollOne(weightedPool, totalWeight, seedRandom));
  }
  return results;
}

// 30분에 한 개꼴이 되도록 duration(분)/30을 기준으로 살짝 흔들어준다.
function pickCatchCount(durationHours: 4 | 8, seedRandom: () => number): number {
  return durationHours === 4 ? 7 + Math.floor(seedRandom() * 3) : 15 + Math.floor(seedRandom() * 3);
}

function rollOne(weightedPool: { itemId: string; weight: number }[], totalWeight: number, seedRandom: () => number): string {
  let roll = seedRandom() * totalWeight;
  for (const entry of weightedPool) {
    if (roll < entry.weight) return entry.itemId;
    roll -= entry.weight;
  }
  return weightedPool[weightedPool.length - 1].itemId;
}

// pickFishingLoot과 완전히 같은 가중치 로직으로 아이템을 뽑되, "언제 잡히는지"(세션 시작
// 후 몇 분)도 같이 정해서 돌려준다 — 세션 시작 시점에 한 번만 호출해 DB(scheduled_loot)에
// 저장하고, 화면은 그 저장된 스케줄을 그대로 재생만 한다(클라이언트가 몰래 다시 뽑을 수
// 없게, 서버가 시작 시점에 이미 확정).  각 항목은 duration을 count등분한 슬롯 안에서
// ±30% 지터를 줘서 로봇처럼 정확히 30분 간격이 아니라 자연스럽게 들쭉날쭉하게 잡힌다.
export function pickFishingLootSchedule(durationHours: 4 | 8, catalog: LootCatalogRow[], seedRandom: () => number): ScheduledCatch[] {
  const buckets = new Map<string, LootCatalogRow[]>();
  for (const item of catalog) {
    const bucket = bucketOf(item);
    if (!bucket) continue;
    if (!buckets.has(bucket)) buckets.set(bucket, []);
    buckets.get(bucket)!.push(item);
  }

  const weights = BUCKET_WEIGHTS[durationHours];
  const weightedPool: { itemId: string; weight: number }[] = [];
  for (const [bucket, items] of buckets.entries()) {
    const bucketWeight = weights[bucket] ?? 0;
    if (bucketWeight <= 0 || items.length === 0) continue;
    const perItemWeight = bucketWeight / items.length;
    for (const item of items) {
      weightedPool.push({ itemId: item.id, weight: perItemWeight });
    }
  }

  if (weightedPool.length === 0) return [];

  const totalWeight = weightedPool.reduce((sum, w) => sum + w.weight, 0);
  const count = pickCatchCount(durationHours, seedRandom);
  const durationMinutes = durationHours * 60;
  const slot = durationMinutes / count;

  const results: ScheduledCatch[] = [];
  for (let i = 0; i < count; i++) {
    const itemId = rollOne(weightedPool, totalWeight, seedRandom);
    const jitter = (seedRandom() - 0.5) * slot * 0.6;
    const offsetMinutes = Math.min(durationMinutes - 0.5, Math.max(0.5, slot * (i + 0.5) + jitter));
    results.push({ itemId, offsetMinutes });
  }
  results.sort((a, b) => a.offsetMinutes - b.offsetMinutes);
  return results;
}

// seed 문자열 기반의 결정적 의사난수 생성기 — 같은 세션을 다시 계산해도 같은 결과가 나오도록.
export function createSeededRandom(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}
