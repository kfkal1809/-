import { createClient } from "@/lib/supabase/server";

export interface PlacedFurniture {
  id: string; // space_items.id (temp client id for new placements: "new:<inventoryItemId>")
  inventoryItemId: string;
  sku: string | null;
  name: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  flipX: boolean;
  zIndex: number;
}

export interface UnplacedFurniture {
  inventoryItemId: string;
  sku: string | null;
  name: string;
}

export interface CabinEditData {
  canEdit: boolean;
  spaceId: string | null;
  placed: PlacedFurniture[];
  unplaced: UnplacedFurniture[];
}

const EMPTY: CabinEditData = { canEdit: false, spaceId: null, placed: [], unplaced: [] };

export async function getCabinEditData(): Promise<CabinEditData> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return EMPTY;

    const { data: membership } = await supabase.from("household_users").select("household_id").eq("user_id", user.id).maybeSingle();
    if (!membership) return EMPTY;

    const { data: space } = await supabase
      .from("spaces")
      .select("id")
      .eq("household_id", membership.household_id)
      .eq("type", "cabin")
      .maybeSingle();

    if (!space) return { canEdit: true, spaceId: null, placed: [], unplaced: [] };

    const [{ data: placedRows }, { data: inventoryRows }] = await Promise.all([
      supabase
        .from("space_items")
        .select("id, inventory_item_id, x, y, scale, rotation, flip_x, z_index, item_catalog(sku, name)")
        .eq("space_id", space.id),
      supabase
        .from("inventory_items")
        .select("id, item_catalog(sku, name, placeable)")
        .eq("household_id", membership.household_id),
    ]);

    const placed: PlacedFurniture[] = (placedRows ?? []).map((row) => {
      const catalog = Array.isArray(row.item_catalog) ? row.item_catalog[0] : row.item_catalog;
      return {
        id: row.id,
        inventoryItemId: row.inventory_item_id,
        sku: catalog?.sku ?? null,
        name: catalog?.name ?? "아이템",
        x: Number(row.x),
        y: Number(row.y),
        scale: Number(row.scale),
        rotation: Number(row.rotation),
        flipX: row.flip_x,
        zIndex: row.z_index,
      };
    });

    const placedInventoryIds = new Set(placed.map((p) => p.inventoryItemId));

    const unplaced: UnplacedFurniture[] = (inventoryRows ?? [])
      .map((row) => {
        const catalog = Array.isArray(row.item_catalog) ? row.item_catalog[0] : row.item_catalog;
        if (!catalog?.placeable || placedInventoryIds.has(row.id)) return null;
        return { inventoryItemId: row.id, sku: catalog.sku ?? null, name: catalog.name };
      })
      .filter((v): v is UnplacedFurniture => !!v);

    return { canEdit: true, spaceId: space.id, placed, unplaced };
  } catch {
    return EMPTY;
  }
}
