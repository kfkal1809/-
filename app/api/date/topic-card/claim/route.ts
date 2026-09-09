import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getMyHouseholdId } from "@/lib/game/household";
import { getWalletBalance } from "@/lib/game/wallet";
import { kstDateString } from "@/lib/game/kst";
import { DATE_TOPIC_CARD_REWARD_MIN, DATE_TOPIC_CARD_REWARD_MAX } from "@/lib/domain/constants";

// 데이트 콘텐츠 1: 대화 주제 카드 완료 보상. store_work_logs와 같은 방식으로
// date_topic_card_logs(household_id, draw_date) unique index가 DB 레벨의 하루 1회 게이트다 —
// store_work_logs는 user_id 단위지만 이건 커플이 함께 하는 활동이라 household_id 단위로 막는다.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { cardText } = (await request.json()) as { cardText?: string };
  if (!cardText) return NextResponse.json({ error: "invalid_payload" }, { status: 400 });

  const service = createServiceClient();
  const householdId = await getMyHouseholdId(service, user.id);
  if (!householdId) return NextResponse.json({ error: "no_household" }, { status: 400 });

  const drawDate = kstDateString();
  const reward = DATE_TOPIC_CARD_REWARD_MIN + Math.floor(Math.random() * (DATE_TOPIC_CARD_REWARD_MAX - DATE_TOPIC_CARD_REWARD_MIN + 1));

  const { error: logError } = await service.from("date_topic_card_logs").insert({
    household_id: householdId,
    card_text: cardText,
    reward,
    draw_date: drawDate,
  });

  if (logError) {
    if (logError.code === "23505") return NextResponse.json({ error: "already_done_today" }, { status: 409 });
    return NextResponse.json({ error: logError.message }, { status: 500 });
  }

  await service.rpc("apply_wallet_transaction", {
    p_household_id: householdId,
    p_amount: reward,
    p_type: "date_topic_card",
    p_idempotency_key: `date_topic_card:${householdId}:${drawDate}`,
    p_metadata: { card: cardText },
    p_created_by: user.id,
  });

  const balance = await getWalletBalance(service, householdId);
  return NextResponse.json({ ok: true, reward, balance });
}
