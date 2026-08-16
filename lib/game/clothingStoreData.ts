import { createClient } from "@/lib/supabase/server";
import { getWalletBalance } from "@/lib/game/wallet";
import { compatKeyFor, clothingTabFor, type CompatKey, type ClothingTabKey } from "@/lib/domain/clothingStoreCategories";
import type { CharacterAppearance } from "@/lib/domain/characterPresets";
import type { CharacterKind, ChildGender, ChildStage } from "@/lib/domain/types";
import { haenyeoPreset } from "@/lib/domain/characterPresets";

export interface ClothingCharacterOption {
  id: string;
  nickname: string;
  kind: CharacterKind;
  roleLabel: string;
  childGender: ChildGender | null;
  childStage: ChildStage | null;
  compatKey: CompatKey;
}

export interface ClothingProduct {
  catalogItemId: string;
  sku: string;
  name: string;
  description: string | null;
  category: "outfit" | "hat" | "accessory";
  tab: ClothingTabKey;
  price: number;
  ownedInventoryItemIds: string[];
  isNew: boolean;
  isEquipped: boolean;
}

export interface ClothingStoreData {
  ready: boolean;
  balance: number;
  characters: ClothingCharacterOption[];
  selectedCharacterId: string | null;
  equippedAppearance: CharacterAppearance | null;
  selectedKind: CharacterKind;
  selectedChildGender: ChildGender | null;
  selectedChildStage: ChildStage | null;
  canEdit: boolean;
  products: ClothingProduct[];
}

const EMPTY: ClothingStoreData = {
  ready: false,
  balance: 0,
  characters: [],
  selectedCharacterId: null,
  equippedAppearance: null,
  selectedKind: "haenyeo",
  selectedChildGender: null,
  selectedChildStage: null,
  canEdit: false,
  products: [],
};

export async function getClothingStoreData(requestedCharacterId?: string): Promise<ClothingStoreData> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return EMPTY;

    const { data: managerRows } = await supabase
      .from("character_managers")
      .select("characters(id, nickname, kind, department, child_gender, child_stage, appearance_json, household_id)")
      .eq("user_id", user.id);

    const characters: ClothingCharacterOption[] = (managerRows ?? [])
      .map((row) => {
        const c = Array.isArray(row.characters) ? row.characters[0] : row.characters;
        if (!c) return null;
        const roleLabel =
          c.kind === "haenyeo"
            ? "해녀"
            : c.kind === "child"
              ? "새싹"
              : c.department === "engine"
                ? "해남(기관사)"
                : "해남(항해사)";
        return {
          id: c.id,
          nickname: c.nickname,
          kind: c.kind as CharacterKind,
          roleLabel,
          childGender: c.child_gender as ChildGender | null,
          childStage: c.child_stage as ChildStage | null,
          compatKey: compatKeyFor(c.kind, c.department),
        } satisfies ClothingCharacterOption;
      })
      .filter((c): c is ClothingCharacterOption => !!c);

    if (characters.length === 0) return EMPTY;

    const selected = characters.find((c) => c.id === requestedCharacterId) ?? characters[0];

    const { data: characterRow } = await supabase
      .from("characters")
      .select("appearance_json, household_id")
      .eq("id", selected.id)
      .maybeSingle();
    if (!characterRow) return EMPTY;

    const { data: store } = await supabase.from("stores").select("id").eq("slug", "clothing").maybeSingle();
    if (!store) {
      return {
        ...EMPTY,
        ready: true,
        characters,
        selectedCharacterId: selected.id,
        canEdit: true,
        selectedKind: selected.kind,
        selectedChildGender: selected.childGender,
        selectedChildStage: selected.childStage,
        equippedAppearance: (characterRow.appearance_json as CharacterAppearance) ?? haenyeoPreset(),
      };
    }

    const [{ data: listings }, { data: ownedRows }, { data: equipment }, balance] = await Promise.all([
      supabase
        .from("store_products")
        .select("sort_order, item_catalog(id, sku, name, description, category, subcategory, buy_price, metadata_json)")
        .eq("store_id", store.id)
        .eq("active", true)
        .order("sort_order"),
      supabase
        .from("inventory_items")
        .select("id, catalog_item_id")
        .eq("household_id", characterRow.household_id),
      supabase.from("character_equipment").select("slot, inventory_item_id").eq("character_id", selected.id),
      getWalletBalance(supabase, characterRow.household_id),
    ]);

    const ownedInvIdsByCatalogId = new Map<string, string[]>();
    const catalogIdByInvId = new Map<string, string>();
    for (const row of ownedRows ?? []) {
      catalogIdByInvId.set(row.id, row.catalog_item_id);
      const list = ownedInvIdsByCatalogId.get(row.catalog_item_id) ?? [];
      list.push(row.id);
      ownedInvIdsByCatalogId.set(row.catalog_item_id, list);
    }

    const equippedCatalogIds = new Set(
      (equipment ?? [])
        .map((e) => (e.inventory_item_id ? catalogIdByInvId.get(e.inventory_item_id) : null))
        .filter((id): id is string => !!id)
    );

    const products: ClothingProduct[] = (listings ?? [])
      .map((row) => {
        const catalog = Array.isArray(row.item_catalog) ? row.item_catalog[0] : row.item_catalog;
        if (!catalog || catalog.subcategory !== selected.compatKey) return null;
        const metadata = catalog.metadata_json as { new?: boolean } | null;
        const category = catalog.category as "outfit" | "hat" | "accessory";
        return {
          catalogItemId: catalog.id,
          sku: catalog.sku,
          name: catalog.name,
          description: catalog.description,
          category,
          tab: clothingTabFor(category, catalog.sku),
          price: Number(catalog.buy_price),
          ownedInventoryItemIds: ownedInvIdsByCatalogId.get(catalog.id) ?? [],
          isNew: metadata?.new === true,
          isEquipped: equippedCatalogIds.has(catalog.id),
        } satisfies ClothingProduct;
      })
      .filter((p): p is ClothingProduct => !!p);

    return {
      ready: true,
      balance,
      characters,
      selectedCharacterId: selected.id,
      equippedAppearance: (characterRow.appearance_json as CharacterAppearance) ?? haenyeoPreset(),
      selectedKind: selected.kind,
      selectedChildGender: selected.childGender,
      selectedChildStage: selected.childStage,
      canEdit: true,
      products,
    };
  } catch {
    return EMPTY;
  }
}
