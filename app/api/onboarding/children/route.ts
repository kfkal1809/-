import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getMyHouseholdId } from "@/lib/game/household";

// 기획서 3.5 / FR-CHAR-002: 새싹은 가족당 최대 3명, 서버에서도 반드시 재검증한다.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const service = createServiceClient();
  const householdId = await getMyHouseholdId(service, user.id);
  if (!householdId) return NextResponse.json({ error: "no_household" }, { status: 400 });

  const { count } = await service
    .from("characters")
    .select("id", { count: "exact", head: true })
    .eq("household_id", householdId)
    .eq("kind", "child");

  if ((count ?? 0) >= 3) {
    return NextResponse.json({ error: "child_limit_reached" }, { status: 400 });
  }

  const body = await request.json();
  const { nickname, gender, stage, appearance } = body as {
    nickname: string;
    gender: "male" | "female" | "unset";
    stage: string;
    appearance: Record<string, unknown>;
  };

  if (!nickname?.trim() || !stage) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const { data: character, error } = await service
    .from("characters")
    .insert({
      household_id: householdId,
      kind: "child",
      nickname,
      child_gender: gender ?? "unset",
      child_stage: stage,
      rank_label: "새싹",
      appearance_json: appearance,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await service.from("character_managers").insert({ character_id: character.id, user_id: user.id });

  return NextResponse.json({ characterId: character.id, count: (count ?? 0) + 1 });
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const service = createServiceClient();
  const householdId = await getMyHouseholdId(service, user.id);
  if (!householdId) return NextResponse.json({ children: [] });

  const { data: children } = await service
    .from("characters")
    .select("id, nickname, child_gender, child_stage, appearance_json")
    .eq("household_id", householdId)
    .eq("kind", "child");

  return NextResponse.json({ children: children ?? [] });
}
