import { NextResponse, type NextRequest } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

// 기획서 3.2: 카카오 OAuth 콜백 → 세션 생성 → 초대코드와 사용자 연결 → approved=true → 온보딩 시작
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const inviteCode = request.cookies.get("invite_code")?.value;

  if (!code) {
    return NextResponse.redirect(new URL("/join?error=missing_code", request.url));
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(new URL("/join?error=auth_failed", request.url));
  }

  const service = createServiceClient();

  const { data: existingProfile } = await service
    .from("profiles")
    .select("approved")
    .eq("id", data.user.id)
    .maybeSingle();

  // 이미 승인된 기존 사용자의 재로그인 — 초대코드 없이도 통과
  if (existingProfile?.approved) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  if (!inviteCode) {
    return NextResponse.redirect(new URL("/join?error=missing_invite", request.url));
  }

  const { data: invite } = await service
    .from("invite_codes")
    .select("*")
    .eq("code", inviteCode)
    .eq("active", true)
    .maybeSingle();

  const inviteValid =
    invite && invite.used_count < invite.max_uses && (!invite.expires_at || new Date(invite.expires_at) > new Date());

  if (!inviteValid) {
    return NextResponse.redirect(new URL("/join?error=invalid_invite", request.url));
  }

  await service.from("profiles").upsert(
    {
      id: data.user.id,
      kakao_user_id: data.user.user_metadata?.provider_id ?? null,
      nickname: data.user.user_metadata?.nickname ?? data.user.user_metadata?.name ?? "새 승선자",
      approved: true,
    },
    { onConflict: "id" }
  );

  await service.from("invite_codes").update({ used_count: invite.used_count + 1 }).eq("id", invite.id);

  const res = NextResponse.redirect(new URL("/onboarding/me", request.url));
  res.cookies.set("invite_code", "", { path: "/", maxAge: 0 });
  // 파트너 초대(초대장에 target_character_id가 있는 경우)는 온보딩에서 기존 캐릭터에 연결한다.
  if (invite.type === "partner" && invite.target_character_id) {
    res.cookies.set("partner_target_character", invite.target_character_id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 30,
      path: "/",
    });
  }
  return res;
}
