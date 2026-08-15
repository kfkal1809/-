import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { kstDateString } from "@/lib/game/kst";
import { verifyKakaoAttendanceNonce } from "@/lib/kakao/shareAuth";

// 기획서 3.8 / 5.14 / FR-ATT-002: 카카오톡 공유 성공 웹훅.
// 실제 카카오 웹훅 payload의 정확한 필드명은 카카오 디벨로퍼스 콘솔에서 테스트 웹훅을 한 번
// 받아본 뒤 최종 확인이 필요하다 — 아래는 기획서에 명시된 개념(CHAT_TYPE/HASH_CHAT_ID/
// serverCallbackArgs)을 카카오 SDK의 통상적인 필드명(chat_type/hashed_chat_id/extras)에
// 맞춰 구현했고, 흔한 변형(serverCallbackArgs 원문 키 등)도 함께 허용한다.
interface KakaoWebhookBody {
  chat_type?: string;
  CHAT_TYPE?: string;
  hashed_chat_id?: string;
  HASH_CHAT_ID?: string;
  extras?: Record<string, unknown>;
  serverCallbackArgs?: Record<string, unknown> | string;
}

function extractCallbackArgs(body: KakaoWebhookBody): { userId?: string; date?: string; nonce?: string } {
  const raw = body.extras ?? body.serverCallbackArgs ?? {};
  const parsed = typeof raw === "string" ? safeJsonParse(raw) : raw;
  return {
    userId: typeof parsed?.userId === "string" ? parsed.userId : undefined,
    date: typeof parsed?.date === "string" ? parsed.date : undefined,
    nonce: typeof parsed?.nonce === "string" ? parsed.nonce : undefined,
  };
}

function safeJsonParse(s: string): Record<string, unknown> {
  try {
    return JSON.parse(s);
  } catch {
    return {};
  }
}

export async function POST(request: Request) {
  const adminKey = process.env.KAKAO_PRIMARY_ADMIN_KEY;
  const openchatHash = process.env.HAEYEONGYEOL_OPENCHAT_HASH;
  if (!adminKey || !openchatHash) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  const authHeader = request.headers.get("authorization") ?? "";
  if (authHeader !== `KakaoAK ${adminKey}`) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const resourceId = request.headers.get("x-kakao-resource-id");
  if (!resourceId) return NextResponse.json({ error: "missing_resource_id" }, { status: 400 });

  const service = createServiceClient();

  // resource id 중복 검증 — 웹훅 replay 차단 (기획서 4.34, E2E #6)
  const { error: dedupeError } = await service.from("kakao_webhook_receipts").insert({ resource_id: resourceId });
  if (dedupeError) {
    // 23505 = 이미 처리한 웹훅. 그 외 에러는 그대로 실패 처리.
    if (dedupeError.code === "23505") return NextResponse.json({ ok: true, duplicate: true });
    return NextResponse.json({ error: dedupeError.message }, { status: 500 });
  }

  const body = (await request.json().catch(() => ({}))) as KakaoWebhookBody;

  const chatType = body.chat_type ?? body.CHAT_TYPE;
  if (chatType !== "OpenMultiChat") return NextResponse.json({ error: "not_group_openchat" }, { status: 400 });

  const hashedChatId = body.hashed_chat_id ?? body.HASH_CHAT_ID;
  if (hashedChatId !== openchatHash) return NextResponse.json({ error: "wrong_openchat" }, { status: 400 });

  const { userId, date, nonce } = extractCallbackArgs(body);
  if (!userId || !date || !nonce) return NextResponse.json({ error: "missing_callback_args" }, { status: 400 });

  const today = kstDateString();
  if (date !== today) return NextResponse.json({ error: "stale_nonce" }, { status: 400 });
  if (!verifyKakaoAttendanceNonce(userId, date, nonce)) return NextResponse.json({ error: "invalid_nonce" }, { status: 400 });

  const { data: membership } = await service.from("household_users").select("household_id").eq("user_id", userId).maybeSingle();
  if (!membership) return NextResponse.json({ error: "no_household" }, { status: 400 });

  // 하루 1회 — unique(user_id, date, type) 위반이면 이미 지급된 것으로 간주(기획서 E2E #5와 동일한 원칙).
  const { error: attendanceError } = await service
    .from("attendance")
    .insert({ user_id: userId, type: "kakao", date: today, resource_id: resourceId });
  if (attendanceError && attendanceError.code !== "23505") {
    return NextResponse.json({ error: attendanceError.message }, { status: 500 });
  }
  if (attendanceError?.code === "23505") return NextResponse.json({ ok: true, already: true });

  const { error: rpcError } = await service.rpc("apply_wallet_transaction", {
    p_household_id: membership.household_id,
    p_amount: 1,
    p_type: "kakao_attendance",
    p_idempotency_key: `kakao_attendance:${userId}:${today}`,
    p_metadata: { resource_id: resourceId },
    p_created_by: userId,
  });
  if (rpcError) return NextResponse.json({ error: rpcError.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
