import { createClient } from "@/lib/supabase/server";
import type { ItemRarity } from "@/lib/domain/types";

export interface InventoryItemRow {
  id: string;
  sku: string | null;
  name: string;
  category: string;
  subcategory: string | null;
  rarity: ItemRarity;
  quantity: number;
  sourceLabel: string | null;
  isNew: boolean;
}

export async function getInventoryItems(): Promise<{ isDemo: boolean; items: InventoryItemRow[] }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { isDemo: true, items: [] };

    const { data: membership } = await supabase.from("household_users").select("household_id").eq("user_id", user.id).maybeSingle();
    if (!membership) return { isDemo: true, items: [] };

    const { data: rows } = await supabase
      .from("inventory_items")
      .select("id, quantity, acquired_at, item_catalog(sku, name, category, subcategory, rarity, source_label)")
      .eq("household_id", membership.household_id)
      .order("acquired_at", { ascending: false });

    const cutoff = Date.now() - 1000 * 60 * 60 * 48;

    const items: InventoryItemRow[] = (rows ?? []).map((r) => {
      const catalog = Array.isArray(r.item_catalog) ? r.item_catalog[0] : r.item_catalog;
      return {
        id: r.id,
        sku: catalog?.sku ?? null,
        name: catalog?.name ?? "이름 없는 아이템",
        category: catalog?.category ?? "special",
        subcategory: catalog?.subcategory ?? null,
        rarity: (catalog?.rarity as ItemRarity) ?? "common",
        quantity: r.quantity,
        sourceLabel: catalog?.source_label ?? null,
        isNew: new Date(r.acquired_at).getTime() > cutoff,
      };
    });

    return { isDemo: false, items };
  } catch {
    return { isDemo: true, items: [] };
  }
}
