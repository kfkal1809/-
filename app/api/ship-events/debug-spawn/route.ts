import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getMyHouseholdId } from "@/lib/game/household";
import { kstDateString } from "@/lib/game/kst";
import { resolveActiveShipEvent, spawnShipEventSlot, serializeShipEvent } from "@/lib/game/shipEventService";

// QA 전용 디버그 트리거 — 정규 스케줄과 무관하게 즉시 선박 이벤트를 스폰한다.
// 운영 빌드에서는 라우트 자체가 없는 것처럼 404를 반환한다.
export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const service = createServiceClient();
  const householdId = await getMyHouseholdId(service, user.id);
  if (!householdId) return NextResponse.json({ error: "no_household" }, { status: 400 });

  const existingActive = await resolveActiveShipEvent(service, householdId);
  if (existingActive) return NextResponse.json({ active: serializeShipEvent(existingActive) });

  const dateStr = kstDateString();
  const { data: debugRows } = await service
    .from("ship_events")
    .select("slot_index")
    .eq("household_id", householdId)
    .eq("event_date", dateStr)
    .lt("slot_index", 0);

  const minSlot = Math.min(0, ...(debugRows ?? []).map((r: { slot_index: number }) => r.slot_index));
  const slotIndex = minSlot - 1;

  const spawned = await spawnShipEventSlot(service, householdId, dateStr, slotIndex);
  return NextResponse.json({ active: spawned ? serializeShipEvent(spawned) : null });
}
