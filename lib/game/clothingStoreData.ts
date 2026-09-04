import { createClient } from "@/lib/supabase/server";
import { getWalletBalance } from "@/lib/game/wallet";
import { compatKeyFor, clothingTabFor, type CompatKey, type ClothingTabKey } from "@/lib/domain/clothingStoreCategories";
import { bodyPresetKeyFor, isCompatibleWithBody, resolveAppearancePatch, type BodyPresetKey } from "@/lib/domain/itemAppearanceVariants";
import type { CharacterAppearance } from "@/lib/domain/characterPresets";
import type { CharacterKind, ChildGender, ChildStage } from "@/lib/domain/types";
import { haenyeoPreset } from "@/lib/domain/characterPresets";
import { itemIconSrc } from "@/lib/domain/itemIcons";
import { hairCatalogPreviewSrc } from "@/lib/domain/characterFullBody";

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
  category: "outfit" | "hair" | "hat" | "accessory";
  tab: ClothingTabKey;
  price: number;
  ownedInventoryItemIds: string[];
  isNew: boolean;
  isEquipped: boolean;
  imageSrc: string | null;
}

// 옷가게 카드에 쓸 상품 이미지 경로. category='outfit'은 outfit_full의 실제 전신 스프라이트를
// 그대로 쓴다(소품·신발까지 전부 보이는 원본 그림 — 별도로 잘라낸 아이콘을 새로 만들지 않는다).
// hair/hat/accessory는 기존 public/images/items/<sku>.png 아이콘 방식을 그대로 유지한다.
function clothingImageSrc(
  sku: string,
  category: string,
  bodyPresetKey: BodyPresetKey,
  kind: CharacterKind,
  childGender: ChildGender | null,
  childStage: ChildStage | null
): string | null {
  if (category === "outfit") {
    const patch = resolveAppearancePatch(sku, bodyPresetKey);
    if (patch?.outfitAssetKey) return `/images/character/outfit_full/${patch.outfitAssetKey}.png`;
    return null;
  }
  // 헤어는 ITEM_ICON_SKUS 화이트리스트(사각형 아이콘 방식)에 애초에 등록된 적이 없어
  // itemIconSrc가 항상 null이었다 — 실제 착용 시 쓰는 헤어 오버레이 PNG를 그대로
  // 썸네일로 재사용한다(캐릭터별로 이미지가 다르므로 kind/childGender/childStage 필요).
  if (category === "hair") {
    return hairCatalogPreviewSrc(sku, { kind, childGender, childStage });
  }
  return itemIconSrc(sku);
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

    const bodyPresetKey = bodyPresetKeyFor(selected.kind, selected.childGender, selected.childStage);

    const products: ClothingProduct[] = (listings ?? [])
      .map((row) => {
        const catalog = Array.isArray(row.item_catalog) ? row.item_catalog[0] : row.item_catalog;
        if (!catalog || catalog.subcategory !== selected.compatKey) return null;
        // 체형별 전용 그림(appearance variant)이 있는 상품은 지금 선택된 캐릭터의 체형과
        // 맞는 variant가 있을 때만 목록에 노출한다 — 안 맞는 체형 그림을 보여주는 대신
        // 아예 그 캐릭터에게는 상품 자체를 숨긴다(옷가게 목록 단계에서 이미 걸러짐).
        if (!isCompatibleWithBody(catalog.sku, bodyPresetKey)) return null;
        const metadata = catalog.metadata_json as { new?: boolean } | null;
        const category = catalog.category as "outfit" | "hair" | "hat" | "accessory";
        return {
          catalogItemId: catalog.id,
          sku: catalog.sku,
          name: catalog.name,
          description: catalog.description,
          category,
          tab: clothingTabFor(category),
          price: Number(catalog.buy_price),
          ownedInventoryItemIds: ownedInvIdsByCatalogId.get(catalog.id) ?? [],
          isNew: metadata?.new === true,
          isEquipped: equippedCatalogIds.has(catalog.id),
          imageSrc: clothingImageSrc(catalog.sku, category, bodyPresetKey, selected.kind, selected.childGender, selected.childStage),
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
  } catch (err) {
    // 이 함수 전체를 감싸는 catch가 조용히 EMPTY를 돌려주기만 해서, 쿼리 하나라도 실패하면
    // 옷가게 화면엔 "상품이 없어요"만 보이고 실제 원인(RLS, 조인 오류 등)은 로그에도 안
    // 남았다 — 최소한 서버 로그에는 남도록 함.
    console.error("getClothingStoreData failed", err);
    return EMPTY;
  }
}
