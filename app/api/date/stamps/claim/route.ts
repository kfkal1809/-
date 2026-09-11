import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getMyHouseholdId } from "@/lib/game/household";
import { getWalletBalance } from "@/lib/game/wallet";
import { getDateStampStatus } from "@/lib/game/dateStampData";
import { kstDateString } from "@/lib/game/kst";
import { DATE_STAMP_CLEAR_BONUS } from "@/lib/domain/constants";

// 데이트 스탬프판 올클리어 보너스 수령. 클라이언트가 보낸 값은 신뢰하지 않고
// getDateStampStatus로 서버에서 다시 "오늘 6종 스탬프를 다 채웠는지" 확인한 뒤에만 지급한다.
// date_stamp_claims(household_id, claim_date) unique index가 하루 1회 게이트다.
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const service = createServiceClient();
  const householdId = await getMyHouseholdId(service, user.id);
  if (!householdId) return NextResponse.json({ error: "no_household" }, { status: 400 });

  const { allClear } = await getDateStampStatus(service, householdId);
  if (!allClear) return NextResponse.json({ error: "not_completed" }, { status: 400 });

  const claimDate = kstDateString();

  const { error: insertError } = await service
    .from("date_stamp_claims")
    .insert({ household_id: householdId, reward: DATE_STAMP_CLEAR_BONUS, claim_date: claimDate });

  if (insertError) {
    if (insertError.code === "23505") return NextResponse.json({ error: "already_claimed" }, { status: 409 });
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  await service.rpc("apply_wallet_transaction", {
    p_household_id: householdId,
    p_amount: DATE_STAMP_CLEAR_BONUS,
    p_type: "date_stamp_clear",
    p_idempotency_key: `date_stamp_clear:${householdId}:${claimDate}`,
    p_metadata: {},
    p_created_by: user.id,
  });

  const balance = await getWalletBalance(service, householdId);
  return NextResponse.json({ ok: true, reward: DATE_STAMP_CLEAR_BONUS, balance });
}
