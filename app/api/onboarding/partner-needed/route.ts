import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getMyHouseholdId } from "@/lib/game/household";

// "상대 캐릭터도 만들어요" 온보딩 단계가 이 사용자에게 실제로 필요한지 판단한다.
// /onboarding/join으로 연결 코드를 입력해 들어온 사람은 household에 이미 실제 캐릭터
// (managed_only=false) 2명이 있을 수 있는데(자신 + 상대), 그럴 땐 또 상대 캐릭터를
// 만들 필요가 없다 — 오히려 만들면 중복 캐릭터가 생긴다.
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ needed: true });

  const service = createServiceClient();
  const householdId = await getMyHouseholdId(service, user.id);
  if (!householdId) return NextResponse.json({ needed: true });

  const { count } = await service
    .from("characters")
    .select("id", { count: "exact", head: true })
    .eq("household_id", householdId)
    .eq("managed_only", false)
    .neq("kind", "child");

  return NextResponse.json({ needed: (count ?? 0) < 2 });
}
