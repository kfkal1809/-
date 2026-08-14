import { createClient } from "@/lib/supabase/server";
import { trySupabase } from "@/lib/supabase/safeQuery";
import { CharacterSprite } from "@/components/character/CharacterSprite";
import { haenyeoPreset } from "@/lib/domain/characterPresets";
import type { CharacterAppearance } from "@/lib/domain/characterPresets";
import { Card } from "@/components/ui/Card";
import { daysSinceKstDate } from "@/lib/game/kst";

const RELATION_LABEL: Record<string, string> = { dating: "연애중", engaged: "약혼", married: "부부" };

interface BoardingPassData {
  character: {
    id: string;
    kind: string;
    nickname: string;
    department: string | null;
    appearance_json: CharacterAppearance;
    household_id: string;
  };
  household: { relation_status: string | null; game_marriage_status: string | null } | null;
  householdMates: { nickname: string; kind: string }[];
  boardedDays: number | null;
  signoffDays: number | null;
}

export default async function BoardingPassPage({ params }: PageProps<"/boarding-pass/[characterId]">) {
  const { characterId } = await params;

  const result = await trySupabase(async () => {
    const supabase = await createClient();

    const { data: character } = await supabase
      .from("characters")
      .select("id, kind, nickname, department, appearance_json, household_id")
      .eq("id", characterId)
      .maybeSingle();

    if (!character) return null;

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

    return { character, household, householdMates: householdMates ?? [], boardedDays, signoffDays } as BoardingPassData;
  }, null as BoardingPassData | null);

  if (!result) {
    return (
      <div className="px-4 pt-5">
        <Card tone="cream" className="py-8 text-center text-[13px] text-[var(--color-navy-soft)]">
          승선확인증을 찾을 수 없어요.
        </Card>
      </div>
    );
  }

  const { character, household, householdMates, boardedDays, signoffDays } = result;
  const roleLabel =
    character.kind === "haenyeo" ? "해녀" : character.kind === "child" ? "새싹" : character.department === "engine" ? "해남(기관사)" : "해남(항해사)";

  const rows: { label: string; value: string }[] = [
    { label: "성명", value: character.nickname },
    { label: "직책", value: roleLabel },
    { label: "관계", value: household?.relation_status ? RELATION_LABEL[household.relation_status] : "-" },
    { label: "함께 승선", value: householdMates.length > 0 ? householdMates.map((m) => m.nickname).join(", ") : "-" },
  ];
  if (character.kind === "haenam") {
    rows.push({ label: "승선", value: boardedDays !== null ? `D+${boardedDays}` : "-" });
    rows.push({ label: "하선", value: signoffDays !== null ? `D-${signoffDays}` : "-" });
  }

  return (
    <div className="flex flex-col items-center gap-4 px-4 pt-6">
      <div
        className="relative w-full max-w-[360px] border-[3px] border-[#24365a] bg-[var(--color-cream)] px-6 pb-6 pt-5 shadow-[0_10px_28px_rgba(36,54,90,0.18)]"
        style={{
          borderRadius: "22px",
          clipPath:
            "polygon(0 18px, 18px 18px, 18px 0, calc(100% - 18px) 0, calc(100% - 18px) 18px, 100% 18px, 100% calc(100% - 18px), calc(100% - 18px) calc(100% - 18px), calc(100% - 18px) 100%, 18px 100%, 18px calc(100% - 18px), 0 calc(100% - 18px))",
        }}
      >
        <div
          className="pointer-events-none absolute inset-[6px]"
          style={{
            borderRadius: "16px",
            border: "1.5px dashed #9fb3d1",
          }}
        />

        <div className="relative flex flex-col items-center pt-2 text-center">
          <svg width="26" height="20" viewBox="0 0 26 20" className="text-[#24365a]">
            <path
              d="M13 2 L13 16 M13 16 l-3 -3 M13 16 l3 -3 M4 6 q4 -3 5 0 M22 6 q-4 -3 -5 0"
              stroke="currentColor"
              strokeWidth="1.6"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
          <h1 className="mt-1 text-[22px] font-extrabold tracking-wide text-[#24365a]">승선확인증</h1>
          <p className="mt-0.5 text-[10px] font-bold tracking-[0.2em] text-[var(--color-tab-active)]">BOARDING CERTIFICATE</p>
        </div>

        <div className="relative mt-4 flex items-center gap-4">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-[#24365a] bg-gradient-to-b from-[#bfe6ff] to-[#eaf6ff]">
            <CharacterSprite appearance={(character.appearance_json as CharacterAppearance) ?? haenyeoPreset()} size={90} />
          </div>
          <dl className="flex-1 text-[12px]">
            {rows.map((r) => (
              <div key={r.label} className="flex items-baseline gap-2 border-b border-dotted border-[#9fb3d1] py-1">
                <dt className="w-14 shrink-0 font-bold text-[#24365a]">{r.label}</dt>
                <dd className="truncate text-[#24365a]">{r.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <p className="relative mt-5 text-center text-[12px] leading-relaxed text-[#24365a]">
          위 사람은 (주)해녀해운 선박에
          <br />
          승선하였음을 확인합니다.
        </p>

        <div className="relative mt-4 flex items-center justify-between">
          <p className="text-[11px] text-[var(--color-navy-soft)]">
            {new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}
          </p>
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[var(--color-danger)] text-center">
            <span className="text-[10px] font-extrabold leading-tight text-[var(--color-danger)]">
              주)
              <br />
              해녀해운
            </span>
          </div>
        </div>

        <p className="relative mt-3 text-center text-[10px] text-[var(--color-navy-soft)]">
          혼인신고 {household?.game_marriage_status === "married" ? "완료" : "미완료"}
        </p>
      </div>
    </div>
  );
}
