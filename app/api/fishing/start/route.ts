import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getMyHouseholdId } from "@/lib/game/household";
import { FISHING_DURATIONS } from "@/lib/domain/constants";
import { incrementMission } from "@/lib/game/missions";

// 기획서 3.12 / FR-FISH-001: household당 동시 낚시 세션 1개, 서버 시간 기준 종료.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { durationHours } = (await request.json()) as { durationHours: number };
  if (!FISHING_DURATIONS.includes(durationHours as 4 | 8)) {
    return NextResponse.json({ error: "invalid_duration" }, { status: 400 });
  }

  const service = createServiceClient();
  const householdId = await getMyHouseholdId(service, user.id);
  if (!householdId) return NextResponse.json({ error: "no_household" }, { status: 400 });

  const { data: running } = await service
    .from("fishing_sessions")
    .select("id")
    .eq("household_id", householdId)
    .eq("state", "running")
    .maybeSingle();
  if (running) return NextResponse.json({ error: "already_running" }, { status: 409 });

  const startedAt = new Date();
  const endsAt = new Date(startedAt.getTime() + durationHours * 60 * 60 * 1000);

  const { data: session, error } = await service
    .from("fishing_sessions")
    .insert({
      household_id: householdId,
      started_by: user.id,
      duration_hours: durationHours,
      state: "running",
      started_at: startedAt.toISOString(),
      ends_at: endsAt.toISOString(),
      seed: crypto.randomUUID(),
      loot_table_version: 1,
    })
    .select("id, started_at, ends_at, duration_hours")
    .single();

  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "already_running" }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await incrementMission(service, user.id, "fishing");
  await incrementMission(service, user.id, "fishing5");

  return NextResponse.json({ session });
}
