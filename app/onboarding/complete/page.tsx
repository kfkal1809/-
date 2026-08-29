"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppFrame } from "@/components/ui/AppFrame";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { GameIcon } from "@/components/icons/GameIcon";
import { SHIP_NAME } from "@/lib/domain/constants";

export default function OnboardingCompletePage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");
  const [balance, setBalance] = useState(0);
  const [grant, setGrant] = useState(0);
  const [joinCode, setJoinCode] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/onboarding/complete", { method: "POST" })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setBalance(data.balance ?? 0);
        setGrant(data.grant ?? 0);
        setStatus("done");
      })
      .catch(() => setStatus("error"));

    // 상대가 아직 안 왔다면 알려줄 연결 코드 — 실패해도 완료 화면 자체는 그대로 보여준다.
    fetch("/api/household/join-code")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setJoinCode(data?.joinCode ?? null))
      .catch(() => setJoinCode(null));
  }, []);

  return (
    <AppFrame className="items-center justify-center px-6">
      <Card tone="cream" className="w-full text-center">
        {status === "loading" && <p className="py-10 text-[15px] font-bold text-[var(--color-navy-soft)]">가족 정보를 확인하고 있어요...</p>}

        {status === "error" && (
          <div className="py-6">
            <p className="text-[15px] font-bold text-[var(--color-danger)]">문제가 발생했어요. 다시 시도해주세요.</p>
            <Button tone="outline" full className="mt-4" onClick={() => router.refresh()}>
              다시 시도
            </Button>
          </div>
        )}

        {status === "done" && (
          <div className="animate-sparkle">
            <div className="mx-auto flex h-16 w-16 items-center justify-center">
              <GameIcon name="coin" size={64} />
            </div>
            <h1 className="mt-2 text-lg font-extrabold text-[var(--color-navy)]">선용금 지급 완료</h1>
            <p className="mt-1 text-[14px] text-[var(--color-navy-soft)]">신규 승선자 보급 선용금</p>
            <p className="mt-1 text-2xl font-extrabold text-[var(--color-coral)]">+${grant.toFixed(2)}</p>
            <p className="mt-3 text-[13px] text-[var(--color-navy-soft)]">현재 공동 선용금 ${balance.toFixed(2)}</p>

            {joinCode && (
              <div className="mt-5 rounded-2xl border-2 border-dashed border-[var(--color-tab-active)] bg-white px-4 py-3">
                <p className="text-[12px] font-bold text-[var(--color-navy-soft)]">
                  상대가 아직 가입 전이라면 이 코드를 알려주세요
                </p>
                <p className="mt-1 text-xl font-extrabold tracking-widest text-[var(--color-tab-active)]">{joinCode}</p>
                <p className="mt-1 text-[11px] text-[var(--color-navy-soft)]">
                  상대가 카카오 로그인 후 뜨는 화면에서 이 코드를 입력하면 같은 선실로 연결돼요
                </p>
              </div>
            )}

            <Button tone="coral" full className="mt-6" onClick={() => router.push("/home")}>
              {SHIP_NAME}로 출항하기
            </Button>
          </div>
        )}
      </Card>
    </AppFrame>
  );
}
