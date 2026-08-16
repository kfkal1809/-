import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { WALLPAPER_SWATCHES, FLOOR_SWATCHES } from "@/lib/domain/cabinDecor";

const WALLPAPER_KEYS = new Set(WALLPAPER_SWATCHES.map((s) => s.key));
const FLOOR_KEYS = new Set(FLOOR_SWATCHES.map((s) => s.key));

// 벽지/바닥재는 본인 가족 선실만 바꿀 수 있다 — save-layout과 동일하게 소유권을 서버가 재검증.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { spaceId, wallpaper, floor } = (await request.json()) as {
    spaceId: string;
    wallpaper?: string | null;
    floor?: string | null;
  };
  if (!spaceId) return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  if (wallpaper != null && !WALLPAPER_KEYS.has(wallpaper)) return NextResponse.json({ error: "invalid_wallpaper" }, { status: 400 });
  if (floor != null && !FLOOR_KEYS.has(floor)) return NextResponse.json({ error: "invalid_floor" }, { status: 400 });

  const service = createServiceClient();

  const { data: membership } = await service.from("household_users").select("household_id").eq("user_id", user.id).maybeSingle();
  if (!membership) return NextResponse.json({ error: "no_household" }, { status: 400 });

  const { data: space } = await service.from("spaces").select("id, household_id, type, metadata").eq("id", spaceId).maybeSingle();
  if (!space || space.type !== "cabin" || space.household_id !== membership.household_id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const metadata = { ...((space.metadata as Record<string, unknown>) ?? {}) };
  if (wallpaper !== undefined) metadata.wallpaper = wallpaper;
  if (floor !== undefined) metadata.floor = floor;

  const { error } = await service.from("spaces").update({ metadata }).eq("id", spaceId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
