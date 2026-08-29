import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getMyHouseholdId } from "@/lib/game/household";

// 기획서 3.3 / 3.4: 내 캐릭터 생성.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const service = createServiceClient();

  const body = await request.json();
  const { kind, department, nickname, appearance } = body as {
    kind: "haenyeo" | "haenam";
    department?: "deck" | "engine";
    nickname: string;
    appearance: Record<string, unknown>;
  };

  if (!nickname?.trim() || !kind) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  let householdId = await getMyHouseholdId(service, user.id);
  if (!householdId) {
    const { data: household, error: householdError } = await service
      .from("households")
      .insert({ relation_status: null })
      .select("id")
      .single();
    if (householdError) return NextResponse.json({ error: householdError.message }, { status: 500 });
    householdId = household.id;
    await service.from("household_users").insert({ household_id: householdId, user_id: user.id });
  }

  const rankLabel = kind === "haenyeo" ? "해녀" : department === "engine" ? "해남(기관사)" : "해남(항해사)";

  const { data: existingCharacter } = await service
    .from("character_managers")
    .select("character_id, characters!inner(household_id, kind)")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingCharacter) {
    await service
      .from("characters")
      .update({ nickname, department: kind === "haenam" ? department ?? "deck" : null, rank_label: rankLabel, appearance_json: appearance })
      .eq("id", existingCharacter.character_id);
    return NextResponse.json({ householdId, characterId: existingCharacter.character_id });
  }

  // /onboarding/join으로 연결 코드를 입력해 들어온 사람이라면, 상대가 온보딩 때 미리 만들어둔
  // managed_only 플레이스홀더(같은 kind)가 이 household에 있을 수 있다 — 그럴 땐 새 캐릭터를
  // 또 만드는 대신 그 캐릭터를 그대로 넘겨받는다(voyages 등 이미 만들어진 연결 데이터도 유지됨).
  const { data: placeholder } = await service
    .from("characters")
    .select("id")
    .eq("household_id", householdId)
    .eq("kind", kind)
    .eq("managed_only", true)
    .maybeSingle();

  if (placeholder) {
    await service
      .from("characters")
      .update({
        nickname,
        department: kind === "haenam" ? department ?? "deck" : null,
        rank_label: rankLabel,
        appearance_json: appearance,
        managed_only: false,
      })
      .eq("id", placeholder.id);
    await service.from("character_managers").upsert(
      { character_id: placeholder.id, user_id: user.id },
      { onConflict: "character_id,user_id" }
    );
    return NextResponse.json({ householdId, characterId: placeholder.id });
  }

  const { data: character, error: characterError } = await service
    .from("characters")
    .insert({
      household_id: householdId,
      kind,
      nickname,
      department: kind === "haenam" ? department ?? "deck" : null,
      rank_label: rankLabel,
      appearance_json: appearance,
    })
    .select("id")
    .single();

  if (characterError) return NextResponse.json({ error: characterError.message }, { status: 500 });

  await service.from("character_managers").insert({ character_id: character.id, user_id: user.id });

  if (kind === "haenam") {
    await service.from("voyages").insert({ haenam_character_id: character.id, active: true });
  }

  return NextResponse.json({ householdId, characterId: character.id });
}
