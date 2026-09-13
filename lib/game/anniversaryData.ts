import { createClient } from "@/lib/supabase/server";
import { daysSinceKstDate, kstDateString } from "@/lib/game/kst";

export interface AnniversaryData {
  datingStartedAt: string | null;
  weddingAnniversaryAt: string | null;
  datingDays: number | null;
  marriedDays: number | null;
  daysUntilNextAnniversary: number | null;
}

const DEMO: AnniversaryData = {
  datingStartedAt: null,
  weddingAnniversaryAt: null,
  datingDays: null,
  marriedDays: null,
  daysUntilNextAnniversary: null,
};

// dateStr(월/일)과 같은 날짜의 올해(이미 지났으면 내년) 기념일까지 남은 일수.
// formatKoreanDate와 같은 이유로 Date 로컬 getter를 거치지 않고 문자열에서 바로 월/일을 뽑는다.
function daysUntilNextOccurrence(dateStr: string): number {
  const today = kstDateString();
  const [, m, d] = dateStr.split("-").map(Number);
  const [ty, tm, td] = today.split("-").map(Number);

  let year = ty;
  const alreadyPassedThisYear = tm > m || (tm === m && td > d);
  if (alreadyPassedThisYear) year += 1;

  const target = new Date(`${year}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}T00:00:00+09:00`);
  const now = new Date(`${today}T00:00:00+09:00`);
  return Math.round((target.getTime() - now.getTime()) / 86400000);
}

export async function getAnniversaryData(): Promise<AnniversaryData> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return DEMO;

    const { data: membership } = await supabase.from("household_users").select("household_id").eq("user_id", user.id).maybeSingle();
    if (!membership) return DEMO;

    const { data: household } = await supabase
      .from("households")
      .select("dating_started_at, wedding_anniversary_at")
      .eq("id", membership.household_id)
      .maybeSingle();

    const datingStartedAt = household?.dating_started_at ?? null;
    const weddingAnniversaryAt = household?.wedding_anniversary_at ?? null;

    return {
      datingStartedAt,
      weddingAnniversaryAt,
      datingDays: datingStartedAt ? daysSinceKstDate(datingStartedAt) : null,
      marriedDays: weddingAnniversaryAt ? daysSinceKstDate(weddingAnniversaryAt) : null,
      daysUntilNextAnniversary: weddingAnniversaryAt ? daysUntilNextOccurrence(weddingAnniversaryAt) : null,
    };
  } catch {
    return DEMO;
  }
}
