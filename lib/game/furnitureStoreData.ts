import { createClient } from "@/lib/supabase/server";
import { getWalletBalance } from "@/lib/game/wallet";
import { storeTabForSku, type StoreTabKey } from "@/lib/domain/furnitureStoreCategories";

export interface FurnitureStoreProduct {
  catalogItemId: string;
  sku: string;
  name: string;
  description: string | null;
  price: number;
  ownedQuantity: number;
  isNew: boolean;
  tab: StoreTabKey;
}

export interface FurnitureStoreData {
  ready: boolean;
  balance: number;
  products: FurnitureStoreProduct[];
  recommendedCatalogItemId: string | null;
}

const EMPTY: FurnitureStoreData = { ready: false, balance: 0, products: [], recommendedCatalogItemId: null };

// 오늘 날짜를 시드로 한 결정적 추천 — 매번 랜덤이 아니라 하루 동안은 같은 상품이 추천되도록
// 날짜 문자열의 문자 코드 합을 상품 개수로 나눈 나머지를 인덱스로 쓴다.
function pickRecommendation<T>(items: T[], seed: string): T | null {
  if (items.length === 0) return null;
  const sum = seed.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return items[sum % items.length];
}

export async function getFurnitureStoreData(): Promise<FurnitureStoreData> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return EMPTY;

    const { data: membership } = await supabase.from("household_users").select("household_id").eq("user_id", user.id).maybeSingle();
    if (!membership) return EMPTY;

    const { data: store } = await supabase.from("stores").select("id").eq("slug", "furniture").maybeSingle();
    if (!store) return EMPTY;

    const [{ data: listings }, { data: ownedRows }, balance] = await Promise.all([
      supabase
        .from("store_products")
        .select("sort_order, item_catalog(id, sku, name, description, buy_price, metadata_json)")
        .eq("store_id", store.id)
        .eq("active", true)
        .order("sort_order"),
      supabase.from("inventory_items").select("catalog_item_id, quantity").eq("household_id", membership.household_id),
      getWalletBalance(supabase, membership.household_id),
    ]);

    const ownedByCatalogId = new Map<string, number>();
    for (const row of ownedRows ?? []) {
      ownedByCatalogId.set(row.catalog_item_id, (ownedByCatalogId.get(row.catalog_item_id) ?? 0) + row.quantity);
    }

    const products: FurnitureStoreProduct[] = (listings ?? [])
      .map((row) => {
        const catalog = Array.isArray(row.item_catalog) ? row.item_catalog[0] : row.item_catalog;
        if (!catalog) return null;
        const metadata = catalog.metadata_json as { new?: boolean } | null;
        return {
          catalogItemId: catalog.id,
          sku: catalog.sku,
          name: catalog.name,
          description: catalog.description,
          price: Number(catalog.buy_price),
          ownedQuantity: ownedByCatalogId.get(catalog.id) ?? 0,
          isNew: metadata?.new === true,
          tab: storeTabForSku(catalog.sku),
        } satisfies FurnitureStoreProduct;
      })
      .filter((p): p is FurnitureStoreProduct => !!p);

    const todayKey = new Date().toISOString().slice(0, 10);
    const recommended = pickRecommendation(products, todayKey);

    return { ready: true, balance, products, recommendedCatalogItemId: recommended?.catalogItemId ?? null };
  } catch {
    return EMPTY;
  }
}
