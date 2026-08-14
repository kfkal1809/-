import { createClient } from "@/lib/supabase/server";
import { CharacterSprite } from "@/components/character/CharacterSprite";
import { haenyeoPreset } from "@/lib/domain/characterPresets";
import type { CharacterAppearance } from "@/lib/domain/characterPresets";
import { Card } from "@/components/ui/Card";
import { daysSinceKstDate } from "@/lib/game/kst";

const RELATION_LABEL: Record<string, string> = { dating: "연애중", engaged: "약혼", married: "부부" };

export default async function BoardingPassPage({ params }: PageProps<"/boarding-pass/[characterId]">) {
  const { characterId } = await params;
  const supabase = await createClient();

  const { data: character } = await supabase
    .from("characters")
    .select("id, kind, nickname, department, appearance_json, household_id")
    .eq("id", characterId)
    .maybeSingle();

  if (!character) {
    return (
      <div className="px-4 pt-5">
        <Card tone="cream" className="py-8 text-center text-[13px] text-[var(--color-navy-soft)]">
          승선확인증을 찾을 수 없어요.
        </Card>
      </div>
    );
  }

  const { data: household } = await supabase
    .from("households")
    .select("relation_status, game_marriage_status")
    .eq("id", character.household_id)
    .maybeSingle();

  const { data: householdMates } = await supabase
    .from("characters")
    .select("nickname, kind")
    .eq("household_id", character.household_id)
    .neq("id", character.id)
    .neq("kind", "child");

  const roleLabel =
    character.kind === "haenyeo" ? "해녀" : character.kind === "child" ? "새싹" : character.department === "engine" ? "해남(기관사)" : "해남(항해사)";

  let boardedDays: number | null = null;
  let signoffDays: number | null = null;
  if (character.kind === "haenam") {
    const { data: voyage } = await supabase
      .from("voyages")
      .select("boarded_at, expected_signoff_at")
      .eq("haenam_character_id", character.id)
      .eq("active", true)
      .maybeSingle();
    if (voyage?.boarded_at) boardedDays = daysSinceKstDate(voyage.boarded_at);
    if (voyage?.expected_signoff_at) signoffDays = -daysSinceKstDate(voyage.expected_signoff_at);
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-6">
      <div className="rounded-[28px] border-2 border-[var(--color-gold)] bg-[var(--color-cream)] p-5 shadow-[0_8px_24px_rgba(36,54,90,0.12)]">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold tracking-widest text-[var(--color-gold-deep)]">해연결호 승선확인증</p>
          <span className="rounded-full border-2 border-[var(--color-gold)] px-2 py-0.5 text-[9px] font-extrabold text-[var(--color-gold-deep)]">
            (주)해녀쉽핑 승선확인
          </span>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <CharacterSprite appearance={(character.appearance_json as CharacterAppearance) ?? haenyeoPreset()} size={96} />
          <div>
            <p className="text-xl font-extrabold text-[var(--color-navy)]">{character.nickname}</p>
            <p className="text-[11px] text-[var(--color-navy-soft)]">{roleLabel}</p>
            {household?.relation_status && (
              <p className="mt-1 text-[11px] font-bold text-[var(--color-coral)]">{RELATION_LABEL[household.relation_status]}</p>
            )}
          </div>
        </div>

        {householdMates && householdMates.length > 0 && (
          <p className="mt-3 text-[12px] text-[var(--color-navy-soft)]">
            함께 승선 중: {householdMates.map((m) => m.nickname).join(", ")}
          </p>
        )}

        {character.kind === "haenam" && (
          <div className="mt-4 flex justify-between rounded-2xl bg-white/70 p-3">
            <div className="text-center">
              <p className="text-[10px] font-bold text-[var(--color-navy-soft)]">승선</p>
              <p className="text-[15px] font-extrabold text-[var(--color-coral)]">{boardedDays !== null ? `D+${boardedDays}` : "-"}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold text-[var(--color-navy-soft)]">하선</p>
              <p className="text-[15px] font-extrabold text-[var(--color-tab-active)]">{signoffDays !== null ? `D-${signoffDays}` : "-"}</p>
            </div>
          </div>
        )}

        <p className="mt-4 text-center text-[10px] text-[var(--color-navy-soft)]">
          혼인신고 {household?.game_marriage_status === "married" ? "완료" : "미완료"}
        </p>
      </div>
    </div>
  );
}
