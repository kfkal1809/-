import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getMyHouseholdId } from "@/lib/game/household";

// 기획서 1.6 / 3.4: 상대가 아직 가입하지 않았어도 캐릭터를 먼저 만들어 둘 수 있다.
// managed_only=true 로 저장하며, 실제 상대가 파트너 초대코드로 들어오면 연결된다.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const service = createServiceClient();
  const householdId = await getMyHouseholdId(service, user.id);
  if (!householdId) return NextResponse.json({ error: "no_household" }, { status: 400 });

  // managed_only=true 인 캐릭터가 있다면 "아직 실제 계정이 연결되지 않은" 상대 캐릭터다.
  const { data: existingPartner } = await service
    .from("characters")
    .select("id")
    .eq("household_id", householdId)
    .eq("managed_only", true)
    .neq("kind", "child")
    .maybeSingle();

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

  const rankLabel = kind === "haenyeo" ? "해녀" : department === "engine" ? "해남(기관사)" : "해남(항해사)";

  if (existingPartner) {
    await service
      .from("characters")
      .update({ nickname, department: kind === "haenam" ? department ?? "deck" : null, rank_label: rankLabel, appearance_json: appearance })
      .eq("id", existingPartner.id);
    return NextResponse.json({ characterId: existingPartner.id });
  }

  const { data: character, error } = await service
    .from("characters")
    .insert({
      household_id: householdId,
      kind,
      nickname,
      department: kind === "haenam" ? department ?? "deck" : null,
      rank_label: rankLabel,
      appearance_json: appearance,
      managed_only: true,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 첫 가입자가 상대 캐릭터를 대신 관리할 수 있도록 임시로 연결해둔다.
  await service.from("character_managers").insert({ character_id: character.id, user_id: user.id });

  if (kind === "haenam") {
    await service.from("voyages").insert({ haenam_character_id: character.id, active: true });
  }

  return NextResponse.json({ characterId: character.id });
}
