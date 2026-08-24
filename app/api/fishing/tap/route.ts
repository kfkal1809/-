import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getMyHouseholdId } from "@/lib/game/household";

// 낚시 실시간 타이밍 미니게임 성공 결과를 기록한다. scheduled_loot는 세션 시작 시점에 이미
// 서버가 확정해둔 목록이라(FishingScreen이 화면에 그대로 재생), 여기서는 "그 목록의 몇 번째
// 항목을 정해진 타이밍에 맞춰 성공했는지"만 검증해서 기록한다 — 클라이언트가 아직 잡히지
// 않은 항목을 미리 성공 처리하거나, 세션이 끝난 뒤 뒤늦게 보너스를 노리는 걸 막는다.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { sessionId, index } = (await request.json()) as { sessionId: string; index: number };
  if (!sessionId || typeof index !== "number") {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const service = createServiceClient();
  const householdId = await getMyHouseholdId(service, user.id);
  if (!householdId) return NextResponse.json({ error: "no_household" }, { status: 400 });

  const { data: session } = await service
    .from("fishing_sessions")
    .select("id, household_id, state, started_at, ends_at, scheduled_loot, tap_bonus_indices")
    .eq("id", sessionId)
    .maybeSingle();

  if (!session || session.household_id !== householdId || session.state !== "running") {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const schedule = (session.scheduled_loot as { catalogItemId: string; offsetMinutes: number }[] | null) ?? [];
  const entry = schedule[index];
  if (!entry) return NextResponse.json({ error: "invalid_index" }, { status: 400 });

  // 그 항목이 실제로 잡힐 시점(offsetMinutes) 전에는 성공 처리하지 않는다 — 앞당겨서 미리
  // 탭할 수 없게. 세션 종료 후에도(이미 화면을 벗어난 뒤 뒤늦게 온 요청) 받지 않는다.
  const scheduledAt = new Date(session.started_at).getTime() + entry.offsetMinutes * 60 * 1000;
  const now = Date.now();
  if (now < scheduledAt) return NextResponse.json({ error: "too_early" }, { status: 400 });
  if (now > new Date(session.ends_at).getTime()) return NextResponse.json({ error: "too_late" }, { status: 400 });

  const existing = (session.tap_bonus_indices as number[] | null) ?? [];
  if (existing.includes(index)) return NextResponse.json({ ok: true, already: true });

  const { error } = await service
    .from("fishing_sessions")
    .update({ tap_bonus_indices: [...existing, index] })
    .eq("id", sessionId)
    .eq("state", "running");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, already: false });
}
