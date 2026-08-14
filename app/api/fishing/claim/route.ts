import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getMyHouseholdId } from "@/lib/game/household";
import { pickFishingLoot, createSeededRandom } from "@/lib/game/fishingLoot";

// 기획서 3.13 / FR-FISH-002: 서버 시간으로만 완료를 판정하고, 조건부 UPDATE로
// 최초 1회만 claim이 성공하도록 해 새로고침/중복요청으로 결과가 바뀌지 않게 한다.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { sessionId } = (await request.json()) as { sessionId: string };
  if (!sessionId) return NextResponse.json({ error: "invalid_payload" }, { status: 400 });

  const service = createServiceClient();
  const householdId = await getMyHouseholdId(service, user.id);
  if (!householdId) return NextResponse.json({ error: "no_household" }, { status: 400 });

  const { data: session } = await service
    .from("fishing_sessions")
    .select("id, household_id, duration_hours, ends_at, seed, state")
    .eq("id", sessionId)
    .maybeSingle();

  if (!session || session.household_id !== householdId) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (session.state === "claimed") {
    const { data: existingLoot } = await service
      .from("fishing_loot")
      .select("quantity, item_catalog(name, rarity)")
      .eq("session_id", sessionId);
    return NextResponse.json({ alreadyClaimed: true, loot: formatLoot(existingLoot) });
  }

  if (new Date(session.ends_at).getTime() > Date.now()) {
    return NextResponse.json({ error: "too_early" }, { status: 400 });
  }

  const { data: claimedRows } = await service
    .from("fishing_sessions")
    .update({ state: "claimed", claimed_at: new Date().toISOString() })
    .eq("id", sessionId)
    .eq("state", "running")
    .select("id");

  if (!claimedRows?.length) {
    const { data: existingLoot } = await service
      .from("fishing_loot")
      .select("quantity, item_catalog(name, rarity)")
      .eq("session_id", sessionId);
    return NextResponse.json({ alreadyClaimed: true, loot: formatLoot(existingLoot) });
  }

  const { data: catalog } = await service
    .from("item_catalog")
    .select("id, subcategory, rarity")
    .in("subcategory", ["fish", "lost", "trash", "legend"])
    .eq("active", true);

  const random = createSeededRandom(session.seed);
  const picks = pickFishingLoot(session.duration_hours as 4 | 8, catalog ?? [], random);

  const counts = new Map<string, number>();
  for (const itemId of picks) counts.set(itemId, (counts.get(itemId) ?? 0) + 1);

  const lootRows = Array.from(counts.entries()).map(([catalogItemId, quantity]) => ({
    session_id: sessionId,
    catalog_item_id: catalogItemId,
    quantity,
  }));

  if (lootRows.length > 0) {
    await service.from("fishing_loot").insert(lootRows);
    await service.from("inventory_items").insert(
      lootRows.map((row) => ({
        household_id: householdId,
        catalog_item_id: row.catalog_item_id,
        quantity: row.quantity,
      }))
    );
  }

  const { data: lootWithNames } = await service
    .from("fishing_loot")
    .select("quantity, item_catalog(name, rarity)")
    .eq("session_id", sessionId);

  return NextResponse.json({ alreadyClaimed: false, loot: formatLoot(lootWithNames) });
}

function formatLoot(rows: { quantity: number; item_catalog: unknown }[] | null) {
  return (rows ?? []).map((r) => {
    const catalog = Array.isArray(r.item_catalog) ? r.item_catalog[0] : r.item_catalog;
    const c = catalog as { name?: string; rarity?: string } | null;
    return { name: c?.name ?? "아이템", rarity: c?.rarity ?? "common", quantity: r.quantity };
  });
}
