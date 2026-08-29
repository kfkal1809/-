"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppFrame } from "@/components/ui/AppFrame";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

// 온보딩 맨 앞 — 상대가 이미 가입해서 만들어둔 household가 있으면 그 연결 코드로
// 합류하고, 없으면(대부분의 경우) 그냥 새로 시작한다. 예전 초대코드 게이트와 달리
// 이건 선택 사항이라 "코드 없이 시작" 버튼으로 바로 건너뛸 수 있다.
export default function OnboardingJoinPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleJoin() {
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/onboarding/join-household", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(
          data.error === "code_not_found" ? "코드를 찾을 수 없어요. 다시 확인해주세요." : "연결에 실패했어요. 다시 시도해주세요."
        );
        setLoading(false);
        return;
      }
      router.push("/onboarding/me");
    } catch {
      setError("연결에 실패했어요. 다시 시도해주세요.");
      setLoading(false);
    }
  }

  return (
    <AppFrame className="items-center justify-center px-6">
      <Card tone="cream" className="w-full">
        <h1 className="text-center text-lg font-extrabold text-[var(--color-navy)]">
          상대가 먼저 가입했나요?
        </h1>
        <p className="mt-2 text-center text-[13px] text-[var(--color-navy-soft)]">
          상대에게 받은 연결 코드가 있으면 입력해주세요. 같은 선실을 함께 쓰게 돼요.
        </p>

        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="예) A1B2C3"
          autoCapitalize="characters"
          maxLength={6}
          className="mt-5 w-full rounded-2xl border-2 border-[var(--color-navy)]/10 bg-white px-4 py-3 text-center text-[16px] font-bold tracking-widest text-[var(--color-navy)] outline-none focus:border-[var(--color-tab-active)]"
        />
        {error && <p className="mt-2 text-center text-[13px] font-bold text-[var(--color-danger)]">{error}</p>}

        <div className="mt-5 flex flex-col gap-2.5">
          <Button tone="coral" full onClick={handleJoin} disabled={!code.trim() || loading}>
            {loading ? "연결 중..." : "코드로 연결하기"}
          </Button>
          <Button tone="outline" full onClick={() => router.push("/onboarding/me")} disabled={loading}>
            코드 없이 새로 시작할게요
          </Button>
        </div>
      </Card>
    </AppFrame>
  );
}
