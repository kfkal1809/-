"use client";

import { useRouter } from "next/navigation";
import { AppFrame } from "@/components/ui/AppFrame";
import { AdultCharacterForm, type AdultCharacterPayload } from "@/components/onboarding/AdultCharacterForm";

export default function OnboardingMePage() {
  const router = useRouter();

  async function handleSubmit(payload: AdultCharacterPayload) {
    const res = await fetch("/api/onboarding/character", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "failed");

    if (data.linkedExisting) {
      router.push("/onboarding/complete");
      return;
    }
    router.push("/onboarding/relationship");
  }

  return (
    <AppFrame className="px-5 py-8">
      <p className="mb-4 text-center text-[11px] font-bold text-[var(--color-tab-active)]">STEP 1 / 4</p>
      <AdultCharacterForm
        title="내 캐릭터를 만들어요"
        subtitle="해연결호에서 사용할 나의 모습이에요"
        submitLabel="다음"
        onSubmit={handleSubmit}
      />
    </AppFrame>
  );
}
