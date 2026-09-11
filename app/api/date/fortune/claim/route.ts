import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getMyHouseholdId } from "@/lib/game/household";
import { getWalletBalance } from "@/lib/game/wallet";
import { kstDateString } from "@/lib/game/kst";
import { DATE_FORTUNE_REWARD_MIN, DATE_FORTUNE_REWARD_MAX } from "@/lib/domain/constants";

// 데이트 콘텐츠 6: 오늘의 운세 수령. date_topic_card_logs/claim 라우트와 완전히 동일한 형태 —
// date_fortune_logs(household_id, fortune_date) unique index가 하루 1회 게이트다.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { fortuneText } = (await request.json()) as { fortuneText?: string };
  if (!fortuneText) return NextResponse.json({ error: "invalid_payload" }, { status: 400 });

  const service = createServiceClient();
  const householdId = await getMyHouseholdId(service, user.id);
  if (!householdId) return NextResponse.json({ error: "no_household" }, { status: 400 });

  const fortuneDate = kstDateString();
  const reward = DATE_FORTUNE_REWARD_MIN + Math.floor(Math.random() * (DATE_FORTUNE_REWARD_MAX - DATE_FORTUNE_REWARD_MIN + 1));

  const { error: logError } = await service.from("date_fortune_logs").insert({
    household_id: householdId,
    fortune_text: fortuneText,
    reward,
    fortune_date: fortuneDate,
  });

  if (logError) {
    if (logError.code === "23505") return NextResponse.json({ error: "already_done_today" }, { status: 409 });
    return NextResponse.json({ error: logError.message }, { status: 500 });
  }

  await service.rpc("apply_wallet_transaction", {
    p_household_id: householdId,
    p_amount: reward,
    p_type: "date_fortune",
    p_idempotency_key: `date_fortune:${householdId}:${fortuneDate}`,
    p_metadata: { fortune: fortuneText },
    p_created_by: user.id,
  });

  const balance = await getWalletBalance(service, householdId);
  return NextResponse.json({ ok: true, reward, balance });
}
