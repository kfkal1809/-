import { NextResponse, type NextRequest } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

// 카카오 OAuth 콜백 → 세션 생성 → approved=true → 온보딩 시작 (초대코드 검증 없이 누구나 가입)
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/auth?error=missing_code", request.url));
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(new URL("/auth?error=auth_failed", request.url));
  }

  const service = createServiceClient();

  const { data: existingProfile } = await service
    .from("profiles")
    .select("approved")
    .eq("id", data.user.id)
    .maybeSingle();

  if (existingProfile?.approved) {
    return NextResponse.redirect(new URL("/home", request.url));
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

  return NextResponse.redirect(new URL("/onboarding/me", request.url));
}
