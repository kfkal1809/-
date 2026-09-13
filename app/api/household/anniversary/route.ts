import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getMyHouseholdId } from "@/lib/game/household";

// 커플 기념일(연애 시작일/결혼기념일) 저장. household 연결된 사람 누구나 수정 가능
// (voyage/update와 동일한 정책). 빈 문자열은 null로 저장해서 값을 지울 수 있게 한다.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { datingStartedAt, weddingAnniversaryAt } = (await request.json()) as {
    datingStartedAt?: string | null;
    weddingAnniversaryAt?: string | null;
  };

  const service = createServiceClient();
  const householdId = await getMyHouseholdId(service, user.id);
  if (!householdId) return NextResponse.json({ error: "no_household" }, { status: 400 });

  const { error } = await service
    .from("households")
    .update({ dating_started_at: datingStartedAt || null, wedding_anniversary_at: weddingAnniversaryAt || null })
    .eq("id", householdId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
