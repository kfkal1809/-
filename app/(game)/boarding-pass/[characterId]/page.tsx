import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { trySupabase } from "@/lib/supabase/safeQuery";
import { CharacterSprite } from "@/components/character/CharacterSprite";
import { haenyeoPreset } from "@/lib/domain/characterPresets";
import type { CharacterAppearance } from "@/lib/domain/characterPresets";
import { Card } from "@/components/ui/Card";
import { formatKoreanDate } from "@/lib/game/kst";
import { SHIP_NAME } from "@/lib/domain/constants";
import type { CharacterKind, ChildGender, ChildStage } from "@/lib/domain/types";

const RELATION_LABEL: Record<string, string> = { dating: "연애중", engaged: "약혼", married: "부부" };

// public/images/misc/boarding-pass-frame.png(706x925) 안에서 사진/글자를 얹을 자리의 상대 좌표(%).
// 좌표를 낼 때 쓴 원본 그리드 크롭 과정은 docs/ASSET_PIPELINE.md 참고.
const FRAME = {
  photo: { left: 12.75, top: 30.6, width: 28.05, height: 27.0 },
  rows: {
    name: 33.5,
    ship: 38.7,
    role: 43.9,
    boarded: 49.5,
    signoff: 54.9,
  },
  rowText: { left: 62.3, width: 29.0 },
  date: { left: 23.1, top: 78.6, width: 31.9, height: 8 },
};

interface BoardingPassData {
  character: {
    id: string;
    kind: string;
    nickname: string;
    department: string | null;
    child_gender: string | null;
    child_stage: string | null;
    appearance_json: CharacterAppearance;
    household_id: string;
  };
  household: { relation_status: string | null; game_marriage_status: string | null } | null;
  householdMates: { nickname: string; kind: string }[];
  boardedAt: string | null;
  signoffAt: string | null;
}

export default async function BoardingPassPage({ params }: PageProps<"/boarding-pass/[characterId]">) {
  const { characterId } = await params;

  const result = await trySupabase(async () => {
    const supabase = await createClient();

    const { data: character } = await supabase
      .from("characters")
      .select("id, kind, nickname, department, child_gender, child_stage, appearance_json, household_id")
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

    let boardedAt: string | null = null;
    let signoffAt: string | null = null;
    if (character.kind === "haenam") {
      const { data: voyage } = await supabase
        .from("voyages")
        .select("boarded_at, expected_signoff_at")
        .eq("haenam_character_id", character.id)
        .eq("active", true)
        .maybeSingle();
      boardedAt = voyage?.boarded_at ?? null;
      signoffAt = voyage?.expected_signoff_at ?? null;
    }

    return { character, household, householdMates: householdMates ?? [], boardedAt, signoffAt } as BoardingPassData;
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

  const { character, household, householdMates, boardedAt, signoffAt } = result;
  const roleLabel =
    character.kind === "haenyeo" ? "해녀" : character.kind === "child" ? "새싹" : character.department === "engine" ? "해남(기관사)" : "해남(항해사)";

  const today = formatKoreanDate(new Date().toISOString().slice(0, 10));

  return (
    <div className="flex flex-col items-center gap-4 px-4 pt-6">
      <div
        className="relative w-full max-w-[360px] shadow-[0_10px_28px_rgba(36,54,90,0.18)]"
        style={{
          aspectRatio: "706 / 925",
          clipPath:
            "polygon(0 1.95%, 2.55% 1.95%, 2.55% 0, 97.45% 0, 97.45% 1.95%, 100% 1.95%, 100% 98.05%, 97.45% 98.05%, 97.45% 100%, 2.55% 100%, 2.55% 98.05%, 0 98.05%)",
        }}
      >
        <Image
          src="/images/misc/boarding-pass-frame.png"
          alt="승선확인증"
          fill
          unoptimized
          priority
          sizes="360px"
          className="object-cover"
        />

        <div
          className="absolute flex items-center justify-center overflow-hidden rounded-xl"
          style={{
            left: `${FRAME.photo.left}%`,
            top: `${FRAME.photo.top}%`,
            width: `${FRAME.photo.width}%`,
            height: `${FRAME.photo.height}%`,
          }}
        >
          <CharacterSprite
            appearance={(character.appearance_json as CharacterAppearance) ?? haenyeoPreset()}
            kind={character.kind as CharacterKind}
            childGender={character.child_gender as ChildGender | null}
            childStage={character.child_stage as ChildStage | null}
            size={115}
          />
        </div>

        <p
          className="absolute truncate text-[13px] font-bold text-[#24365a] sm:text-[15px]"
          style={{ left: `${FRAME.rowText.left}%`, top: `${FRAME.rows.name}%`, width: `${FRAME.rowText.width}%` }}
        >
          {character.nickname}
        </p>
        <p
          className="absolute truncate text-[13px] font-bold text-[#24365a] sm:text-[15px]"
          style={{ left: `${FRAME.rowText.left}%`, top: `${FRAME.rows.ship}%`, width: `${FRAME.rowText.width}%` }}
        >
          {SHIP_NAME}
        </p>
        <p
          className="absolute truncate text-[13px] font-bold text-[#24365a] sm:text-[15px]"
          style={{ left: `${FRAME.rowText.left}%`, top: `${FRAME.rows.role}%`, width: `${FRAME.rowText.width}%` }}
        >
          {roleLabel}
        </p>
        <p
          className="absolute truncate text-[13px] font-bold text-[#24365a] sm:text-[15px]"
          style={{ left: `${FRAME.rowText.left}%`, top: `${FRAME.rows.boarded}%`, width: `${FRAME.rowText.width}%` }}
        >
          {character.kind === "haenam" && boardedAt ? formatKoreanDate(boardedAt) : "-"}
        </p>
        <p
          className="absolute truncate text-[13px] font-bold text-[#24365a] sm:text-[15px]"
          style={{ left: `${FRAME.rowText.left}%`, top: `${FRAME.rows.signoff}%`, width: `${FRAME.rowText.width}%` }}
        >
          {character.kind === "haenam" && signoffAt ? formatKoreanDate(signoffAt) : "-"}
        </p>

        <p
          className="absolute text-center text-[11px] text-[var(--color-navy-soft)] sm:text-[13px]"
          style={{ left: `${FRAME.date.left}%`, top: `${FRAME.date.top}%`, width: `${FRAME.date.width}%` }}
        >
          {today}
        </p>
      </div>

      <Card tone="cream" className="w-full max-w-[360px] px-4 py-3 text-[12px]">
        <div className="flex items-baseline justify-between border-b border-dotted border-[#9fb3d1] py-1">
          <span className="font-bold text-[#24365a]">관계</span>
          <span className="text-[#24365a]">{household?.relation_status ? RELATION_LABEL[household.relation_status] : "-"}</span>
        </div>
        <div className="flex items-baseline justify-between py-1">
          <span className="font-bold text-[#24365a]">함께 승선</span>
          <span className="truncate text-[#24365a]">{householdMates.length > 0 ? householdMates.map((m) => m.nickname).join(", ") : "-"}</span>
        </div>
        <p className="mt-1 text-center text-[10px] text-[var(--color-navy-soft)]">
          혼인신고 {household?.game_marriage_status === "married" ? "완료" : "미완료"}
        </p>
      </Card>
    </div>
  );
}
