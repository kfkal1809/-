import type { SupabaseClient } from "@supabase/supabase-js";
import { kstDateString } from "@/lib/game/kst";

// 공동금고(선내 외화이자) — 순수 재미 요소. 잔액의 0.5%를 하루 한 번, $0.1~$3 사이로 적립한다.
// apply_wallet_transaction의 idempotency_key(interest:household:date)가 하루 중복 지급을 막아준다.
const INTEREST_RATE = 0.005;
const INTEREST_MIN = 0.1;
const INTEREST_MAX = 3;

export async function grantDailyInterest(service: SupabaseClient, householdId: string, userId: string | null): Promise<number | null> {
  const { data: wallet } = await service.from("wallets").select("cached_balance").eq("household_id", householdId).maybeSingle();
  const balance = wallet?.cached_balance ?? 0;
  if (balance <= 0) return null;

  const amount = Math.min(INTEREST_MAX, Math.max(INTEREST_MIN, Math.round(balance * INTEREST_RATE * 100) / 100));

  const { data } = await service.rpc("apply_wallet_transaction", {
    p_household_id: householdId,
    p_amount: amount,
    p_type: "interest",
    p_idempotency_key: `interest:${householdId}:${kstDateString()}`,
    p_metadata: {},
    p_created_by: userId,
  });

  const row = Array.isArray(data) ? data[0] : data;
  return row?.applied ? amount : null;
}
