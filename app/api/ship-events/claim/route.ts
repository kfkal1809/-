import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getMyHouseholdId } from "@/lib/game/household";
import { creditShipEventReward, serializeShipEvent, EVENT_SELECT, type ShipEventRow } from "@/lib/game/shipEventService";

// 지나가는 선박이 두고 간 상자를 수령. 조건부 UPDATE(status='active' -> 'collected')로
// 최초 1회만 성공하게 해 중복 클릭/새로고침으로 보상이 두 번 지급되지 않게 한다.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { eventId } = (await request.json()) as { eventId: string };
  if (!eventId) return NextResponse.json({ error: "invalid_payload" }, { status: 400 });

  const service = createServiceClient();
  const householdId = await getMyHouseholdId(service, user.id);
  if (!householdId) return NextResponse.json({ error: "no_household" }, { status: 400 });

  const { data: existing } = await service
    .from("ship_events")
    .select(EVENT_SELECT)
    .eq("id", eventId)
    .eq("household_id", householdId)
    .maybeSingle();

  if (!existing) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const row = existing as unknown as ShipEventRow;

  if (row.status !== "active") {
    return NextResponse.json({ alreadyClaimed: true, event: serializeShipEvent(row) });
  }

  const { data: updatedRows } = await service
    .from("ship_events")
    .update({ status: "collected", claimed_at: new Date().toISOString() })
    .eq("id", eventId)
    .eq("status", "active")
    .select("id");

  if (!updatedRows?.length) {
    const { data: latest } = await service.from("ship_events").select(EVENT_SELECT).eq("id", eventId).maybeSingle();
    return NextResponse.json({ alreadyClaimed: true, event: serializeShipEvent((latest as unknown as ShipEventRow) ?? row) });
  }

  await creditShipEventReward(service, householdId, row);

  const { data: wallet } = await service.from("wallets").select("cached_balance").eq("household_id", householdId).maybeSingle();

  return NextResponse.json({
    alreadyClaimed: false,
    event: serializeShipEvent({ ...row, status: "collected" }),
    balance: wallet?.cached_balance ?? 0,
  });
}
