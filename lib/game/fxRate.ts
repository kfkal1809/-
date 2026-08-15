import type { SupabaseClient } from "@supabase/supabase-js";
import { createSeededRandom } from "@/lib/game/fishingLoot";
import { kstDateString } from "@/lib/game/kst";

// 환율 재미요소 — 실제 외부 API를 호출하지 않고, 날짜 시드로 결정적인 "선상 환율"을
// 만들어 fx_rates에 하루 1건만 지연 삽입한다. 게임 내 선용금은 실제 화폐가 아니므로
// (CURRENCY_DISCLAIMER 참고) 진짜 환율과는 무관한 순수 플레이버 숫자다.
const BASE_RATE = 1350;
const SWING = 60; // ±60원 안에서 그날그날 살짝 출렁이게

export async function getTodayFxRate(service: SupabaseClient): Promise<number> {
  const date = kstDateString();

  const { data: existing } = await service.from("fx_rates").select("usd_krw").eq("rate_date", date).maybeSingle();
  if (existing) return Number(existing.usd_krw);

  const random = createSeededRandom(`fx:${date}`);
  const rate = Math.round(BASE_RATE + (random() * 2 - 1) * SWING);

  await service.from("fx_rates").insert({ rate_date: date, usd_krw: rate, provider: "flavor" }).select("rate_date");

  return rate;
}
