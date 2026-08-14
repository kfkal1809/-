"use client";

import { useRouter } from "next/navigation";
import { AppFrame } from "@/components/ui/AppFrame";
import { AdultCharacterForm, type AdultCharacterPayload } from "@/components/onboarding/AdultCharacterForm";
import { Button } from "@/components/ui/Button";

export default function OnboardingPartnerPage() {
  const router = useRouter();

  async function handleSubmit(payload: AdultCharacterPayload) {
    const res = await fetch("/api/onboarding/partner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("failed");
    router.push("/onboarding/children");
  }

  return (
    <AppFrame className="px-5 py-8">
      <p className="mb-4 text-center text-[11px] font-bold text-[var(--color-tab-active)]">STEP 3 / 4</p>
      <AdultCharacterForm
        title="상대의 캐릭터도 만들어요"
        subtitle="아직 상대가 가입하지 않았다면, 초대코드로 나중에 연결할 수 있어요"
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
