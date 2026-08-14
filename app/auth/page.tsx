"use client";

import { useState } from "react";
import { AppFrame } from "@/components/ui/AppFrame";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

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
        <p className="mt-2 text-[12px] text-[var(--color-navy-soft)]">
          카카오 계정으로 간편하게 해연결호에 승선해요.
        </p>

        <Button tone="mint" full className="mt-6" onClick={handleKakaoLogin} disabled={loading}>
          {loading ? "연결 중..." : "카카오로 로그인"}
        </Button>

        {error && <p className="mt-3 text-[12px] font-bold text-[var(--color-danger)]">{error}</p>}
      </Card>
    </AppFrame>
  );
}
