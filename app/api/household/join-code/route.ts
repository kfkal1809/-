import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getMyHouseholdId } from "@/lib/game/household";

// 메뉴/설정 화면에서 "파트너 연결 코드"를 보여줄 때 쓴다. 상대에게 이 코드를 알려주면
// 상대가 온보딩 맨 앞(/onboarding/join)에서 입력해 같은 household로 들어올 수 있다.
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const service = createServiceClient();
  const householdId = await getMyHouseholdId(service, user.id);
  if (!householdId) return NextResponse.json({ error: "no_household" }, { status: 400 });

  const { data: household } = await service.from("households").select("join_code").eq("id", householdId).maybeSingle();
  if (!household?.join_code) return NextResponse.json({ error: "no_join_code" }, { status: 404 });

  return NextResponse.json({ joinCode: household.join_code });
}
