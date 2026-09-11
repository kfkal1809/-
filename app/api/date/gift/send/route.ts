import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getMyHouseholdId } from "@/lib/game/household";
import { kstDateString } from "@/lib/game/kst";
import { DATE_GIFT_REWARD_MIN, DATE_GIFT_REWARD_MAX } from "@/lib/domain/constants";

// 데이트 콘텐츠 2: 선물 보내기. 기존 우편함(mailbox_items) 인프라 위에 그대로 얹는다 —
// 받기/지급 로직은 /api/mailbox/claim을 그대로 재사용하고, 이 라우트는 "하루 1회 발신"
// 게이트(date_gift_logs unique(sender_user_id, send_date))를 먼저 걸어 슬롯을 확보한 뒤
// 우편을 생성한다(store_work_logs와 동일하게 게이트 insert를 먼저 해서 실패 시 롤백이
// 필요 없게 한다). mailbox/send와 달리 관리자 전용이 아니라 household 구성원이면 누구나
// 보낼 수 있다.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { message } = (await request.json()) as { message?: string };
  if (!message) return NextResponse.json({ error: "invalid_payload" }, { status: 400 });

  const service = createServiceClient();
  const householdId = await getMyHouseholdId(service, user.id);
  if (!householdId) return NextResponse.json({ error: "no_household" }, { status: 400 });

  const sendDate = kstDateString();

  const { data: logRow, error: logError } = await service
    .from("date_gift_logs")
    .insert({ household_id: householdId, sender_user_id: user.id, message, send_date: sendDate })
    .select("id")
    .single();

  if (logError) {
    if (logError.code === "23505") return NextResponse.json({ error: "already_sent_today" }, { status: 409 });
    return NextResponse.json({ error: logError.message }, { status: 500 });
  }

  const { data: senderRow } = await service
    .from("character_managers")
    .select("characters!inner(nickname, managed_only)")
    .eq("user_id", user.id)
    .eq("characters.managed_only", false)
    .limit(1)
    .maybeSingle();
  const senderChar = senderRow?.characters as { nickname: string } | { nickname: string }[] | null | undefined;
  const senderNickname = (Array.isArray(senderChar) ? senderChar[0]?.nickname : senderChar?.nickname) || "파트너";

  const reward = DATE_GIFT_REWARD_MIN + Math.floor(Math.random() * (DATE_GIFT_REWARD_MAX - DATE_GIFT_REWARD_MIN + 1));

  const { data: mailboxItem, error: mailError } = await service
    .from("mailbox_items")
    .insert({
      household_id: householdId,
      title: `${senderNickname}가 보낸 선물`,
      body: message,
      cash_reward: reward,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (mailError) return NextResponse.json({ error: mailError.message }, { status: 500 });

  await service.from("date_gift_logs").update({ mailbox_item_id: mailboxItem.id }).eq("id", logRow.id);

  return NextResponse.json({ ok: true, mailboxItemId: mailboxItem.id });
}
