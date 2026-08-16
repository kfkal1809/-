import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { incrementMission, incrementDistinctMission } from "@/lib/game/missions";
import { kstDateString } from "@/lib/game/kst";

type PingSpace = "bonppuri" | "liri" | "deck" | "cabin";

// 방문형 데일리/위클리 미션(visit_bonppuri/visit_liri/visit_deck/deck_visit4/cabin_visit5) 진행도 증가.
// Next.js Link prefetch는 서버 컴포넌트 렌더만 미리 수행하고 클라이언트 컴포넌트는 마운트하지
// 않으므로, 클라이언트 쪽 useEffect에서만 이 라우트를 호출해 prefetch로 인한 오탐 증가를 막는다
// (components/duties/MissionPing.tsx 참고).
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { space, cabinHouseholdId } = (await request.json()) as { space: PingSpace; cabinHouseholdId?: string };
  const service = createServiceClient();

  switch (space) {
    case "bonppuri":
      await incrementMission(service, user.id, "visit_bonppuri");
      break;
    case "liri":
      await incrementMission(service, user.id, "visit_liri");
      break;
    case "deck":
      await incrementMission(service, user.id, "visit_deck");
      await incrementDistinctMission(service, user.id, "deck_visit4", kstDateString());
      break;
    case "cabin":
      if (cabinHouseholdId) {
        await incrementDistinctMission(service, user.id, "cabin_visit5", cabinHouseholdId);
      }
      break;
    default:
      return NextResponse.json({ error: "invalid_space" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
