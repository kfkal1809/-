import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getMyHouseholdId } from "@/lib/game/household";

// 혼인신고서 서명 — household_users 전원이 서명하면 즉시 혼인 완료 처리 + 명예의 전당 등재.
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const service = createServiceClient();
  const householdId = await getMyHouseholdId(service, user.id);
  if (!householdId) return NextResponse.json({ error: "no_household" }, { status: 400 });

  const { data: pending } = await service
    .from("couple_events")
    .select("id, payload")
    .eq("household_id", householdId)
    .eq("type", "marriage_request")
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!pending) return NextResponse.json({ error: "no_pending_request" }, { status: 404 });

  const signedBy = new Set<string>((pending.payload as { signed_by?: string[] } | null)?.signed_by ?? []);
  signedBy.add(user.id);
  const signedByArray = Array.from(signedBy);

  await service.from("couple_events").update({ payload: { signed_by: signedByArray } }).eq("id", pending.id);

  const { data: householdUsers } = await service.from("household_users").select("user_id").eq("household_id", householdId);
  const allSigned = (householdUsers ?? []).every((r) => signedBy.has(r.user_id));

  if (!allSigned) {
    return NextResponse.json({ married: false, signedBy: signedByArray });
  }

  const now = new Date().toISOString();
  const { data: locked } = await service
    .from("households")
    .update({ game_marriage_status: "married", game_married_at: now, relation_status: "married" })
    .eq("id", householdId)
    .eq("game_marriage_status", "pending_signature")
    .select("id");

  if (!locked?.length) {
    // 이미 다른 요청이 혼인 완료 처리를 끝낸 경우
    return NextResponse.json({ married: true, signedBy: signedByArray });
  }

  await service.from("couple_events").update({ status: "complete", completed_at: now }).eq("id", pending.id);
  await service.from("couple_events").insert({
    household_id: householdId,
    type: "marriage_complete",
    status: "complete",
    payload: { signed_by: signedByArray },
    completed_at: now,
  });

  const { data: characters } = await service
    .from("characters")
    .select("nickname, kind")
    .eq("household_id", householdId)
    .in("kind", ["haenyeo", "haenam"]);

  const haenyeo = characters?.find((c) => c.kind === "haenyeo")?.nickname;
  const haenam = characters?.find((c) => c.kind === "haenam")?.nickname;
  const coupleLabel = haenyeo && haenam ? `${haenyeo} ♥ ${haenam}` : "새로운 부부";

  await service.from("hall_of_fame").insert({
    household_id: householdId,
    category: "marriage",
    title: `${coupleLabel} 혼인신고 완료`,
    description: "해연결호에서 정식 부부가 되었습니다. 축하해주세요!",
    occurred_at: now,
  });

  return NextResponse.json({ married: true, signedBy: signedByArray });
}
