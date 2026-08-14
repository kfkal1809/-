import type { SupabaseClient } from "@supabase/supabase-js";
import { createSeededRandom } from "@/lib/game/fishingLoot";
import { kstDateString } from "@/lib/game/kst";
import { dailySlotCount, scheduledSlotTime, pickShipType, pickReward } from "@/lib/game/shipEventEngine";
import { SHIP_TYPES, SHIP_EVENT_CONFIG } from "@/lib/domain/shipEvents";

export interface ShipEventRow {
  id: string;
  ship_type_key: string;
  spawned_at: string;
  expires_at: string;
  status: string;
  reward_cash: number;
  reward_catalog_item_id: string | null;
  reward_item_qty: number;
  claimed_at: string | null;
  item_catalog?: { name: string; rarity: string } | { name: string; rarity: string }[] | null;
}

const EVENT_SELECT =
  "id, ship_type_key, spawned_at, expires_at, status, reward_cash, reward_catalog_item_id, reward_item_qty, claimed_at, item_catalog(name, rarity)";

export function serializeShipEvent(row: ShipEventRow) {
  const ship = SHIP_TYPES.find((s) => s.key === row.ship_type_key);
  const catalog = Array.isArray(row.item_catalog) ? row.item_catalog[0] : row.item_catalog;
  return {
    id: row.id,
    shipTypeKey: row.ship_type_key,
    shipTypeName: ship?.name ?? row.ship_type_key,
    themeLabel: ship?.themeLabel ?? "",
    hullColor: ship?.hullColor ?? "#5b7a94",
    deckColor: ship?.deckColor ?? "#d8cdb8",
    accentColor: ship?.accentColor ?? "#3a4f63",
    spawnedAt: row.spawned_at,
    expiresAt: row.expires_at,
    status: row.status,
    rewardCash: Number(row.reward_cash),
    rewardItem: catalog ? { name: catalog.name, rarity: catalog.rarity, quantity: row.reward_item_qty } : null,
  };
}

export async function creditShipEventReward(
  service: SupabaseClient,
  householdId: string,
  row: { id: string; reward_cash: number; reward_catalog_item_id: string | null; reward_item_qty: number }
) {
  if (Number(row.reward_cash) > 0) {
    await service.rpc("apply_wallet_transaction", {
      p_household_id: householdId,
      p_amount: row.reward_cash,
      p_type: "ship_event_reward",
      p_idempotency_key: `ship_event:${row.id}`,
      p_metadata: {},
      p_created_by: null,
    });
  }
  if (row.reward_catalog_item_id && row.reward_item_qty > 0) {
    await service.from("inventory_items").insert({
      household_id: householdId,
      catalog_item_id: row.reward_catalog_item_id,
      quantity: row.reward_item_qty,
    });
  }
}

async function autoCollectExpiredEvent(service: SupabaseClient, householdId: string, row: ShipEventRow) {
  const { data: updatedRows } = await service
    .from("ship_events")
    .update({ status: "auto_collected", claimed_at: new Date().toISOString() })
    .eq("id", row.id)
    .eq("status", "active")
    .select("id");

  if (!updatedRows?.length) return; // 다른 요청이 이미 처리함

  await creditShipEventReward(service, householdId, row);

  const { data: members } = await service.from("household_users").select("user_id").eq("household_id", householdId);
  const ship = SHIP_TYPES.find((s) => s.key === row.ship_type_key);
  if (members?.length) {
    await service.from("notifications").insert(
      members.map((m: { user_id: string }) => ({
        user_id: m.user_id,
        type: "ship_event_auto_collect",
        title: "지나간 선박이 두고 간 선물",
        body: `${ship?.name ?? "선박"}이 놓고 간 선물이 자동으로 보관함에 담겼어요.`,
      }))
    );
  }
}

// 활성 이벤트가 있으면 반환하고, 그레이스 기간이 지났다면 조용히 자동 수령 처리 후 null을 반환한다
// (스트레스 없는 디자인: 보상을 놓쳐도 사라지지 않고 보관함으로 들어간다).
export async function resolveActiveShipEvent(service: SupabaseClient, householdId: string): Promise<ShipEventRow | null> {
  const { data: activeRow } = await service
    .from("ship_events")
    .select(EVENT_SELECT)
    .eq("household_id", householdId)
    .eq("status", "active")
    .maybeSingle();

  if (!activeRow) return null;

  const row = activeRow as unknown as ShipEventRow;
  if (new Date(row.expires_at).getTime() > Date.now()) return row;

  await autoCollectExpiredEvent(service, householdId, row);
  return null;
}

export async function trySpawnDueShipEvent(service: SupabaseClient, householdId: string): Promise<ShipEventRow | null> {
  const now = new Date();
  const dateStr = kstDateString(now);
  const count = dailySlotCount(householdId, dateStr);

  const { data: existingToday } = await service
    .from("ship_events")
    .select("slot_index")
    .eq("household_id", householdId)
    .eq("event_date", dateStr);

  const existingSlots = new Set((existingToday ?? []).map((r: { slot_index: number }) => r.slot_index));

  let dueSlot: number | null = null;
  for (let i = 0; i < count; i++) {
    if (existingSlots.has(i)) continue;
    if (scheduledSlotTime(householdId, dateStr, i, count).getTime() <= now.getTime()) {
      dueSlot = i;
      break;
    }
  }
  if (dueSlot === null) return null;

  return spawnShipEventSlot(service, householdId, dateStr, dueSlot);
}

// dueSlot을 직접 지정해 즉시 스폰 — QA용 디버그 트리거에서도 재사용한다.
export async function spawnShipEventSlot(
  service: SupabaseClient,
  householdId: string,
  dateStr: string,
  slotIndex: number
): Promise<ShipEventRow | null> {
  const { data: lastEvent } = await service
    .from("ship_events")
    .select("ship_type_key")
    .eq("household_id", householdId)
    .order("spawned_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const random = createSeededRandom(`ship:${householdId}:${dateStr}:pick:${slotIndex}:${Date.now()}`);
  const shipType = pickShipType(random, (lastEvent as { ship_type_key: string } | null)?.ship_type_key ?? null);

  const { data: catalogRows } = await service
    .from("item_catalog")
    .select("id")
    .eq("subcategory", shipType.catalogSubcategory)
    .eq("active", true);

  const reward = pickReward(shipType, random, catalogRows ?? []);
  const now = new Date();
  const spawnedAt = now.toISOString();
  const expiresAt = new Date(now.getTime() + SHIP_EVENT_CONFIG.gracePeriodHours * 3600000).toISOString();

  const { error: insertError } = await service.from("ship_events").insert({
    household_id: householdId,
    event_date: dateStr,
    slot_index: slotIndex,
    ship_type_key: shipType.key,
    spawned_at: spawnedAt,
    expires_at: expiresAt,
    status: "active",
    reward_cash: reward.cash,
    reward_catalog_item_id: reward.catalogItemId,
    reward_item_qty: reward.itemQty,
  });

  if (insertError && insertError.code !== "23505") return null;

  const { data: spawnedRow } = await service
    .from("ship_events")
    .select(EVENT_SELECT)
    .eq("household_id", householdId)
    .eq("event_date", dateStr)
    .eq("slot_index", slotIndex)
    .maybeSingle();

  return (spawnedRow as unknown as ShipEventRow) ?? null;
}

export { EVENT_SELECT };
