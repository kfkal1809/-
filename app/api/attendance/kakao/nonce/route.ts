import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { kstDateString } from "@/lib/game/kst";
import { signKakaoAttendanceNonce } from "@/lib/kakao/shareAuth";

// 카카오톡 공유 버튼을 누르기 직전에 프론트가 호출 — serverCallbackArgs에 실어 보낼
// user/date/nonce를 발급한다(기획서 3.8).
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const date = kstDateString();
  const nonce = signKakaoAttendanceNonce(user.id, date);

  return NextResponse.json({ userId: user.id, date, nonce });
}
