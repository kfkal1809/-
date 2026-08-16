import { createClient } from "@/lib/supabase/server";
import { haenyeoPreset } from "@/lib/domain/characterPresets";
import type { CharacterAppearance } from "@/lib/domain/characterPresets";
import type { CharacterKind, ChildGender, ChildStage } from "@/lib/domain/types";

export interface EquipCandidate {
  inventoryItemId: string;
  catalogItemId: string;
  sku: string;
  name: string;
  category: "hair" | "outfit" | "hat" | "accessory";
}

export interface CustomizeData {
  found: boolean;
  canEdit: boolean;
  characterId: string;
  nickname: string;
  roleLabel: string;
  kind: CharacterKind;
  childGender: ChildGender | null;
  childStage: ChildStage | null;
  appearance: CharacterAppearance;
  candidates: EquipCandidate[];
}

const NOT_FOUND = (characterId: string): CustomizeData => ({
  found: false,
  canEdit: false,
  characterId,
  nickname: "",
  roleLabel: "",
  kind: "haenyeo",
  childGender: null,
  childStage: null,
  appearance: haenyeoPreset(),
  candidates: [],
});

export async function getCustomizeData(characterId: string): Promise<CustomizeData> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: character } = await supabase
      .from("characters")
      .select("id, kind, nickname, department, child_gender, child_stage, appearance_json, household_id")
      .eq("id", characterId)
      .maybeSingle();

    if (!character) return NOT_FOUND(characterId);

    let canEdit = false;
    if (user) {
      const { data: manager } = await supabase
        .from("character_managers")
        .select("character_id")
        .eq("character_id", characterId)
        .eq("user_id", user.id)
        .maybeSingle();
      canEdit = !!manager;
    }

    const EQUIP_CATEGORIES = new Set(["hair", "outfit", "hat", "accessory"]);

    const { data: items } = await supabase
      .from("inventory_items")
      .select("id, catalog_item_id, item_catalog(sku, name, category)")
      .eq("household_id", character.household_id);

    const candidates: EquipCandidate[] = (items ?? [])
      .map((row) => {
        const catalog = Array.isArray(row.item_catalog) ? row.item_catalog[0] : row.item_catalog;
        if (!catalog || !EQUIP_CATEGORIES.has(catalog.category)) return null;
        return {
          inventoryItemId: row.id,
          catalogItemId: row.catalog_item_id,
          sku: catalog.sku,
          name: catalog.name,
          category: catalog.category,
        } as EquipCandidate;
      })
      .filter((c): c is EquipCandidate => !!c);

    const roleLabel =
      character.kind === "haenyeo"
        ? "해녀"
        : character.kind === "child"
          ? "새싹"
          : character.department === "engine"
            ? "해남(기관사)"
            : "해남(항해사)";

    return {
      found: true,
      canEdit,
      characterId,
      nickname: character.nickname,
      roleLabel,
      kind: character.kind as CharacterKind,
      childGender: character.child_gender as ChildGender | null,
      childStage: character.child_stage as ChildStage | null,
      appearance: (character.appearance_json as CharacterAppearance) ?? haenyeoPreset(),
      candidates,
    };
  } catch {
    return NOT_FOUND(characterId);
  }
}
