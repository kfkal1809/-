import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getMyHouseholdId } from "@/lib/game/household";
import {
  getMissionSnapshot,
  findMissionReward,
  periodKeyForMission,
  DAILY_CLEAR_KEY,
  WEEKLY_CLEAR_KEY,
} from "@/lib/game/missions";

// 미션 보상 수령. 개별 미션은 조건부 UPDATE(completed=true AND rewarded=false)로 최초 1회만
// 성공하게 해서 중복 요청으로 재화가 두 번 지급되지 않게 한다. daily_clear/weekly_clear는
// 평소엔 progress row가 없다가(파생 계산이라) 클레임 시점에 처음 만들어지므로,
// (user_id, mission_key, period_key) unique PK로 같은 중복 방지 효과를 낸다.
// apply_wallet_transaction의 idempotency_key도 한 번 더 안전장치로 건다.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { missionKey } = (await request.json()) as { missionKey?: string };
  if (!missionKey) return NextResponse.json({ error: "invalid_payload" }, { status: 400 });

  const service = createServiceClient();
  const householdId = await getMyHouseholdId(service, user.id);
  if (!householdId) return NextResponse.json({ error: "no_household" }, { status: 400 });

  const reward = findMissionReward(missionKey);
  if (reward === null) return NextResponse.json({ error: "unknown_mission" }, { status: 400 });

  let periodKey: string;

  if (missionKey === DAILY_CLEAR_KEY || missionKey === WEEKLY_CLEAR_KEY) {
    const snapshot = await getMissionSnapshot(service, user.id);
    const clear = missionKey === DAILY_CLEAR_KEY ? snapshot.dailyClear : snapshot.weeklyClear;
    if (!clear.completed) return NextResponse.json({ error: "not_completed" }, { status: 400 });
    if (clear.rewarded) return NextResponse.json({ alreadyClaimed: true });

    periodKey = clear.periodKey;
    const { error: insertError } = await service.from("mission_progress").insert({
      user_id: user.id,
      mission_key: missionKey,
      period_key: periodKey,
      progress: clear.target,
      completed: true,
      rewarded: true,
    });
    if (insertError) {
      if (insertError.code === "23505") return NextResponse.json({ alreadyClaimed: true });
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
  } else {
    periodKey = periodKeyForMission(missionKey);
    const { data: updated, error: updateError } = await service
      .from("mission_progress")
      .update({ rewarded: true })
      .eq("user_id", user.id)
      .eq("mission_key", missionKey)
      .eq("period_key", periodKey)
      .eq("completed", true)
      .eq("rewarded", false)
      .select("progress");

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

    if (!updated?.length) {
      const { data: existing } = await service
        .from("mission_progress")
        .select("rewarded")
        .eq("user_id", user.id)
        .eq("mission_key", missionKey)
        .eq("period_key", periodKey)
        .maybeSingle();
      if (existing?.rewarded) return NextResponse.json({ alreadyClaimed: true });
      return NextResponse.json({ error: "not_completed" }, { status: 400 });
    }
  }

  const { data: rpcResult, error: rpcError } = await service.rpc("apply_wallet_transaction", {
    p_household_id: householdId,
    p_amount: reward,
    p_type: "mission_reward",
    p_idempotency_key: `mission_claim:${missionKey}:${user.id}:${periodKey}`,
    p_metadata: { missionKey },
    p_created_by: user.id,
  });
  if (rpcError) return NextResponse.json({ error: rpcError.message }, { status: 500 });

  const row = Array.isArray(rpcResult) ? rpcResult[0] : rpcResult;
  return NextResponse.json({ ok: true, reward, balance: row?.balance ?? 0 });
}
