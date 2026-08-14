// 기획서 1.32/1.33: 4시간 2~4개, 8시간 5~8개, 8시간은 희귀도 가중치 상승.
export interface LootCatalogRow {
  id: string;
  subcategory: string | null;
  rarity: string;
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
  const count = durationHours === 4 ? 2 + Math.floor(seedRandom() * 3) : 5 + Math.floor(seedRandom() * 4);

  const results: string[] = [];
  for (let i = 0; i < count; i++) {
    let roll = seedRandom() * totalWeight;
    let picked = weightedPool[weightedPool.length - 1].itemId;
    for (const entry of weightedPool) {
      if (roll < entry.weight) {
        picked = entry.itemId;
        break;
      }
      roll -= entry.weight;
    }
    results.push(picked);
  }
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
