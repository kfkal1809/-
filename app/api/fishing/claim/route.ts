import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getMyHouseholdId } from "@/lib/game/household";

// 기획서 3.13 / FR-FISH-002: 서버 시간으로만 완료를 판정하고, 조건부 UPDATE로
// 최초 1회만 claim이 성공하도록 해 새로고침/중복요청으로 결과가 바뀌지 않게 한다.
//
// loot는 세션 시작 시점에 이미 scheduled_loot로 확정돼 저장돼 있으므로 여기서 다시 뽑지
// 않고 그 목록을 그대로 지급한다 — 화면에 하나씩 뜬 알림과 최종 지급 결과가 항상 일치하게.
// 실시간 탭 타이밍 미니게임에 성공한 항목(tap_bonus_indices)은 같은 아이템을 하나씩 더 준다.
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
    .select("id, household_id, ends_at, state, scheduled_loot, tap_bonus_indices")
    .eq("id", sessionId)
    .maybeSingle();

  if (!session || session.household_id !== householdId) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (session.state === "claimed") {
    const { data: existingLoot } = await service
      .from("fishing_loot")
      .select("quantity, item_catalog(sku, name, rarity)")
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
      .select("quantity, item_catalog(sku, name, rarity)")
      .eq("session_id", sessionId);
    return NextResponse.json({ alreadyClaimed: true, loot: formatLoot(existingLoot) });
  }

  const schedule = (session.scheduled_loot as { catalogItemId: string; offsetMinutes: number }[] | null) ?? [];
  const tapBonusIndices = (session.tap_bonus_indices as number[] | null) ?? [];

  const counts = new Map<string, number>();
  for (const entry of schedule) counts.set(entry.catalogItemId, (counts.get(entry.catalogItemId) ?? 0) + 1);
  for (const index of tapBonusIndices) {
    const entry = schedule[index];
    if (entry) counts.set(entry.catalogItemId, (counts.get(entry.catalogItemId) ?? 0) + 1);
  }

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
    .select("quantity, item_catalog(sku, name, rarity)")
    .eq("session_id", sessionId);

  return NextResponse.json({ alreadyClaimed: false, loot: formatLoot(lootWithNames) });
}

function formatLoot(rows: { quantity: number; item_catalog: unknown }[] | null) {
  return (rows ?? []).map((r) => {
    const catalog = Array.isArray(r.item_catalog) ? r.item_catalog[0] : r.item_catalog;
    const c = catalog as { sku?: string; name?: string; rarity?: string } | null;
    return { sku: c?.sku ?? null, name: c?.name ?? "아이템", rarity: c?.rarity ?? "common", quantity: r.quantity };
  });
}
