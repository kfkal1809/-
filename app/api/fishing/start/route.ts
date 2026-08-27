import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getMyHouseholdId } from "@/lib/game/household";
import { FISHING_DURATIONS } from "@/lib/domain/constants";
import { incrementMission } from "@/lib/game/missions";
import { createSeededRandom, pickFishingLootSchedule } from "@/lib/game/fishingLoot";

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
  const seed = crypto.randomUUID();

  // "언제 무엇이 잡히는지"를 시작 시점에 미리 확정해서 저장한다 — 화면은 이 스케줄을 그대로
  // 재생하며 하나씩 알림으로 보여주고, claim 때도 이 목록을 그대로 지급한다(클라이언트가
  // 진행 중에 결과를 미리 알거나 조작할 수 없게, 서버가 시작 시점에 이미 확정).
  const { data: catalog } = await service
    .from("item_catalog")
    .select("id, subcategory, rarity")
    .in("subcategory", ["fish", "lost", "trash", "legend"])
    .eq("active", true)
    .order("sku");
  const scheduledLoot = pickFishingLootSchedule(durationHours as 4 | 8, catalog ?? [], createSeededRandom(seed));

  const { data: session, error } = await service
    .from("fishing_sessions")
    .insert({
      household_id: householdId,
      started_by: user.id,
      duration_hours: durationHours,
      state: "running",
      started_at: startedAt.toISOString(),
      ends_at: endsAt.toISOString(),
      seed,
      loot_table_version: 1,
      scheduled_loot: scheduledLoot.map((c) => ({ catalogItemId: c.itemId, offsetMinutes: c.offsetMinutes })),
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
