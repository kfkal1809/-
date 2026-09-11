import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getMyHouseholdId } from "@/lib/game/household";
import { kstDateString } from "@/lib/game/kst";

// 데이트 콘텐츠 5: 커플 한 줄 일기. store_work_logs와 동일하게 하루 1인 1회
// (author_user_id, entry_date) unique index가 게이트다 — 파트너 각자 하루 한 줄씩 남긴다.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { body: content } = (await request.json()) as { body?: string };
  const trimmed = content?.trim();
  if (!trimmed || trimmed.length > 140) return NextResponse.json({ error: "invalid_payload" }, { status: 400 });

  const service = createServiceClient();
  const householdId = await getMyHouseholdId(service, user.id);
  if (!householdId) return NextResponse.json({ error: "no_household" }, { status: 400 });

  const entryDate = kstDateString();

  const { data: entry, error } = await service
    .from("date_diary_entries")
    .insert({ household_id: householdId, author_user_id: user.id, body: trimmed, entry_date: entryDate })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "already_written_today" }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, entryId: entry.id });
}
