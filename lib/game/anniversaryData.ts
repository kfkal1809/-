import { createClient } from "@/lib/supabase/server";
import { daysSinceKstDate, daysUntilNextAnnualDate } from "@/lib/game/kst";

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
      daysUntilNextAnniversary: weddingAnniversaryAt ? daysUntilNextAnnualDate(weddingAnniversaryAt) : null,
    };
  } catch {
    return DEMO;
  }
}
