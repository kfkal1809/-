import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { kstDateString } from "@/lib/game/kst";

// 기획서 3.19 / FR-GUEST-001: 300자 제한, 10초 재작성 제한, 서로 다른 선실 3회 데일리 미션 카운트.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { cabinSpaceId, body: content } = (await request.json()) as { cabinSpaceId: string; body: string };
  if (!cabinSpaceId || !content?.trim() || content.length > 300) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const service = createServiceClient();

  const { data: recent } = await service
    .from("guestbook_entries")
    .select("created_at")
    .eq("author_user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (recent && Date.now() - new Date(recent.created_at).getTime() < 10_000) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const { data: entry, error } = await service
    .from("guestbook_entries")
    .insert({ cabin_space_id: cabinSpaceId, author_user_id: user.id, body: content.trim() })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await service.from("space_visits").upsert(
    { user_id: user.id, space_id: cabinSpaceId, visited_on: kstDateString() },
    { onConflict: "user_id,space_id,visited_on" }
  );

  return NextResponse.json({ ok: true, entryId: entry.id });
}
