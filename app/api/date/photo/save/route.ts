import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getMyHouseholdId } from "@/lib/game/household";
import { getWalletBalance } from "@/lib/game/wallet";
import { kstDateString } from "@/lib/game/kst";
import { DATE_PHOTO_REWARD_MIN, DATE_PHOTO_REWARD_MAX, DATE_SPOT_LOCATIONS } from "@/lib/domain/constants";

const VALID_BG_IDS = new Set(DATE_SPOT_LOCATIONS.map((s) => s.key));

// 데이트 콘텐츠 3: 데이트 스팟 인증샷 저장. date_topic_card_logs와 동일하게
// date_photos(household_id, photo_date) unique index가 하루 1회 게이트다 — 커플이 함께
// 찍는 활동이라 household_id 단위로 막는다.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { bgId } = (await request.json()) as { bgId?: string };
  if (!bgId || !VALID_BG_IDS.has(bgId)) return NextResponse.json({ error: "invalid_payload" }, { status: 400 });

  const service = createServiceClient();
  const householdId = await getMyHouseholdId(service, user.id);
  if (!householdId) return NextResponse.json({ error: "no_household" }, { status: 400 });

  const photoDate = kstDateString();
  const reward = DATE_PHOTO_REWARD_MIN + Math.floor(Math.random() * (DATE_PHOTO_REWARD_MAX - DATE_PHOTO_REWARD_MIN + 1));

  const { data: photo, error: insertError } = await service
    .from("date_photos")
    .insert({ household_id: householdId, bg_id: bgId, taken_by: user.id, reward, photo_date: photoDate })
    .select("id, bg_id, created_at")
    .single();

  if (insertError) {
    if (insertError.code === "23505") return NextResponse.json({ error: "already_done_today" }, { status: 409 });
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  await service.rpc("apply_wallet_transaction", {
    p_household_id: householdId,
    p_amount: reward,
    p_type: "date_photo",
    p_idempotency_key: `date_photo:${householdId}:${photoDate}`,
    p_metadata: { bgId },
    p_created_by: user.id,
  });

  const balance = await getWalletBalance(service, householdId);
  return NextResponse.json({
    ok: true,
    reward,
    balance,
    photo: { id: photo.id, bgId: photo.bg_id, createdAt: photo.created_at },
  });
}
