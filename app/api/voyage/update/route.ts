import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

// 기획서 3.26 / FR-VOY-002: household 연결 성인 누구나 수정 가능, 변경 로그를 남긴다.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json();
  const { characterId, boardedAt, expectedSignoffAt, vacationStartAt, nextBoardingAt } = body as {
    characterId: string;
    boardedAt: string | null;
    expectedSignoffAt: string | null;
    vacationStartAt: string | null;
    nextBoardingAt: string | null;
  };

  if (!characterId) return NextResponse.json({ error: "invalid_payload" }, { status: 400 });

  const service = createServiceClient();

  const { data: manager } = await service
    .from("character_managers")
    .select("character_id")
    .eq("character_id", characterId)
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: character } = await service.from("characters").select("household_id").eq("id", characterId).maybeSingle();
  if (!character) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const { data: householdMember } = await service
    .from("household_users")
    .select("user_id")
    .eq("household_id", character.household_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!manager && !householdMember) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { data: voyage } = await service
    .from("voyages")
    .select("*")
    .eq("haenam_character_id", characterId)
    .eq("active", true)
    .maybeSingle();

  const before = voyage ?? null;
  const patch = {
    boarded_at: boardedAt || null,
    expected_signoff_at: expectedSignoffAt || null,
    vacation_start_at: vacationStartAt || null,
    next_boarding_at: nextBoardingAt || null,
    updated_at: new Date().toISOString(),
  };

  let voyageId = voyage?.id as string | undefined;
  if (voyage) {
    await service.from("voyages").update(patch).eq("id", voyage.id);
  } else {
    const { data: created } = await service
      .from("voyages")
      .insert({ haenam_character_id: characterId, active: true, ...patch })
      .select("id")
      .single();
    voyageId = created?.id;
  }

  if (voyageId) {
    await service.from("voyage_change_logs").insert({
      voyage_id: voyageId,
      changed_by: user.id,
      before_json: before,
      after_json: patch,
    });
  }

  return NextResponse.json({ ok: true });
}
