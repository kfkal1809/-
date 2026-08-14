import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

// 기획서 3.1: 초대코드 검증. 무효/만료/소진 시 내부 진입을 차단한다.
export async function POST(request: Request) {
  let body: { code?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ valid: false, error: "잘못된 요청이에요." }, { status: 400 });
  }

  const code = body.code?.trim().toUpperCase();
  if (!code) {
    return NextResponse.json({ valid: false, error: "초대코드를 입력해주세요." }, { status: 400 });
  }

  const service = createServiceClient();
  const { data: invite } = await service
    .from("invite_codes")
    .select("code, type, active, expires_at, max_uses, used_count")
    .eq("code", code)
    .maybeSingle();

  if (!invite || !invite.active) {
    return NextResponse.json({ valid: false, error: "유효하지 않은 초대코드예요." }, { status: 404 });
  }
  if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
    return NextResponse.json({ valid: false, error: "만료된 초대코드예요." }, { status: 410 });
  }
  if (invite.used_count >= invite.max_uses) {
    return NextResponse.json({ valid: false, error: "이미 모두 사용된 초대코드예요." }, { status: 410 });
  }

  const res = NextResponse.json({ valid: true, type: invite.type });
  res.cookies.set("invite_code", code, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 30,
    path: "/",
  });
  return res;
}
