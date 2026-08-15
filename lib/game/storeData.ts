import { createClient } from "@/lib/supabase/server";

export interface StoreProduct {
  catalogItemId: string;
  sku: string | null;
  name: string;
  price: number;
  placeable: boolean;
}

export async function getStoreProducts(storeSlug: string): Promise<StoreProduct[]> {
  try {
    const supabase = await createClient();
    const { data: store } = await supabase.from("stores").select("id").eq("slug", storeSlug).maybeSingle();
    if (!store) return [];

    const { data } = await supabase
      .from("store_products")
      .select("catalog_item_id, sort_order, item_catalog(id, sku, name, buy_price, placeable)")
      .eq("store_id", store.id)
      .eq("active", true)
      .order("sort_order");

    return (data ?? [])
      .map((row) => {
        const catalog = Array.isArray(row.item_catalog) ? row.item_catalog[0] : row.item_catalog;
        if (!catalog) return null;
        return {
          catalogItemId: catalog.id,
          sku: catalog.sku ?? null,
          name: catalog.name,
          price: catalog.buy_price,
          placeable: catalog.placeable,
        };
      })
      .filter((p): p is StoreProduct => !!p);
  } catch {
    return [];
  }
}
