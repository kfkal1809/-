"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AppFrame } from "@/components/ui/AppFrame";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

// /auth/callback에서 exchangeCodeForSession이 실패하면 ?error=auth_failed로 이 페이지에
// 돌아온다 — 예전엔 이 값을 아예 읽지 않아서, 로그인 첫 시도가 조용히 실패해도 사용자
// 눈엔 그냥 "처음 화면으로 돌아온" 것처럼만 보였다(왜 실패했는지 알 방법이 없어 재시도가
// 필요하다는 것도 몰랐다). 최소한 실패했다는 걸 보여주고 다시 시도하도록 안내한다.
function CallbackErrorNotice() {
  const params = useSearchParams();
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const err = params.get("error");
    if (!err) return;
    setMessage(
      err === "missing_code"
        ? "카카오 로그인 정보를 받지 못했어요. 다시 시도해주세요."
        : "로그인에 실패했어요. 다시 한 번 시도해주세요."
    );
  }, [params]);

  if (!message) return null;
  return <p className="mt-3 text-[13px] font-bold text-[var(--color-danger)]">{message}</p>;
}

export default function AuthPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleKakaoLogin() {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "kakao",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (oauthError) throw oauthError;
    } catch {
      setError("카카오 로그인 연결에 실패했어요. 잠시 후 다시 시도해주세요.");
      setLoading(false);
    }
  }

  return (
    <AppFrame className="items-center justify-center px-6">
      <Card tone="cream" className="w-full text-center">
        <h1 className="text-xl font-extrabold text-[var(--color-navy)]">카카오로 승선하기</h1>
        <p className="mt-2 text-[13px] text-[var(--color-navy-soft)]">
          카카오 계정으로 간편하게 해연결호에 승선해요.
        </p>

        <Button tone="mint" full className="mt-6" onClick={handleKakaoLogin} disabled={loading}>
          {loading ? "연결 중..." : "카카오로 로그인"}
        </Button>

        {error && <p className="mt-3 text-[13px] font-bold text-[var(--color-danger)]">{error}</p>}
        <Suspense fallback={null}>
          <CallbackErrorNotice />
        </Suspense>
      </Card>
    </AppFrame>
  );
}
