import { createClient } from "@/lib/supabase/server";
import { daysUntilNextAnnualDate } from "@/lib/game/kst";

export interface BirthdayInfo {
  kind: "haenyeo" | "haenam";
  nickname: string;
  birthday: string | null;
  daysUntilNext: number | null;
}

export interface BirthdayData {
  haenyeo: BirthdayInfo | null;
  haenam: BirthdayInfo | null;
}

const DEMO: BirthdayData = { haenyeo: null, haenam: null };

export async function getBirthdayData(): Promise<BirthdayData> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return DEMO;

    const { data: membership } = await supabase.from("household_users").select("household_id").eq("user_id", user.id).maybeSingle();
    if (!membership) return DEMO;

    const { data: characters } = await supabase
      .from("characters")
      .select("kind, nickname, birthday")
      .eq("household_id", membership.household_id)
      .in("kind", ["haenyeo", "haenam"]);

    function toInfo(kind: "haenyeo" | "haenam"): BirthdayInfo | null {
      const c = characters?.find((row) => row.kind === kind);
      if (!c) return null;
      return {
        kind,
        nickname: c.nickname,
        birthday: c.birthday,
        daysUntilNext: c.birthday ? daysUntilNextAnnualDate(c.birthday) : null,
      };
    }

    return { haenyeo: toInfo("haenyeo"), haenam: toInfo("haenam") };
  } catch {
    return DEMO;
  }
}
