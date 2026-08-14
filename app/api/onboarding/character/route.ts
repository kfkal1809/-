import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getMyHouseholdId } from "@/lib/game/household";

// 기획서 3.3 / 3.4: 내 캐릭터 생성. 파트너 초대코드로 들어온 경우
// (auth/callback이 심어둔 partner_target_character 쿠키) 기존에 만들어져 있던
// 캐릭터에 실제 계정을 연결한다 — 중복 캐릭터를 만들지 않는다.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const service = createServiceClient();
  const cookieStore = request.headers.get("cookie") ?? "";
  const partnerMatch = cookieStore.match(/partner_target_character=([^;]+)/);
  const partnerTargetCharacterId = partnerMatch?.[1];

  if (partnerTargetCharacterId) {
    const { data: targetCharacter } = await service
      .from("characters")
      .select("id, household_id")
      .eq("id", partnerTargetCharacterId)
      .maybeSingle();

    if (!targetCharacter) {
      return NextResponse.json({ error: "invalid_partner_link" }, { status: 400 });
    }

    await service.from("characters").update({ managed_only: false }).eq("id", targetCharacter.id);
    await service
      .from("character_managers")
      .upsert({ character_id: targetCharacter.id, user_id: user.id }, { onConflict: "character_id,user_id" });
    await service
      .from("household_users")
      .upsert({ household_id: targetCharacter.household_id, user_id: user.id }, { onConflict: "household_id,user_id" });

    const res = NextResponse.json({ linkedExisting: true, householdId: targetCharacter.household_id });
    res.cookies.set("partner_target_character", "", { path: "/", maxAge: 0 });
    return res;
  }

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
