"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppFrame } from "@/components/ui/AppFrame";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const OPTIONS: { value: "dating" | "engaged" | "married"; label: string; emoji: string }[] = [
  { value: "dating", label: "연애중", emoji: "💕" },
  { value: "engaged", label: "약혼", emoji: "💍" },
  { value: "married", label: "부부", emoji: "👨‍👩‍👧" },
];

export default function OnboardingRelationshipPage() {
  const router = useRouter();
  const [value, setValue] = useState<"dating" | "engaged" | "married" | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleNext() {
    if (!value) return;
    setSubmitting(true);
    try {
      await fetch("/api/onboarding/relationship", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ relationStatus: value }),
      });
      router.push("/onboarding/partner");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppFrame className="items-center justify-center px-6">
      <p className="mb-4 text-center text-[12px] font-bold text-[var(--color-tab-active)]">STEP 2 / 4</p>
      <Card tone="cream" className="w-full">
        <h1 className="text-center text-lg font-extrabold text-[var(--color-navy)]">지금 두 분은 어떤 사이인가요?</h1>
        <p className="mt-1 text-center text-[13px] text-[var(--color-navy-soft)]">현실 관계 상태예요. 언제든 바꿀 수 있어요.</p>

        <div className="mt-5 flex flex-col gap-2.5">
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setValue(opt.value)}
              className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left text-[15px] font-bold ${
                value === opt.value ? "border-[var(--color-tab-active)] bg-[var(--color-sky-deep)]" : "border-transparent bg-white"
              }`}
            >
              <span className="text-xl">{opt.emoji}</span>
              {opt.label}
            </button>
          ))}
        </div>

        <Button tone="coral" full className="mt-6" onClick={handleNext} disabled={!value || submitting}>
          {submitting ? "저장 중..." : "다음"}
        </Button>
      </Card>
    </AppFrame>
  );
}
