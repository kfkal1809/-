"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppFrame } from "@/components/ui/AppFrame";
import { AdultCharacterForm, type AdultCharacterPayload } from "@/components/onboarding/AdultCharacterForm";
import { Button } from "@/components/ui/Button";

export default function OnboardingPartnerPage() {
  const router = useRouter();
  // /onboarding/join으로 연결 코드를 입력해 들어온 사람은 household에 이미 실제 캐릭터가
  // 둘 다 있을 수 있다 — 그럴 땐 이 단계 자체가 필요 없어서 자동으로 건너뛴다.
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/onboarding/partner-needed")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (!data.needed) {
          router.replace("/onboarding/children");
          return;
        }
        setChecking(false);
      })
      .catch(() => setChecking(false));
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleSubmit(payload: AdultCharacterPayload) {
    const res = await fetch("/api/onboarding/partner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("failed");
    router.push("/onboarding/children");
  }

  if (checking) return <AppFrame className="items-center justify-center px-6">{null}</AppFrame>;

  return (
    <AppFrame className="px-5 py-8">
      <p className="mb-4 text-center text-[12px] font-bold text-[var(--color-tab-active)]">STEP 3 / 4</p>
      <AdultCharacterForm
        title="상대의 캐릭터도 만들어요"
        subtitle="아직 상대가 가입하지 않았다면 대신 만들어두세요 — 나중에 상대가 완료 화면에서 연결 코드를 받아 가입하면 이 캐릭터를 그대로 넘겨받아요"
        submitLabel="다음"
        onSubmit={handleSubmit}
        secondary={
          <Button
            tone="outline"
            full
            type="button"
            onClick={() => router.push("/onboarding/children")}
          >
            나중에 만들게요
          </Button>
        }
      />
    </AppFrame>
  );
}
