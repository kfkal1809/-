import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

interface PlacedPayload {
  inventoryItemId: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  flipX: boolean;
  zIndex: number;
}

// 기획서 3.18 / FR-CABIN-002: 본인 가족의 선실만 편집 가능, 소유권을 서버가 재검증한다.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { spaceId, items } = (await request.json()) as { spaceId: string; items: PlacedPayload[] };
  if (!spaceId || !Array.isArray(items)) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const service = createServiceClient();

  const { data: membership } = await service.from("household_users").select("household_id").eq("user_id", user.id).maybeSingle();
  if (!membership) return NextResponse.json({ error: "no_household" }, { status: 400 });

  const { data: space } = await service
    .from("spaces")
    .select("id, household_id, type")
    .eq("id", spaceId)
    .maybeSingle();

  if (!space || space.type !== "cabin" || space.household_id !== membership.household_id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  if (items.length > 0) {
    const { data: ownedItems } = await service
      .from("inventory_items")
      .select("id")
      .eq("household_id", membership.household_id)
      .in(
        "id",
        items.map((i) => i.inventoryItemId)
      );

    const ownedIds = new Set((ownedItems ?? []).map((i) => i.id));
    const allOwned = items.every((i) => ownedIds.has(i.inventoryItemId));
    if (!allOwned) return NextResponse.json({ error: "item_not_owned" }, { status: 403 });
  }

  await service.from("space_items").delete().eq("space_id", spaceId);

  if (items.length > 0) {
    const { data: catalogLookup } = await service
      .from("inventory_items")
      .select("id, catalog_item_id")
      .in(
        "id",
        items.map((i) => i.inventoryItemId)
      );
    const catalogMap = new Map((catalogLookup ?? []).map((r) => [r.id, r.catalog_item_id]));

    const rows = items.map((i) => ({
      space_id: spaceId,
      inventory_item_id: i.inventoryItemId,
      catalog_item_id: catalogMap.get(i.inventoryItemId) ?? null,
      x: Math.min(1, Math.max(0, i.x)),
      y: Math.min(1, Math.max(0, i.y)),
      scale: i.scale,
      rotation: i.rotation,
      flip_x: i.flipX,
      z_index: i.zIndex,
    }));

    const { error: insertError } = await service.from("space_items").insert(rows);
    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
