import type { SupabaseClient } from "@supabase/supabase-js";

export interface RewardCatalogRow {
  id: string;
  name: string;
  rarity: string;
  category: string;
}

const DEFAULT_RARITY_WEIGHT: Record<string, number> = { common: 60, rare: 25, epic: 12, legendary: 3 };
const BOOSTED_RARITY_WEIGHT: Record<string, number> = { common: 40, rare: 32, epic: 20, legendary: 8 };

export function weightedPickReward(
  items: RewardCatalogRow[],
  random: () => number,
  boosted = false
): RewardCatalogRow | null {
  if (items.length === 0) return null;
  const weights = boosted ? BOOSTED_RARITY_WEIGHT : DEFAULT_RARITY_WEIGHT;
  const pool = items.map((item) => ({ item, weight: weights[item.rarity] ?? 1 }));
  const total = pool.reduce((sum, p) => sum + p.weight, 0);
  let roll = random() * total;
  for (const p of pool) {
    if (roll < p.weight) return p.item;
    roll -= p.weight;
  }
  return pool[pool.length - 1].item;
}

// 선실/캐릭터 꾸미기용 랜덤 보상 후보(옷/헤어/모자/소품/가구) 조회.
export async function getDecorativeCatalog(service: SupabaseClient): Promise<RewardCatalogRow[]> {
  const { data } = await service
    .from("item_catalog")
    .select("id, name, rarity, category")
    .in("category", ["hair", "outfit", "hat", "accessory", "furniture"])
    .eq("active", true);
  return data ?? [];
}

// 조리하기(선내식당) 보상 후보 — 잡은 생선을 손질/조리한 결과물.
export async function getDishCatalog(service: SupabaseClient): Promise<RewardCatalogRow[]> {
  const { data } = await service.from("item_catalog").select("id, name, rarity, category").eq("subcategory", "dish").eq("active", true);
  return data ?? [];
}
