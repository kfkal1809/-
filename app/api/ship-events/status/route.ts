import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getMyHouseholdId } from "@/lib/game/household";
import { resolveActiveShipEvent, trySpawnDueShipEvent, serializeShipEvent } from "@/lib/game/shipEventService";

// 지나가는 선박 이벤트 상태 조회 — 별도 크론 없이, 폴링 시점에 스케줄이 도래했으면
// 그 자리에서 lazy-spawn 한다. 활성 이벤트가 있으면 항상 그것부터 반환한다(동시에 여러 척 X).
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const service = createServiceClient();
  const householdId = await getMyHouseholdId(service, user.id);
  if (!householdId) return NextResponse.json({ error: "no_household" }, { status: 400 });

  const active = (await resolveActiveShipEvent(service, householdId)) ?? (await trySpawnDueShipEvent(service, householdId));

  return NextResponse.json({ active: active ? serializeShipEvent(active) : null });
}
