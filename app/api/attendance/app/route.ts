import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { kstDateString } from "@/lib/game/kst";
import { APP_ATTENDANCE_REWARD } from "@/lib/domain/constants";
import { incrementMission } from "@/lib/game/missions";

// 기획서 3.7 / FR-ATT-001: KST 기준 하루 1회, 서버 검증 + idempotency_key로 중복 지급 차단.
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const service = createServiceClient();
  const date = kstDateString();

  const { data: membership } = await service
    .from("household_users")
    .select("household_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) {
    return NextResponse.json({ error: "no_household" }, { status: 400 });
  }

  const { data: existing } = await service
    .from("attendance")
    .select("id")
    .eq("user_id", user.id)
    .eq("type", "app")
    .eq("date", date)
    .maybeSingle();

  if (existing) {
    const { data: wallet } = await service
      .from("wallets")
      .select("cached_balance")
      .eq("household_id", membership.household_id)
      .maybeSingle();
    return NextResponse.json({ already: true, balance: wallet?.cached_balance ?? 0 });
  }

  const { error: attendanceError } = await service
    .from("attendance")
    .insert({ user_id: user.id, type: "app", date });

  // unique(user_id, date, type) 위반 시에도 이미 출석 처리된 것으로 간주(더블클릭 방지)
  if (attendanceError && attendanceError.code !== "23505") {
    return NextResponse.json({ error: attendanceError.message }, { status: 500 });
  }

  if (!attendanceError) {
    await incrementMission(service, user.id, "attendance");
    await incrementMission(service, user.id, "attendance5");
  }

  const { data: rpcResult, error: rpcError } = await service.rpc("apply_wallet_transaction", {
    p_household_id: membership.household_id,
    p_amount: APP_ATTENDANCE_REWARD,
    p_type: "app_attendance",
    p_idempotency_key: `app_attendance:${user.id}:${date}`,
    p_metadata: {},
    p_created_by: user.id,
  });

  if (rpcError) {
    return NextResponse.json({ error: rpcError.message }, { status: 500 });
  }

  const row = Array.isArray(rpcResult) ? rpcResult[0] : rpcResult;

  return NextResponse.json({
    already: false,
    balance: row?.balance ?? 0,
    reward: APP_ATTENDANCE_REWARD,
  });
}
