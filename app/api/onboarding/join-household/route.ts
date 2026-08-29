import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getMyHouseholdId } from "@/lib/game/household";

// 초대코드(가입 게이트) 제거로 끊어졌던 "같은 household로 합치기" 경로를 대신한다.
// 온보딩 맨 앞(/onboarding/join)에서, 아직 자기 household가 없는 신규 가입자가 상대의
// 연결 코드를 입력하면 그 household의 구성원으로 바로 들어간다 — 이후 /onboarding/me에서
// 캐릭터를 만들 때 같은 household 안에 상대가 미리 만들어둔 managed_only 플레이스홀더가
// 있으면 그걸 그대로 넘겨받는다(app/api/onboarding/character/route.ts 참고).
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { code } = (await request.json()) as { code?: string };
  const joinCode = code?.trim().toUpperCase();
  if (!joinCode) return NextResponse.json({ error: "invalid_code" }, { status: 400 });

  const service = createServiceClient();

  // 이미 household가 있는 사람은(온보딩을 이미 마쳤거나 다시 이 화면에 온 경우) 코드로
  // 새 household에 합류시키지 않는다 — household를 옮기는 건 지갑/가구/캐릭터를 다시
  // 정리해야 하는 별도 작업이라, 이 라우트는 "처음 온보딩하는 사람"만 지원한다.
  const existingHouseholdId = await getMyHouseholdId(service, user.id);
  if (existingHouseholdId) {
    return NextResponse.json({ error: "already_has_household" }, { status: 400 });
  }

  const { data: household } = await service.from("households").select("id").eq("join_code", joinCode).maybeSingle();
  if (!household) return NextResponse.json({ error: "code_not_found" }, { status: 404 });

  const { error } = await service.from("household_users").insert({ household_id: household.id, user_id: user.id });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ householdId: household.id });
}
