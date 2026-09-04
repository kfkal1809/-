import { createClient } from "@/lib/supabase/server";
import { haenamDeckPreset } from "@/lib/domain/characterPresets";
import type { CharacterAppearance } from "@/lib/domain/characterPresets";
import { daysSinceKstDate } from "@/lib/game/kst";

export interface VoyageDetail {
  characterId: string;
  nickname: string;
  roleLabel: string;
  appearance: CharacterAppearance;
  boardedAt: string | null;
  expectedSignoffAt: string | null;
  vacationStartAt: string | null;
  nextBoardingAt: string | null;
  boardedDays: number | null;
  signoffDays: number | null;
  totalBoardedDays: number;
}

export interface VoyagePageData {
  isDemo: boolean;
  canEdit: boolean;
  voyages: VoyageDetail[];
}

const DEMO: VoyagePageData = {
  isDemo: true,
  canEdit: false,
  voyages: [
    {
      characterId: "demo",
      nickname: "북극곰",
      roleLabel: "해남(항해사)",
      appearance: haenamDeckPreset(),
      boardedAt: null,
      expectedSignoffAt: null,
      vacationStartAt: null,
      nextBoardingAt: null,
      boardedDays: 74,
      signoffDays: 27,
      totalBoardedDays: 74,
    },
  ],
};

// 승선~하선 한 사이클이 끝나면 voyages 행이 active=false로 남고 다음 항해가 새 행으로
// 쌓이는 구조라(0001_init.sql), "총 승선일수"는 이 haenam 캐릭터의 모든 항해 기록을
// 합산해야 한다 — active 필터 없이 boarded_at이 있는 행 전부를 가져와 각 행의
// (actual_signoff_at ?? 오늘) - boarded_at 일수를 더한다.
function sumBoardedDays(rows: { boarded_at: string | null; actual_signoff_at: string | null }[]): number {
  let total = 0;
  for (const row of rows) {
    if (!row.boarded_at) continue;
    const start = new Date(row.boarded_at + "T00:00:00+09:00").getTime();
    const end = row.actual_signoff_at ? new Date(row.actual_signoff_at + "T00:00:00+09:00").getTime() : Date.now();
    total += Math.max(0, Math.floor((end - start) / 86400000));
  }
  return total;
}

export async function getVoyagePageData(): Promise<VoyagePageData> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return DEMO;

    const { data: membership } = await supabase.from("household_users").select("household_id").eq("user_id", user.id).maybeSingle();
    if (!membership) return DEMO;

    const { data: haenamCharacters } = await supabase
      .from("characters")
      .select("id, nickname, department, appearance_json")
      .eq("household_id", membership.household_id)
      .eq("kind", "haenam");

    if (!haenamCharacters?.length) return { isDemo: false, canEdit: true, voyages: [] };

    const voyages: VoyageDetail[] = [];
    for (const c of haenamCharacters) {
      const { data: voyage } = await supabase
        .from("voyages")
        .select("boarded_at, expected_signoff_at, vacation_start_at, next_boarding_at")
        .eq("haenam_character_id", c.id)
        .eq("active", true)
        .maybeSingle();

      const { data: allVoyages } = await supabase
        .from("voyages")
        .select("boarded_at, actual_signoff_at")
        .eq("haenam_character_id", c.id);

      voyages.push({
        characterId: c.id,
        nickname: c.nickname,
        roleLabel: c.department === "engine" ? "해남(기관사)" : "해남(항해사)",
        appearance: (c.appearance_json as CharacterAppearance) ?? haenamDeckPreset(),
        boardedAt: voyage?.boarded_at ?? null,
        expectedSignoffAt: voyage?.expected_signoff_at ?? null,
        vacationStartAt: voyage?.vacation_start_at ?? null,
        nextBoardingAt: voyage?.next_boarding_at ?? null,
        boardedDays: voyage?.boarded_at ? daysSinceKstDate(voyage.boarded_at) : null,
        signoffDays: voyage?.expected_signoff_at ? -daysSinceKstDate(voyage.expected_signoff_at) : null,
        totalBoardedDays: sumBoardedDays(allVoyages ?? []),
      });
    }

    return { isDemo: false, canEdit: true, voyages };
  } catch {
    return DEMO;
  }
}
