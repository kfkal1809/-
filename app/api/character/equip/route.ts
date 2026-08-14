import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { ITEM_APPEARANCE_PATCH, CATEGORY_TO_SLOT } from "@/lib/domain/itemAppearance";
import type { CharacterAppearance } from "@/lib/domain/characterPresets";

// 기획서 1.27 / 5.6(Character Write): character_managers에 포함된 사용자만 외형을 바꿀 수 있다.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { characterId, inventoryItemId } = (await request.json()) as {
    characterId: string;
    inventoryItemId: string;
  };
  if (!characterId || !inventoryItemId) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const service = createServiceClient();

  const { data: manager } = await service
    .from("character_managers")
    .select("character_id")
    .eq("character_id", characterId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!manager) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { data: character } = await service
    .from("characters")
    .select("id, household_id, appearance_json")
    .eq("id", characterId)
    .maybeSingle();
  if (!character) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const { data: invItem } = await service
    .from("inventory_items")
    .select("id, household_id, item_catalog(sku, category)")
    .eq("id", inventoryItemId)
    .maybeSingle();

  const catalog = invItem ? (Array.isArray(invItem.item_catalog) ? invItem.item_catalog[0] : invItem.item_catalog) : null;

  if (!invItem || invItem.household_id !== character.household_id || !catalog) {
    return NextResponse.json({ error: "item_not_owned" }, { status: 403 });
  }

  const slot = CATEGORY_TO_SLOT[catalog.category];
  if (!slot) return NextResponse.json({ error: "not_equippable" }, { status: 400 });

  await service
    .from("character_equipment")
    .upsert({ character_id: characterId, slot, inventory_item_id: inventoryItemId }, { onConflict: "character_id,slot" });

  const patch = ITEM_APPEARANCE_PATCH[catalog.sku] ?? {};
  const nextAppearance: CharacterAppearance = { ...(character.appearance_json as CharacterAppearance), ...patch };

  await service.from("characters").update({ appearance_json: nextAppearance }).eq("id", characterId);

  return NextResponse.json({ ok: true, appearance: nextAppearance, slot });
}
